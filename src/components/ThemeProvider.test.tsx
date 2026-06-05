import { act } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { hydrateRoot, type Root } from "react-dom/client";
import { screen, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function ThemeProbe() {
  const { theme } = useTheme();
  return <span data-testid="theme-value">{theme}</span>;
}

describe("ThemeProvider", () => {
  let root: Root | null = null;

  afterEach(() => {
    if (root) {
      root.unmount();
      root = null;
    }

    document.body.innerHTML = "";
    document.documentElement.dataset.theme = "";
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("hydrates without mismatching a preloaded saved theme", async () => {
    const documentRef = document;
    vi.stubGlobal("document", undefined);
    const serverHtml = renderToString(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    vi.stubGlobal("document", documentRef);

    document.documentElement.dataset.theme = "archive";
    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.appendChild(container);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      root = hydrateRoot(
        container,
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      );
    });

    await waitFor(() => expect(screen.getByTestId("theme-value")).toHaveTextContent("archive"));
    expect(errorSpy.mock.calls.flat().join("\n")).not.toContain("hydration");
  });
});
