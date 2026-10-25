(function () {
  try {
    const raw = localStorage.getItem("quote-assistant.preferences");
    if (!raw) {
      return;
    }
    const data = JSON.parse(raw);
    if (!data || data.schemaVersion !== 1 || !data.preferences) {
      return;
    }
    const theme = data.preferences.theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : data.preferences.theme;
    if (theme === "light") {
      document.documentElement.dataset.theme = "light";
    }
    if (data.preferences.reduceMotion === true) {
      document.documentElement.dataset.reduceMotion = "true";
    }
  } catch (error) {
    return;
  }
})();
