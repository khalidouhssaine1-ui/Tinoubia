import { FaInstagram } from "react-icons/fa";
import { Reveal } from "@/components/shared/reveal";
import { instagramEmbedUrl } from "@/lib/instagram";
import type { InstagramVideo } from "@/types";

export function InstagramVideos({ videos }: { videos: InstagramVideo[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-luxe">
        <Reveal className="text-center">
          <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-bronze">
            <FaInstagram className="size-4" /> Follow Our Journey
          </p>
          <h2 className="mt-3 font-heading text-3xl text-charcoal sm:text-4xl">Real Homes, Real Stories</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            A look inside our latest properties and client moments.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v, i) => {
            const embed = instagramEmbedUrl(v.url);
            return (
              <Reveal key={v.id} delay={i * 0.06}>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  {embed ? (
                    // Instagram link — embed iframe (reels show "Watch on Instagram").
                    <iframe
                      src={embed}
                      title={v.caption || "Instagram video"}
                      loading="lazy"
                      allowFullScreen
                      className="h-[560px] w-full"
                    />
                  ) : (
                    // Uploaded video file — plays inline, keeps visitors on-site.
                    <video
                      src={v.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="h-[560px] w-full bg-charcoal object-cover"
                    />
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
