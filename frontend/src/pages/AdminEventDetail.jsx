import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";
import Shell from "../components/Shell";
import Notice from "../components/Notice";

const SITE_ORIGIN = window.location.origin;

export default function AdminEventDetail() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [members, setMembers] = useState([]);
  const [gallery, setGallery] = useState(null);

  const [memberInput, setMemberInput] = useState("");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");

  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [publishError, setPublishError] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");

  const [publishing, setPublishing] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [updatingPin, setUpdatingPin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  function loadAll() {
    setLoading(true);

    Promise.all([
      client.get("/events/"),
      client.get("/photos/"),
      client.get(`/events/members/?event=${eventId}`),
      client.get(`/galleries/event/${eventId}/`).catch((err) => {
        if (err.response?.status === 404) {
          return { data: null };
        }
        throw err;
      }),
    ])
      .then(([eventsRes, photosRes, membersRes, galleryRes]) => {
        const currentEvent = eventsRes.data.find(
          (item) => item.id === Number(eventId)
        );

        const eventPhotos = photosRes.data
          .filter((photo) => photo.event === Number(eventId))
          .map((photo) => ({
            ...photo,
            selected: photo.is_selected,
            image_url: photo.storage_location,
            uploaded_by_username: photo.uploaded_by,
          }));

        setEvent(currentEvent);
        setPhotos(eventPhotos);
        setMembers(membersRes.data);

        if (galleryRes.data) {
          setGallery({
            ...galleryRes.data,
            gallery_url_path: `/gallery/${galleryRes.data.share_token}`,
          });
        } else {
          setGallery(null);
        }
      })
      .catch(() => setError("Could not load this event."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, [eventId]);

  async function handleAddMember(e) {
    e.preventDefault();
    setMemberError("");
    setAddingMember(true);

    const value = memberInput.trim();

    try {
      await client.post("/events/members/", {
        event: Number(eventId),
        ...(value.includes("@")
          ? { email: value }
          : { username: value }),
      });

      setMemberInput("");
      loadAll();
    } catch (err) {
      console.log("ADD MEMBER ERROR:", err.response?.data);

      setMemberError(
        JSON.stringify(err.response?.data) ||
          "Could not add that team member."
      );
    } finally {
      setAddingMember(false);
    }
  }

  async function toggleSelected(photo) {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photo.id
          ? { ...p, selected: !p.selected }
          : p
      )
    );

    try {
      await client.patch(`/photos/${photo.id}/select/`, {
        is_selected: !photo.selected,
      });
    } catch {
      setError("Could not update that photo. Refresh and try again.");
      loadAll();
    }
  }

  async function handlePublish(e) {
    e.preventDefault();

    setPublishError("");
    setPublishing(true);

    try {
      const createResponse = await client.post(
        "/galleries/create/",
        {
          event: Number(eventId),
        }
      );

      const createdGallery = createResponse.data;

      await client.patch(
        `/galleries/${createdGallery.id}/set-pin/`,
        {
          pin,
        }
      );

      const publishResponse = await client.patch(
        `/galleries/${createdGallery.id}/publish/`
      );

      setGallery({
        ...createdGallery,
        ...publishResponse.data,
        gallery_url_path: `/gallery/${createdGallery.share_token}`,
      });

      setPin("");
    } catch (err) {
      console.log("PUBLISH ERROR:", err.response?.data);

      const errorData = err.response?.data;

      if (typeof errorData === "object") {
        setPublishError(
          errorData.detail ||
            errorData.error ||
            JSON.stringify(errorData)
        );
      } else {
        setPublishError("Could not publish the gallery.");
      }
    } finally {
      setPublishing(false);
    }
  }

  async function handleChangePin(e) {
    e.preventDefault();

    setPinError("");
    setPinSuccess("");
    setUpdatingPin(true);

    try {
      await client.patch(
        `/galleries/${gallery.id}/set-pin/`,
        {
          pin: newPin,
        }
      );

      setNewPin("");
      setPinSuccess("PIN updated successfully.");

      setTimeout(() => {
        setPinSuccess("");
      }, 3000);
    } catch (err) {
      console.log("CHANGE PIN ERROR:", err.response?.data);

      const errorData = err.response?.data;

      if (typeof errorData === "object") {
        setPinError(
          errorData.detail ||
            errorData.error ||
            JSON.stringify(errorData)
        );
      } else {
        setPinError("Could not update the PIN.");
      }
    } finally {
      setUpdatingPin(false);
    }
  }

  async function copyGalleryLink() {
    if (!gallery?.gallery_url_path) return;

    const galleryUrl = `${SITE_ORIGIN}${gallery.gallery_url_path}`;

    try {
      await navigator.clipboard.writeText(galleryUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setPublishError("Could not copy the gallery link.");
    }
  }

  const selectedCount = photos.filter(
    (p) => p.selected
  ).length;

  if (loading) {
    return (
      <Shell wide>
        <p className="text-sm text-charcoal-400">
          Loading event...
        </p>
      </Shell>
    );
  }

  if (!event) {
    return (
      <Shell wide>
        <Notice>
          {error || "Event not found."}
        </Notice>
      </Shell>
    );
  }

  return (
    <Shell wide>
      <div className="pb-10">

        {/* EVENT HEADER */}
        <div className="mb-7">
          <h1 className="font-display text-2xl text-ink">
            {event.name}
          </h1>

          <div className="mt-1.5 flex items-center gap-2.5 text-sm text-charcoal-600">
            <span>
              {photos.length} photo
              {photos.length === 1 ? "" : "s"} uploaded
            </span>

            <span className="text-charcoal-300">•</span>

            <span>
              {selectedCount} selected for the gallery
            </span>
          </div>
        </div>

        <Notice>{error}</Notice>

        {/* MAIN CONTENT */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_345px]">

          {/* LEFT — PHOTOS */}
          <section>
            <div className="mb-4">
              <h2 className="font-display text-2xl text-ink">
                All uploaded photos
              </h2>

              <p className="mt-1 text-sm text-charcoal-600">
                Tick the photos you want to include in the customer gallery.
              </p>
            </div>

            {photos.length === 0 ? (
              <div className="border border-dashed border-ink/20 py-12 text-center">
                <p className="text-sm text-charcoal-400">
                  No photos uploaded yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => toggleSelected(photo)}
                    className={`group relative aspect-square overflow-hidden border text-left ${
                      photo.selected
                        ? "border-blush"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.filename}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />

                    <span
                      className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                        photo.selected
                          ? "bg-blush text-ivory"
                          : "bg-ink/30 text-ivory"
                      }`}
                    >
                      {photo.selected ? "✓" : ""}
                    </span>

                    {photo.selected && (
                      <span className="absolute left-3 top-3 rounded-full bg-blush px-3 py-1 text-[10px] uppercase text-ivory">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT — CONTROLS */}
          <aside className="space-y-5">

            {/* TEAM MEMBERS */}
            <section className="border border-ink/10 bg-paper px-6 py-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-ink">
                  Team members
                </h2>

                <span className="text-xs text-charcoal-400">
                  {members.length}
                </span>
              </div>

              <div className="mt-3">
                {members.length === 0 ? (
                  <p className="text-sm text-charcoal-400">
                    No team members yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 text-sm text-charcoal-600"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush/10 text-xs text-blush">
                          {m.username?.charAt(0).toUpperCase()}
                        </span>

                        <span>{m.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleAddMember}
                className="mt-4"
              >
                <Notice tone="error">
                  {memberError}
                </Notice>

                <input
                  placeholder="Username or email"
                  value={memberInput}
                  onChange={(e) =>
                    setMemberInput(e.target.value)
                  }
                  required
                  className="w-full border-b border-ink/20 bg-transparent px-0 py-2.5 text-sm text-ink outline-none placeholder:text-charcoal-400 focus:border-ink"
                />

                <button
                  type="submit"
                  disabled={addingMember}
                  className="mt-3 w-full border border-ink bg-transparent py-2.5 text-xs uppercase text-ink transition hover:bg-ink hover:text-ivory disabled:opacity-60"
                >
                  {addingMember
                    ? "Adding..."
                    : "Add team member"}
                </button>
              </form>
            </section>

            {/* GALLERY */}
            <section className="border border-ink/10 bg-paper px-6 py-5">
              <h2 className="font-display text-xl text-ink">
                Gallery
              </h2>

              {gallery?.is_published ? (
                <div className="mt-3">
                  <Notice tone="success">
                    Gallery is live.
                  </Notice>

                  <p className="mt-3 text-xs text-charcoal-500">
                    Shareable link
                  </p>

                  <p className="mt-1.5 break-all border border-ink/10 bg-ivory px-3 py-2.5 text-xs leading-5 text-ink">
                    {SITE_ORIGIN}
                    {gallery.gallery_url_path}
                  </p>

                  <button
                    type="button"
                    onClick={copyGalleryLink}
                    className="mt-3 w-full border border-ink bg-transparent py-2.5 text-xs uppercase text-ink transition hover:bg-ink hover:text-ivory"
                  >
                    {copied ? "Link copied" : "Copy gallery link"}
                  </button>

                  <p className="mt-3 text-xs leading-5 text-charcoal-500">
                    Share the link along with the PIN.
                    The customer does not need an account.
                  </p>

                  {/* CHANGE PIN */}
                  <div className="mt-5 border-t border-ink/10 pt-5">
                    <p className="text-xs text-charcoal-500">
                      Need to give the customer a new PIN?
                    </p>

                    <form
                      onSubmit={handleChangePin}
                      className="mt-3"
                    >
                      <Notice tone="error">
                        {pinError}
                      </Notice>

                      <Notice tone="success">
                        {pinSuccess}
                      </Notice>

                      <input
                        placeholder="New 4–6 digit PIN"
                        value={newPin}
                        onChange={(e) =>
                          setNewPin(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6)
                          )
                        }
                        minLength={4}
                        maxLength={6}
                        required
                        className="w-full border-b border-ink/20 bg-transparent px-0 py-2.5 text-center text-lg tracking-[0.12em] text-ink outline-none placeholder:text-charcoal-300 focus:border-ink"
                      />

                      <button
                        type="submit"
                        disabled={updatingPin}
                        className="mt-3 w-full border border-ink bg-transparent py-2.5 text-xs uppercase text-ink transition hover:bg-ink hover:text-ivory disabled:opacity-60"
                      >
                        {updatingPin
                          ? "Updating..."
                          : "Change PIN"}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handlePublish}
                  className="mt-3"
                >
                  <Notice tone="error">
                    {publishError}
                  </Notice>

                  <p className="text-sm leading-5.5 text-charcoal-600">
                    Choose a 4 to 6 digit PIN. Customers will
                    need this along with the link to view the
                    gallery.
                  </p>

                  <input
                    placeholder="e.g. 482917"
                    value={pin}
                    onChange={(e) =>
                      setPin(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    minLength={4}
                    maxLength={6}
                    required
                    className="mt-3 w-full border-b border-ink/20 bg-transparent px-0 py-2.5 text-center text-lg tracking-[0.12em] text-ink outline-none placeholder:text-charcoal-300 focus:border-ink"
                  />

                  <button
                    type="submit"
                    disabled={
                      publishing ||
                      selectedCount === 0
                    }
                    className="mt-3 w-full border border-ink bg-ink py-3 text-xs uppercase text-ivory transition hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {publishing
                      ? "Publishing..."
                      : "Publish gallery"}
                  </button>

                  {selectedCount === 0 && (
                    <p className="mt-2 text-center text-xs text-charcoal-400">
                      Select at least one photo first.
                    </p>
                  )}
                </form>
              )}
            </section>

          </aside>
        </div>
      </div>
    </Shell>
  );
}