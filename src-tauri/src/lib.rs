mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            storage::load_jobs,
            storage::save_job,
            storage::delete_job,
            storage::load_presets,
            storage::save_presets,
            storage::export_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Quote Assistant");
}
