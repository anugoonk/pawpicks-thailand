"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  const images = [{ src: product.image, alt: product.name }, ...product.details.images];
  const current = images[selected] ?? images[0];
  return <div className="product-gallery">
    <div className={`product-detail-image ${selected === 0 ? product.imageCrop ?? "" : "gallery-photo"}`}>
      <img src={current.src} alt={current.alt} />
      {product.badge ? <span className={`badge${product.badgeDark ? " dark" : ""}`}>{product.badge}</span> : null}
    </div>
    {images.length > 1 ? <div className="gallery-thumbnails" aria-label="รูปสินค้า">
      {images.map((image, index) => <button key={`${image.src}-${index}`} type="button" aria-label={`ดูรูป ${index + 1}: ${image.alt}`} aria-pressed={selected === index} onClick={() => setSelected(index)}>
        <img src={image.src} alt="" loading="lazy" />
      </button>)}
    </div> : null}
  </div>;
}
