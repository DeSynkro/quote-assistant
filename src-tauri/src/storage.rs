use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_fs::{FsExt, OpenOptions};

const PRESET_SCHEMA_VERSION: u32 = 1;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preset {
    pub id: String,
    pub name: String,
    pub volume_capacity: String,
    pub weight_capacity: String,
    pub fuel_consumption: String,
    pub price_per_truck: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PresetState {
    #[serde(default = "preset_schema_version")]
    pub schema_version: u32,
    #[serde(default)]
    pub presets: Vec<Preset>,
    #[serde(default)]
    pub selected_id: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Job {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub saved_at: String,
    #[serde(default)]
    pub summary: String,
    pub data: Value,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportRequest {
    pub contents: String,
    pub default_name: String,
}

fn preset_schema_version() -> u32 {
    PRESET_SCHEMA_VERSION
}

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve the app data folder: {error}"))
}

fn ensure_dirs(base: &Path) -> Result<(), String> {
    fs::create_dir_all(base.join("jobs"))
        .map_err(|error| format!("Could not create the jobs folder: {error}"))?;
    fs::create_dir_all(base.join("trash"))
        .map_err(|error| format!("Could not create the trash folder: {error}"))?;
    Ok(())
}

fn valid_id(id: &str) -> bool {
    !id.is_empty()
        && id.len() <= 128
        && id != "."
        && id != ".."
        && id.chars().all(|character| {
            character.is_ascii_alphanumeric()
                || character == '-'
                || character == '_'
                || character == '.'
        })
}

fn atomic_write(path: &Path, contents: &str) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "The target path has no parent folder.".to_string())?;
    fs::create_dir_all(parent)
        .map_err(|error| format!("Could not create the data folder: {error}"))?;

    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or_default();
    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("data.json");
    let temp = parent.join(format!(".{file_name}.{stamp}.tmp"));

    fs::write(&temp, contents)
        .map_err(|error| format!("Could not write the temporary file: {error}"))?;

    if let Err(move_error) = fs::rename(&temp, path) {
        let _ = fs::remove_file(path);
        if let Err(rename_error) = fs::rename(&temp, path) {
            let _ = fs::remove_file(&temp);
            return Err(format!(
                "Could not replace the data file: {move_error}; {rename_error}"
            ));
        }
    }

    Ok(())
}

fn load_jobs_from_dir(base: &Path) -> Result<Vec<Job>, String> {
    ensure_dirs(base)?;
    let jobs_dir = base.join("jobs");
    let entries = fs::read_dir(&jobs_dir)
        .map_err(|error| format!("Could not read the jobs folder: {error}"))?;
    let mut jobs = Vec::new();

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|extension| extension.to_str()) != Some("json") {
            continue;
        }

        let Ok(raw) = fs::read_to_string(&path) else {
            continue;
        };
        let Ok(job) = serde_json::from_str::<Job>(&raw) else {
            continue;
        };

        if valid_id(&job.id) {
            jobs.push(job);
        }
    }

    jobs.sort_by(|left, right| {
        right
            .saved_at
            .cmp(&left.saved_at)
            .then_with(|| left.name.cmp(&right.name))
    });

    Ok(jobs)
}

fn save_job_to_dir(base: &Path, job: &Job) -> Result<(), String> {
    ensure_dirs(base)?;
    if !valid_id(&job.id) {
        return Err("Job id is not valid.".to_string());
    }
    if job.name.trim().is_empty() {
        return Err("Job name is required.".to_string());
    }

    let target = base.join("jobs").join(format!("{}.json", job.id));
    let contents = serde_json::to_string_pretty(job)
        .map_err(|error| format!("Could not serialize the job: {error}"))?;
    atomic_write(&target, &format!("{contents}\n"))
}

fn delete_job_from_dir(base: &Path, id: &str) -> Result<(), String> {
    if !valid_id(id) {
        return Err("Job id is not valid.".to_string());
    }
    ensure_dirs(base)?;

    let target = base.join("jobs").join(format!("{id}.json"));
    if !target.exists() {
        return Ok(());
    }

    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    let trash = base.join("trash").join(format!("{id}-{stamp}.json"));
    fs::rename(&target, &trash).map_err(|error| format!("Could not move the job to trash: {error}"))
}

fn read_presets_from_dir(base: &Path) -> Result<PresetState, String> {
    ensure_dirs(base)?;
    let path = base.join("presets.json");
    if !path.exists() {
        return Ok(PresetState {
            schema_version: PRESET_SCHEMA_VERSION,
            presets: Vec::new(),
            selected_id: None,
        });
    }

    let raw = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read truck presets: {error}"))?;
    let mut state = serde_json::from_str::<PresetState>(&raw)
        .map_err(|error| format!("Could not parse truck presets: {error}"))?;
    state.schema_version = PRESET_SCHEMA_VERSION;
    state
        .presets
        .retain(|preset| !preset.id.trim().is_empty() && !preset.name.trim().is_empty());
    if let Some(selected_id) = &state.selected_id {
        if !state.presets.iter().any(|preset| preset.id == *selected_id) {
            state.selected_id = None;
        }
    }
    Ok(state)
}

