import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notice from "../components/Notice";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(user.role === "ADMIN" ? "/admin" : "/team");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "We could not sign you in. Check your username and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ivory px-5 py-8 font-body text-ink sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-[0_20px_70px_rgba(30,24,20,0.08)] lg:grid-cols-[1.05fr_0.95fr]">

          {/* Brand panel */}
          <div className="relative hidden min-h-[620px] overflow-hidden bg-ink p-10 text-ivory lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blush/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blush" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-ivory/60">
                  TrizenAI
                </span>
              </div>

              <h2 className="mt-16 max-w-md font-display text-5xl leading-[1.05]">
                Every moment,
                <br />
                in one place.
              </h2>

              <p className="mt-6 max-w-sm text-sm leading-7 text-ivory/60">
                A simple space for your team to capture, manage and share every moment beautifully.
              </p>
            </div>

            <div className="relative">
              <div className="mb-5 h-px w-16 bg-ivory/20" />

              <p className="font-display text-lg text-ivory/80">
                PhotoShare
              </p>

              <p className="mt-1 text-xs text-ivory/40">
                Private event galleries, made simple.
              </p>
            </div>
          </div>

          {/* Login panel */}
          <div className="flex min-h-[620px] items-center justify-center px-7 py-12 sm:px-12 lg:px-14">
            <div className="w-full max-w-sm">

              {/* Mobile brand */}
              <div className="mb-12 lg:hidden">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blush" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal-400">
                    TrizenAI
                  </span>
                </div>

                <h1 className="mt-3 font-display text-4xl text-ink">
                  PhotoShare
                </h1>
              </div>

              <div className="mb-9">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-charcoal-400">
                  Welcome back
                </p>

                <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                  Sign in
                </h1>

                <p className="mt-3 text-sm leading-6 text-charcoal-600">
                  Sign in to review, select and publish your event
                  galleries.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Notice tone="error">{error}</Notice>

                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-[0.15em] text-charcoal-500"
                    htmlFor="username"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    required
                    value={form.username}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        username: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none transition placeholder:text-charcoal-300 focus:border-gold focus:ring-2 focus:ring-gold/10"
                  />
                </div>

                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-[0.15em] text-charcoal-500"
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none transition placeholder:text-charcoal-300 focus:border-gold focus:ring-2 focus:ring-gold/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-ink py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-ivory shadow-sm transition hover:-translate-y-0.5 hover:bg-charcoal-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="mt-9 border-t border-ink/10 pt-7 text-center">
                <p className="text-sm text-charcoal-600">
                  New here?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink"
                  >
                    Create an account
                  </Link>
                </p>

                <p className="mt-4 text-xs text-charcoal-400">
                  Looking for a gallery instead?{" "}
                  <Link
                    to="/gallery"
                    className="text-charcoal-600 underline decoration-charcoal-300 underline-offset-4 transition hover:text-ink"
                  >
                    Open a shared gallery
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}