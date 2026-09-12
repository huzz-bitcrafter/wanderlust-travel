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
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import {
  fetchGalleryImages,
  fetchGalleryDestinations,
  GalleryImageData,
} from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CylinderCarousel, CylinderImageItem } from "@/components/vendored/CylinderCarousel";
import { ALL_LOCAL_PLACEHOLDERS } from "@/data/placeholder-gallery";

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

function GalleryPage() {
  const { images, destinations, activeDestination } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Combine database images with ALL local placeholder photography from the asset folders
  const allGalleryImages: GalleryImageData[] = useMemo(() => {
    if (!activeDestination || activeDestination === "all") {
      const existingUrls = new Set(ALL_LOCAL_PLACEHOLDERS.map((p) => p.url));
      const uniqueDbImages = images.filter((img) => !existingUrls.has(img.url));
      return [...ALL_LOCAL_PLACEHOLDERS, ...uniqueDbImages];
    }

    // Filter by destination slug
    const matchingLocal = ALL_LOCAL_PLACEHOLDERS.filter(
      (p) => p.destination?.slug === activeDestination,
    );
    const existingUrls = new Set(matchingLocal.map((p) => p.url));
    const uniqueDbImages = images.filter((img) => !existingUrls.has(img.url));
    const combined = [...matchingLocal, ...uniqueDbImages];

    return combined.length > 0 ? combined : ALL_LOCAL_PLACEHOLDERS;
  }, [images, activeDestination]);

  // Aggregate filter pill destinations (combining remote DB and all local placeholder destinations)
  const filterDestinations = useMemo(() => {
    const destMap = new Map<string, { id: string; name: string; country: string; slug: string }>();

    destinations.forEach((d) => destMap.set(d.slug, d));
    ALL_LOCAL_PLACEHOLDERS.forEach((p) => {
      if (p.destination && !destMap.has(p.destination.slug)) {
        destMap.set(p.destination.slug, p.destination);
      }
    });

    return Array.from(destMap.values());
  }, [destinations]);

  // Map into 3D Cylinder Carousel items
  const cylinderItems: CylinderImageItem[] = useMemo(() => {
    return allGalleryImages.map((img) => ({
      id: img.id,
      src: img.url,
      alt: img.caption || img.destination?.name || "Travel photography capture",
      caption: img.caption,
      destinationName: img.destination?.name,
      destinationCountry: img.destination?.country,
    }));
  }, [allGalleryImages]);

  const activeImage: GalleryImageData | null =
    lightboxIndex !== null && allGalleryImages[lightboxIndex]
      ? allGalleryImages[lightboxIndex]
      : null;

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
    if (lightboxIndex === null || allGalleryImages.length === 0) return;
    setLightboxIndex((prev) => ((prev ?? 0) + 1) % allGalleryImages.length);
  }, [lightboxIndex, allGalleryImages.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null || allGalleryImages.length === 0) return;
    setLightboxIndex(
      (prev) => ((prev ?? 0) - 1 + allGalleryImages.length) % allGalleryImages.length,
    );
  }, [lightboxIndex, allGalleryImages.length]);

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

  return (
    <SiteLayout>
      <PageHeader eyebrow="Visual Odyssey" title="Destination Gallery" description={description} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
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
            All Destinations ({allGalleryImages.length})
          </button>

          {filterDestinations.map((d) => {
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
        {allGalleryImages.length === 0 ? (
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
            {/* Expressive Feature: Infinite CSS 3D Cylinder Interactive Carousel */}
            {cylinderItems.length > 2 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent-text text-xs font-semibold border border-accent/20">
                      <Sparkles className="h-3.5 w-3.5 text-accent-text" />
                      Interactive 3D Cylinder Showcase
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Infinite 360° perspective view of all destinations
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/80 bg-gradient-to-b from-card/80 via-card/50 to-card/20 backdrop-blur-md p-2 sm:p-4 shadow-xl relative overflow-hidden">
                  <CylinderCarousel
                    images={cylinderItems}
                    cardWidth={155}
                    stageHeight="h-[270px] sm:h-[310px]"
                    animationDuration={48}
                    autoPlay={true}
                    onImageClick={(idx) => openLightbox(idx)}
                  />
                </div>
              </div>
            )}

            {/* Complete Gallery Grid */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  Complete Archive ({allGalleryImages.length})
                </h2>
                <span className="text-xs text-muted-foreground">
                  High-resolution editorial captures
                </span>
              </div>

              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
                {allGalleryImages.map((img, idx) => (
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
                {lightboxIndex + 1} / {allGalleryImages.length}
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
