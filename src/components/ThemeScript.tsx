export function ThemeScript() {
  const code = `
    try {
      var stored = localStorage.getItem("voyage-theme");
      var preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "clear";
      var theme = stored || preferred;
      document.documentElement.dataset.theme = theme;
      document.body.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme === "night" ? "dark" : "light";
    } catch (error) {
      document.documentElement.dataset.theme = "clear";
      if (document.body) {
        document.body.dataset.theme = "clear";
      }
    }
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
