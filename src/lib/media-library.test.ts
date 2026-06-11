import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { deleteMediaAsset, listMediaAssets, saveMediaAsset, setMediaDirectoryForTest } from "./media-library";

async function createTempDirectory() {
  return fs.mkdtemp(path.join(os.tmpdir(), "voyage-media-"));
}

function createUploadFile(name: string, type: string, bytes: number[]) {
  return {
    name,
    type,
    async arrayBuffer() {
      return new Uint8Array(bytes).buffer;
    },
  };
}

afterEach(() => {
  setMediaDirectoryForTest(null);
});

describe("media library", () => {
  it("saves an uploaded image and exposes a public url", async () => {
    const directory = await createTempDirectory();
    setMediaDirectoryForTest(directory);

    const asset = await saveMediaAsset(createUploadFile("Hero Shot.PNG", "image/png", [137, 80, 78, 71, 13, 10, 26, 10]) as File);

    expect(asset.filename).toMatch(/hero-shot\.png$/);
    expect(asset.url).toMatch(/^\/uploads\//);

    const files = await fs.readdir(directory);
    expect(files).toHaveLength(1);
  });

  it("lists uploaded images newest first", async () => {
    const directory = await createTempDirectory();
    setMediaDirectoryForTest(directory);

    await saveMediaAsset(createUploadFile("first.webp", "image/webp", [1, 2, 3]) as File);
    await new Promise((resolve) => setTimeout(resolve, 5));
    await saveMediaAsset(createUploadFile("second.webp", "image/webp", [4, 5, 6]) as File);

    const assets = await listMediaAssets();

    expect(assets).toHaveLength(2);
    expect(assets[0].filename).toContain("second");
    expect(assets[1].filename).toContain("first");
  });

  it("deletes an uploaded image", async () => {
    const directory = await createTempDirectory();
    setMediaDirectoryForTest(directory);

    const asset = await saveMediaAsset(createUploadFile("remove-me.webp", "image/webp", [1, 2, 3]) as File);
    await deleteMediaAsset(asset.filename);

    const files = await fs.readdir(directory);
    expect(files).toHaveLength(0);
  });
});
