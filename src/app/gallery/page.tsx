import Image from "next/image";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { galleryItems } from "@/content/gallery";

export const metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <>
      <SiteHeader />
      <main className="site-main page-stack">
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
      </main>
      <SiteFooter />
    </>
  );
}