fn save_presets_to_dir(base: &Path, state: &PresetState) -> Result<(), String> {
    ensure_dirs(base)?;
    let mut normalized = state.clone();
    normalized.schema_version = PRESET_SCHEMA_VERSION;
    normalized
        .presets
        .retain(|preset| !preset.id.trim().is_empty() && !preset.name.trim().is_empty());
    if let Some(selected_id) = &normalized.selected_id {
        if !normalized
            .presets
            .iter()
            .any(|preset| preset.id == *selected_id)
        {
            normalized.selected_id = None;
        }
    }

    let contents = serde_json::to_string_pretty(&normalized)
        .map_err(|error| format!("Could not serialize truck presets: {error}"))?;
    atomic_write(&base.join("presets.json"), &format!("{contents}\n"))
}

#[tauri::command]
pub fn load_jobs(app: AppHandle) -> Result<Vec<Job>, String> {
    let base = app_data_dir(&app)?;
    load_jobs_from_dir(&base)
}

#[tauri::command]
pub fn save_job(app: AppHandle, job: Job) -> Result<(), String> {
    let base = app_data_dir(&app)?;
    save_job_to_dir(&base, &job)
}

#[tauri::command]
pub fn delete_job(app: AppHandle, id: String) -> Result<(), String> {
    let base = app_data_dir(&app)?;
    delete_job_from_dir(&base, &id)
}

#[tauri::command]
pub fn load_presets(app: AppHandle) -> Result<PresetState, String> {
    let base = app_data_dir(&app)?;
    read_presets_from_dir(&base)
}

#[tauri::command]
pub fn save_presets(app: AppHandle, state: PresetState) -> Result<(), String> {
    let base = app_data_dir(&app)?;
    save_presets_to_dir(&base, &state)
}

#[tauri::command]
pub async fn export_data(app: AppHandle, request: ExportRequest) -> Result<Option<String>, String> {
    let Some(file_path) = app
        .dialog()
        .file()
        .set_title("Export Quote Assistant data")
        .set_file_name(request.default_name)
        .add_filter("JSON", &["json"])
        .blocking_save_file()
    else {
        return Ok(None);
    };

    if let Ok(mut path) = file_path.clone().into_path() {
        if path.extension().is_none() {
            path.set_extension("json");
        }
        atomic_write(&path, &request.contents)?;
        return Ok(Some(path.display().to_string()));
    }

    let display_path = file_path.to_string();
    let mut options = OpenOptions::new();
    options.write(true).create(true).truncate(true);
    let mut file = app
        .fs()
        .open(file_path, options)
        .map_err(|error| format!("Could not open the selected file: {error}"))?;
    file.write_all(request.contents.as_bytes())
        .map_err(|error| format!("Could not write the backup: {error}"))?;
    Ok(Some(display_path))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn sample_job(id: &str, name: &str, saved_at: &str) -> Job {
        Job {
            id: id.to_string(),
            name: name.to_string(),
            saved_at: saved_at.to_string(),
            summary: "1 truck".to_string(),
            data: serde_json::json!({ "sections": [] }),
        }
    }

    #[test]
    fn saves_and_loads_jobs() {
        let directory = tempdir().unwrap();
        let job = sample_job("job-1", "Front yard", "2026-10-25T10:00:00.000Z");
        save_job_to_dir(directory.path(), &job).unwrap();
        let jobs = load_jobs_from_dir(directory.path()).unwrap();
        assert_eq!(jobs.len(), 1);
        assert_eq!(jobs[0].id, "job-1");
    }

    #[test]
    fn sorts_jobs_newest_first() {
        let directory = tempdir().unwrap();
        save_job_to_dir(
            directory.path(),
            &sample_job("job-1", "Older", "2026-10-24T10:00:00.000Z"),
        )
        .unwrap();
        save_job_to_dir(
            directory.path(),
            &sample_job("job-2", "Newer", "2026-10-25T10:00:00.000Z"),
        )
        .unwrap();
        let jobs = load_jobs_from_dir(directory.path()).unwrap();
        assert_eq!(jobs[0].id, "job-2");
    }

    #[test]
    fn deletes_jobs_to_trash() {
        let directory = tempdir().unwrap();
        save_job_to_dir(
            directory.path(),
            &sample_job("job-1", "Front yard", "2026-10-25T10:00:00.000Z"),
        )
        .unwrap();
        delete_job_from_dir(directory.path(), "job-1").unwrap();
        assert!(load_jobs_from_dir(directory.path()).unwrap().is_empty());
        assert_eq!(
            fs::read_dir(directory.path().join("trash"))
                .unwrap()
                .count(),
            1
        );
    }

    #[test]
    fn rejects_unsafe_job_ids() {
        let directory = tempdir().unwrap();
        let job = sample_job("../escape", "Bad", "");
        assert!(save_job_to_dir(directory.path(), &job).is_err());
        assert!(delete_job_from_dir(directory.path(), "../escape").is_err());
    }

    #[test]
    fn saves_and_loads_presets() {
        let directory = tempdir().unwrap();
        let state = PresetState {
            schema_version: PRESET_SCHEMA_VERSION,
            presets: vec![Preset {
                id: "truck-1".to_string(),
                name: "Tipper".to_string(),
                volume_capacity: "6.5".to_string(),
                weight_capacity: "8".to_string(),
                fuel_consumption: "8.2".to_string(),
                price_per_truck: "800".to_string(),
            }],
            selected_id: Some("truck-1".to_string()),
        };
        save_presets_to_dir(directory.path(), &state).unwrap();
        let loaded = read_presets_from_dir(directory.path()).unwrap();
        assert_eq!(loaded.presets.len(), 1);
        assert_eq!(loaded.selected_id.as_deref(), Some("truck-1"));
    }
}
