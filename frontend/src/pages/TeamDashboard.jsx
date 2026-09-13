import { useEffect, useState } from "react"; 
import { Link } from "react-router-dom"; 
import client from "../api/client"; 
import Shell from "../components/Shell"; 
import Notice from "../components/Notice"; 
 
export default function TeamDashboard() { 
  const [events, setEvents] = useState([]); 
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(true); 
 
  useEffect(() => { 
    client 
      .get("/events/") 
      .then(({ data }) => setEvents(data)) 
      .catch(() => setError("Could not load your assigned events.")) 
      .finally(() => setLoading(false)); 
  }, []); 
 
  return ( 
    <Shell wide> 
      <h1 className="font-display text-3xl text-ink">Your assigned events</h1> 
      <p className="mt-1 text-sm text-charcoal-600"> 
        Upload the photos you shot for each event below. 
      </p> 
 
      <Notice>{error}</Notice> 
 
      {loading ? ( 
        <p className="mt-8 text-sm text-charcoal-400">Loading...</p> 
      ) : events.length === 0 ? ( 
        <div className="mt-8 border border-dashed border-ink/20 px-6 py-10 text-center text-sm text-charcoal-600"> 
          You have not been assigned to any events yet. Ask your Admin to add 
          you to an event. 
        </div> 
      ) : ( 
        <ul className="mt-8 divide-y divide-ink/10 border-t border-ink/10"> 
          {events.map((event) => ( 
            <li key={event.id} className="flex items-center justify-between py-5"> 
              <div> 
                <Link 
                  to={`/team/events/${event.id}`} 
                  className="font-display text-xl text-ink hover:text-blush-dark" 
                > 
                  {event.name} 
                </Link> 
                <p className="mt-1 text-sm text-charcoal-600"> 
                  {event.total_photos} photo{event.total_photos === 1 ? "" : "s"} on 
                  this event so far 
                </p> 
              </div> 
              <Link 
                to={`/team/events/${event.id}`} 
                className="border-b border-ink/40 text-sm text-ink hover:border-ink" 
              > 
                Upload photos 
              </Link> 
            </li> 
          ))} 
        </ul> 
      )} 
    </Shell> 
  ); 
}