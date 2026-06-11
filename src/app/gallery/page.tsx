import Image from "next/image";
import Link from "next/link";
import { galleryItems } from "@/content/gallery";
import { formatDate } from "@/lib/format";
import { listMediaAssets } from "@/lib/media-library";

export const metadata = { title: "相册" };

function titleFromFilename(filename: string) {
  return filename
    .replace(/^\d+-[0-9a-f]+-/i, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim() || filename;
}

export default async function GalleryPage() {
  const media = await listMediaAssets();

  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">相册</p>
        <h1>Image Signals</h1>
        <p>Collected skies, interface moods, screenshots, and fragments of light.</p>
      </header>

      <section className="gallery-section">
        <div className="section-heading">
          <h2>精选内容</h2>
          <Link href="/admin/media">媒体库</Link>
        </div>
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <article className="gallery-card" key={item.title}>
              <Image src={item.image} alt={item.title} width={960} height={540} />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery-section">
        <div className="section-heading">
          <h2>媒体库图片</h2>
          <Link href="/admin/media">管理图片</Link>
        </div>

        {media.length ? (
          <div className="gallery-grid">
            {media.map((asset) => (
              <article className="gallery-card" key={asset.filename}>
                <Image src={asset.url} alt={asset.filename} width={960} height={540} />
                <h3>{titleFromFilename(asset.filename)}</h3>
                <p>
                  {asset.type || "image"} · {formatDate(asset.updatedAt.slice(0, 10))} · {asset.filename}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-editor-hint">媒体库里暂时还没有图片，先去后台上传一张吧。</p>
        )}
      </section>
    </>
  );
}
