import Image from "next/image";
import { galleryItems } from "@/content/gallery";

export const metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Gallery</p>
        <h1>Image Signals</h1>
        <p>Collected skies, interface moods, screenshots, and fragments of light.</p>
      </header>
      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <article className="gallery-card" key={item.title}>
            <Image src={item.image} alt="" width={960} height={540} />
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </>
  );
}
