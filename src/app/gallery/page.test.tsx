import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import GalleryPage from "./page";

vi.mock("@/lib/media-library", () => ({
  listMediaAssets: vi.fn(async () => [
    {
      filename: "20260607-gallery-shot.webp",
      url: "/uploads/20260607-gallery-shot.webp",
      size: 2048,
      type: "image/webp",
      updatedAt: "2026-06-07T00:00:00.000Z",
    },
  ]),
}));

describe("GalleryPage", () => {
  test("shows curated gallery items and uploaded media", async () => {
    render(await GalleryPage());

    expect(screen.getByRole("heading", { name: /精选内容/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /媒体库图片/i })).toBeInTheDocument();
    expect(screen.getByText("Morning Sky")).toBeInTheDocument();
    expect(screen.getByText("Quiet Interface")).toBeInTheDocument();
    expect(screen.getByText("20260607 gallery shot")).toBeInTheDocument();
    expect(screen.getByText(/2026\/06\/07/)).toBeInTheDocument();
  });
});
