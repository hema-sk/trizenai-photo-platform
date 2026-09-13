import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Shell({ children, wide = false }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ivory text-ink font-body">
      <header className="border-b border-ink/10">
        <div
          className={`mx-auto flex items-center justify-between px-6 py-5 ${
            wide ? "max-w-6xl" : "max-w-3xl"
          }`}
        >
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-tight">PhotoShare</span>
            <span className="hidden text-xs text-charcoal-400 sm:inline">
              by TrizenAI
            </span>
          </Link>
          {user && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-charcoal-600">
                {user.username}
                <span className="ml-2 rounded-full border border-blush/40 bg-blush/10 px-2 py-0.5 text-xs uppercase tracking-wide text-blush-dark">
                  {user.role === "ADMIN" ? "Admin" : "Team member"}
                </span>
              </span>
              <button
                onClick={logout}
                className="border-b border-transparent text-charcoal-600 hover:border-ink/40 hover:text-ink"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className={`mx-auto px-6 py-10 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {children}
      </main>
    </div>
  );
}
