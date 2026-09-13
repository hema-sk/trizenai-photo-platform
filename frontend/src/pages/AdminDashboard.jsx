import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import Shell from "../components/Shell";
import Notice from "../components/Notice";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  function loadEvents() {
    setLoading(true);
    client
      .get("/events/")
      .then(({ data }) => setEvents(data))
      .catch(() => setError("Could not load your events."))
      .finally(() => setLoading(false));
  }

  useEffect(loadEvents, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setCreating(true);
    try {
      await client.post("/events/create/", {
  name,
  description,
  event_date: new Date().toISOString().slice(0, 10),
});
      setName("");
      setDescription("");
      loadEvents();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || "Could not create the event.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Shell wide>
      <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
        <section>
          <h1 className="font-display text-3xl text-ink">Your events</h1>
          <p className="mt-1 text-sm text-charcoal-600">
            Review uploads, choose the best shots, and publish a private
            gallery for each event.
          </p>

          {loading ? (
            <p className="mt-8 text-sm text-charcoal-400">Loading events...</p>
          ) : events.length === 0 ? (
            <div className="mt-8 border border-dashed border-ink/20 px-6 py-10 text-center text-sm text-charcoal-600">
              No events yet. Create your first event to start collecting photos.
            </div>
          ) : (
            <ul className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
              {events.map((event) => (
                <li key={event.id} className="flex items-center justify-between py-5">
                  <div>
                    <Link
                      to={`/admin/events/${event.id}`}
                      className="font-display text-xl text-ink hover:text-blush-dark"
                    >
                      {event.name}
                    </Link>
                    <p className="mt-1 text-sm text-charcoal-600">
                      {event.total_photos} photo{event.total_photos === 1 ? "" : "s"}{" "}
                      uploaded &middot; {event.selected_photos_count} selected
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {event.is_gallery_published && (
                      <span className="border border-sage/50 bg-sage/10 px-2 py-1 text-xs uppercase tracking-wide text-sage-dark">
                        Published
                      </span>
                    )}
                    <Link
                      to={`/admin/events/${event.id}`}
                      className="border-b border-ink/40 text-sm text-ink hover:border-ink"
                    >
                      Manage
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="border border-ink/10 bg-paper/60 p-6">
          <h2 className="font-display text-xl text-ink">Create an event</h2>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <Notice tone="error">{error}</Notice>
            <div>
              <label className="block text-sm text-charcoal-600" htmlFor="event-name">
                Event name
              </label>
              <input
                id="event-name"
                required
                placeholder="Arjun & Priya Wedding"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border-b border-ink/20 bg-transparent py-2 text-ink outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal-600" htmlFor="event-description">
                Notes (optional)
              </label>
              <textarea
                id="event-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full resize-none border border-ink/20 bg-transparent p-2 text-ink outline-none focus:border-gold"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-ink py-3 text-sm uppercase tracking-wide text-ivory transition hover:bg-charcoal-800 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create event"}
            </button>
          </form>
        </aside>
      </div>
    </Shell>
  );
}
