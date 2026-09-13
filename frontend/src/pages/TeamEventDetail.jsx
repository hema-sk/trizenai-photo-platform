import { useEffect, useRef, useState } from "react"; 
import { useParams } from "react-router-dom"; 
import client from "../api/client"; 
import Shell from "../components/Shell"; 
import Notice from "../components/Notice"; 
 
export default function TeamEventDetail() { 
  const { eventId } = useParams(); 
  const [event, setEvent] = useState(null); 
  const [photos, setPhotos] = useState([]); 
  const [error, setError] = useState(""); 
  const [uploadError, setUploadError] = useState(""); 
  const [uploading, setUploading] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const fileInputRef = useRef(null); 
 
  function loadAll() { 
  setLoading(true); 
 
  Promise.all([ 
    client.get("/events/"), 
    client.get("/photos/"), 
  ]) 
    .then(([eventsRes, photosRes]) => { 
      const currentEvent = eventsRes.data.find( 
        (item) => item.id === Number(eventId) 
      ); 
 
      const eventPhotos = photosRes.data 
        .filter((photo) => photo.event === Number(eventId)) 
        .map((photo) => ({ 
          ...photo, 
          image_url: photo.storage_location, 
        })); 
 
      setEvent(currentEvent); 
      setPhotos(eventPhotos); 
    }) 
    .catch((err) => { 
      console.log("TEAM EVENT LOAD ERROR:", err.response?.data); 
      setError("Could not load this event."); 
    }) 
    .finally(() => setLoading(false)); 
} 
 
  useEffect(loadAll, [eventId]); 
 
  async function handleFiles(fileList) { 
    const files = Array.from(fileList); 
    if (files.length === 0) return; 
    setUploadError(""); 
    setUploading(true); 
    try { 
      for (const file of files) { 
        const formData = new FormData(); 
 
formData.append("event", String(eventId)); 
formData.append("image", file); 
 
await client.post("/photos/upload/", formData); 
      } 
      loadAll(); 
    } catch (err) { 
      setUploadError(err.response?.data?.image?.[0] || "One or more uploads failed."); 
    } finally { 
      setUploading(false); 
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    } 
  } 
 
  async function handleDelete(photoId) { 
    setPhotos((prev) => prev.filter((p) => p.id !== photoId)); 
    try { 
      await client.delete(`/photos/${photoId}/`); 
    } catch { 
      loadAll(); 
    } 
  } 
 
  if (loading) { 
    return ( 
      <Shell wide> 
        <p className="text-sm text-charcoal-400">Loading event...</p> 
      </Shell> 
    ); 
  } 
 
  if (!event) { 
    return ( 
      <Shell wide> 
        <Notice>{error || "Event not found."}</Notice> 
      </Shell> 
    ); 
  } 
 
  return ( 
    <Shell wide> 
      <h1 className="font-display text-3xl text-ink">{event.name}</h1> 
      <p className="mt-1 text-sm text-charcoal-600"> 
        Upload your shots below. The Admin will review everyone's uploads and 
        choose which ones go into the published gallery. 
      </p> 
 
      <Notice>{error}</Notice> 
 
      <div 
        className="mt-8 border-2 border-dashed border-ink/20 px-6 py-10 text-center transition hover:border-gold" 
        onDragOver={(e) => e.preventDefault()} 
        onDrop={(e) => { 
          e.preventDefault(); 
          handleFiles(e.dataTransfer.files); 
        }} 
      > 
        <p className="text-sm text-charcoal-600"> 
          Drag and drop photos here, or 
        </p> 
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={uploading} 
          className="mt-3 border border-ink px-5 py-2 text-xs uppercase tracking-wide text-ink transition hover:bg-ink hover:text-ivory disabled:opacity-60" 
        > 
          {uploading ? "Uploading..." : "Choose photos"} 
        </button> 
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          multiple 
          className="hidden" 
          onChange={(e) => handleFiles(e.target.files)} 
        /> 
        {uploadError && <p className="mt-3 text-sm text-blush-dark">{uploadError}</p>} 
      </div> 
 
      <h2 className="mt-10 font-display text-xl text-ink">Your uploads ({photos.length})</h2> 
      {photos.length === 0 ? ( 
        <p className="mt-3 text-sm text-charcoal-400"> 
          Nothing uploaded yet on this event. 
        </p> 
      ) : ( 
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"> 
          {photos.map((photo) => ( 
            <div key={photo.id} className="group relative aspect-square overflow-hidden"> 
              <img 
                src={photo.image_url} 
                alt={photo.filename} 
                className="h-full w-full object-cover" 
              /> 
              {photo.selected && ( 
                <span className="absolute left-2 top-2 border border-sage bg-sage/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ivory"> 
                  In gallery 
                </span> 
              )} 
              <button 
                onClick={() => handleDelete(photo.id)} 
                className="absolute bottom-0 left-0 right-0 bg-ink/70 py-1 text-xs text-ivory opacity-0 transition group-hover:opacity-100" 
              > 
                Remove 
              </button> 
            </div> 
          ))} 
        </div> 
      )} 
    </Shell> 
  ); 
} 
