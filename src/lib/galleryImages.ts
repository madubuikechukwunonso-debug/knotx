export type GalleryCategory =
  | "knotless"
  | "stitch braid"
  | "creative"
  | "luxury"
  | "patewo"
  | "chuku/up do";

export type GalleryImage = {
  id: number;
  src: string;
  alt: string;
  category: GalleryCategory;
};

export const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "/images/hero/hero-1.jpg",
    alt: "Luxury braided hairstyle showcase 1",
    category: "knotless",
  },
  {
    id: 2,
    src: "/images/hero/hero-2.jpg",
    alt: "Luxury braided hairstyle showcase 2",
    category: "stitch braid",
  },
  {
    id: 3,
    src: "/images/hero/hero-3.jpg",
    alt: "Luxury braided hairstyle showcase 3",
    category: "creative",
  },
  {
    id: 4,
    src: "/images/hero/hero-4.jpg",
    alt: "Luxury braided hairstyle showcase 4",
    category: "stitch braid",
  },
  {
    id: 5,
    src: "/images/hero/hero-5.jpg",
    alt: "Luxury braided hairstyle showcase 5",
    category: "luxury",
  },
  {
    id: 6,
    src: "/images/hero/hero-6.jpg",
    alt: "Luxury braided hairstyle showcase 6",
    category: "patewo",
  },
  {
    id: 7,
    src: "/images/hero/hero-7.jpg",
    alt: "Luxury braided hairstyle showcase 7",
    category: "chuku/up do",
  },
  {
    id: 8,
    src: "/images/hero/hero-8.jpg",
    alt: "Luxury braided hairstyle showcase 8",
    category: "knotless",
  },
];
