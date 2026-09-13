import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notice from "../components/Notice";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "TEAM_MEMBER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "ADMIN" ? "/admin" : "/team");
    } catch (err) {
      const data = err.response?.data;
      const message = data
        ? Object.values(data).flat().join(" ")
        : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ivory px-5 py-8 font-body text-ink sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-[0_20px_70px_rgba(30,24,20,0.08)] lg:grid-cols-[1.05fr_0.95fr]">

          {/* Brand panel */}
          <div className="relative hidden min-h-[680px] overflow-hidden bg-ink p-10 text-ivory lg:flex lg:flex-col lg:justify-between">
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
                Bring your
                <br />
                moments together.
              </h2>

              <p className="mt-6 max-w-sm text-sm leading-7 text-ivory/60">
                Create your PhotoShare account and be part of the
                simple workflow that turns captured moments into
                private event galleries.
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

          {/* Register panel */}
          <div className="flex min-h-[680px] items-center justify-center px-7 py-12 sm:px-12 lg:px-14">
            <div className="w-full max-w-sm">

              {/* Mobile brand */}
              <div className="mb-10 lg:hidden">
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

              <div className="mb-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-charcoal-400">
                  Get started
                </p>

                <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                  Create your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-charcoal-600">
                  Set up your account to manage events or upload
                  photos to the team.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Notice tone="error">{error}</Notice>

                {/* Role selection */}
                <fieldset>
                  <legend className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-charcoal-500">
                    I am a
                  </legend>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "ADMIN", label: "Admin / Lead" },
                      { value: "TEAM_MEMBER", label: "Team member" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-xl border px-3 py-3.5 text-center text-xs font-medium transition ${
                          form.role === option.value
                            ? "border-ink bg-ink text-ivory shadow-sm"
                            : "border-ink/10 bg-ivory text-charcoal-600 hover:border-ink/25 hover:bg-paper"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={form.role === option.value}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              role: e.target.value,
                            })
                          }
                          className="sr-only"
                        />

                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Username */}
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

                {/* Email */}
                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-[0.15em] text-charcoal-500"
                    htmlFor="email"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none transition placeholder:text-charcoal-300 focus:border-gold focus:ring-2 focus:ring-gold/10"
                  />
                </div>

                {/* Password */}
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
                    minLength={8}
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-ink/10 bg-ivory px-4 py-3 text-sm text-ink outline-none transition placeholder:text-charcoal-300 focus:border-gold focus:ring-2 focus:ring-gold/10"
                  />

                  <p className="mt-2 text-xs text-charcoal-400">
                    At least 8 characters.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-ink py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-ivory shadow-sm transition hover:-translate-y-0.5 hover:bg-charcoal-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating account..."
                    : "Create account"}
                </button>
              </form>

              <div className="mt-8 border-t border-ink/10 pt-7 text-center">
                <p className="text-sm text-charcoal-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink"
                  >
                    Sign in
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