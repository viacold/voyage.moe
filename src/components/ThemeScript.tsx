export function ThemeScript() {
  const code = `
    try {
      var stored = localStorage.getItem("voyage-theme");
      var preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "clear";
      document.documentElement.dataset.theme = stored || preferred;
    } catch (error) {
      document.documentElement.dataset.theme = "clear";
    }
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
