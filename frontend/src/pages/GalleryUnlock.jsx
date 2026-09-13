import { useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";
import Notice from "../components/Notice";

export default function GalleryUnlock() {
  const { slug } = useParams();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data } = await client.post(
        `/galleries/public/${slug}/`,
        { pin }
      );

      setGallery({
        ...data,
        event_name: data.event,
        photo_count: data.photos.length,
        photos: data.photos.map((photo) => ({
          ...photo,
          image_url: photo.storage_location,
        })),
      });
    } catch (err) {
      const status = err.response?.status;

      if (status === 403) {
        setError("Incorrect PIN. Please try again.");
      } else if (status === 404) {
        setError("This gallery link is not available.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (gallery) {
    return (
      <div className="min-h-screen bg-ink px-6 py-14 font-body text-ivory">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-ivory/50">
            Private gallery
          </p>

          <h1 className="mt-2 text-center font-display text-4xl">
            {gallery.event_name}
          </h1>

          <p className="mt-2 text-center text-sm text-ivory/60">
            {gallery.photo_count} photo
            {gallery.photo_count === 1 ? "" : "s"}
          </p>

          <div className="mt-12 columns-2 gap-3 sm:columns-3 lg:columns-4">
            {gallery.photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.image_url}
                target="_blank"
                rel="noreferrer"
                className="mb-3 block break-inside-avoid"
              >
                <img
                  src={photo.image_url}
                  alt={photo.filename}
                  className="w-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Customer should normally arrive through /gallery/:slug
  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6 font-body text-ivory">
        <div className="w-full max-w-sm text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-ivory/50">
            Private gallery
          </p>

          <h1 className="mt-3 font-display text-3xl">
            Open your gallery link
          </h1>

          <p className="mt-3 text-sm leading-6 text-ivory/60">
            Your photographer or event team sent you a private gallery link.
            Open that link to enter your PIN and view your photos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 font-body text-ivory">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ivory/50">
          Private gallery
        </p>

        <h1 className="mt-3 font-display text-3xl">
          Enter your PIN
        </h1>

        <p className="mt-2 text-sm text-ivory/60">
          Enter the PIN sent with your gallery link to view your photos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <Notice tone="error">{error}</Notice>

          <div>
            <label
              className="block text-xs uppercase tracking-wide text-ivory/50"
              htmlFor="pin"
            >
              PIN
            </label>

            <input
              id="pin"
              required
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, ""))
              }
              placeholder="••••••"
              className="mt-1 w-full border-b border-ivory/30 bg-transparent py-2 text-center text-2xl tracking-[0.4em] text-ivory outline-none focus:border-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold py-3 text-sm uppercase tracking-wide text-ink transition hover:bg-gold-light disabled:opacity-60"
          >
            {loading ? "Unlocking..." : "Unlock gallery"}
          </button>
        </form>
      </div>
    </div>
  );
}