import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import {
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  MapPin,
  Maximize2,
  Sparkles,
  Columns3,
  Layers,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import {
  fetchGalleryImages,
  fetchGalleryDestinations,
  GalleryImageData,
} from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageCollage, CollageImage } from "@/components/vendored/ImageCollage";

const title = "Photo Gallery — Wanderlust";
const description =
  "A curated visual anthology of breathtaking landscapes, ancient architecture, and vibrant cultures across Wanderlust destinations.";

const gallerySearchSchema = z.object({
  destination: z.string().optional().default("all"),
});

export const Route = createFileRoute("/gallery")({
  validateSearch: (search) => gallerySearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ destination: search.destination }),
  loader: async ({ deps }) => {
    const [images, destinations] = await Promise.all([
      fetchGalleryImages({ data: { destinationSlug: deps.destination } }),
      fetchGalleryDestinations(),
    ]);
    return { images, destinations, activeDestination: deps.destination || "all" };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

// Balanced spatial coordinates for up to 9 featured collage cards
const COLLAGE_OFFSETS = [
  { x: -320, y: -30, rotate: -8 },
  { x: -240, y: 35, rotate: 6 },
  { x: -160, y: -42, rotate: -5 },
  { x: -80, y: 28, rotate: 4 },
  { x: 0, y: -32, rotate: -2 },
  { x: 80, y: 32, rotate: 5 },
  { x: 160, y: -38, rotate: -6 },
  { x: 240, y: 36, rotate: 4 },
  { x: 320, y: -26, rotate: -7 },
];

function GalleryPage() {
  const { images, destinations, activeDestination } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Vengeance UI Image Collage Mode: true = Editorial (organized deck), false = Collage (scattered spread)
  const [isOrganized, setIsOrganized] = useState<boolean>(false);

  const activeImage: GalleryImageData | null =
    lightboxIndex !== null && images[lightboxIndex] ? images[lightboxIndex] : null;

  const handleDestinationChange = (slug: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        destination: slug === "all" ? undefined : slug,
      }),
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showNext = useCallback(() => {
    if (lightboxIndex === null || images.length === 0) return;
    setLightboxIndex((prev) => ((prev ?? 0) + 1) % images.length);
  }, [lightboxIndex, images.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null || images.length === 0) return;
    setLightboxIndex((prev) => ((prev ?? 0) - 1 + images.length) % images.length);
  }, [lightboxIndex, images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, showNext, showPrev]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex]);

  // Map first 8-9 images into collage data format
  const collageItems: CollageImage[] = useMemo(() => {
    const featuredCount = Math.min(images.length, 9);
    const subset = images.slice(0, featuredCount);

    return subset.map((img, i) => {
      const offset = COLLAGE_OFFSETS[i % COLLAGE_OFFSETS.length];
      return {
        id: img.id,
        src: img.url,
        x: offset.x,
        y: offset.y,
        rotate: offset.rotate,
        alt: img.caption || "Travel photography",
        caption: img.caption,
        destinationName: img.destination?.name,
        destinationCountry: img.destination?.country,
      };
    });
  }, [images]);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Visual Odyssey" title="Destination Gallery" description={description} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Category / Destination Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
          <button
            onClick={() => handleDestinationChange("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs ${
              activeDestination === "all"
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            All Destinations ({images.length})
          </button>

          {destinations.map((d) => {
            const isActive = activeDestination === d.slug;
            return (
              <button
                key={d.id}
                onClick={() => handleDestinationChange(d.slug)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all shadow-xs ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-md scale-105"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {images.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 p-16 text-center max-w-md mx-auto my-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground">No photos found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No photos have been tagged for this destination yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDestinationChange("all")}
              className="mt-4 text-xs"
            >
              View All Photos
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Expressive Interactive Feature: Vengeance UI Image Collage */}
            {collageItems.length > 2 && (
              <div className="hidden md:block space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent-text text-xs font-semibold">
                      <Sparkles className="h-3.5 w-3.5" />
                      Curated Collage Spotlight
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Click any photograph to view fullscreen
                    </span>
                  </div>

                  {/* Organized ↔ Scattered View Toggle */}
                  <div className="inline-flex items-center p-1 rounded-full bg-muted/80 border border-border/80 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setIsOrganized(false)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        !isOrganized
                          ? "bg-card text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-pressed={!isOrganized}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Collage view
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOrganized(true)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isOrganized
                          ? "bg-card text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-pressed={isOrganized}
                    >
                      <Columns3 className="h-3.5 w-3.5" />
                      Editorial view
                    </button>
                  </div>
                </div>

                <ImageCollage
                  images={collageItems}
                  isOrganized={isOrganized}
                  onToggleLayout={() => setIsOrganized((prev) => !prev)}
                  onImageClick={(collageIdx) => openLightbox(collageIdx)}
                />
              </div>
            )}

            {/* Complete Gallery Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  {collageItems.length > 2
                    ? `Complete Archive (${images.length})`
                    : `Photographs (${images.length})`}
                </h2>
                <span className="text-xs text-muted-foreground">
                  High-resolution editorial captures
                </span>
              </div>

              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => openLightbox(idx)}
                    className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-muted cursor-pointer border border-border/70 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Image */}
                    <img
                      src={img.url}
                      alt={img.caption || "Travel photography"}
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-end">
                        <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 group-hover:scale-110 transition-transform">
                          <Maximize2 className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        {img.destination && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-foreground/90 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full w-fit">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {img.destination.name}, {img.destination.country}
                            </span>
                          </div>
                        )}
                        {img.caption && (
                          <p className="text-xs font-medium text-white/95 line-clamp-2 drop-shadow-xs">
                            {img.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Top Bar: Counter & Close */}
          <div
            className="flex items-center justify-between text-white/80 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-white/60 tracking-wider">
                {lightboxIndex + 1} / {images.length}
              </span>
              {activeImage.destination && (
                <Badge variant="outline" className="text-white border-white/20 bg-white/10 text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {activeImage.destination.name}, {activeImage.destination.country}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/10 h-8 px-2 text-xs"
              >
                <a
                  href={activeImage.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open original image"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeLightbox}
                className="text-white hover:text-white hover:bg-white/10 h-8 w-8 p-0 rounded-full"
                title="Close Lightbox (Esc)"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div
            className="relative flex-1 flex items-center justify-center my-2 max-h-[78vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            <button
              onClick={showPrev}
              className="absolute left-2 sm:left-4 z-20 h-11 w-11 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              title="Previous photo (Left arrow)"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Image */}
            <div className="max-w-5xl max-h-full flex items-center justify-center p-2">
              <img
                src={activeImage.url}
                alt={activeImage.caption || "Fullscreen view"}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10 transition-all duration-300"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={showNext}
              className="absolute right-2 sm:right-4 z-20 h-11 w-11 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              title="Next photo (Right arrow)"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Bar: Caption */}
          <div
            className="text-center max-w-2xl mx-auto z-10 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {activeImage.caption && (
              <p className="text-white/90 text-sm font-medium leading-relaxed drop-shadow-md">
                "{activeImage.caption}"
              </p>
            )}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
