






import { useState } from "react";
import fetchApi from "../api/fetchApi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

/*
  Staff login (clean, professional version).
  Same props and same login logic as before: POST /api/employee/loginEmployee,
  saves webapptoken and loginEmployeeData, sets the role, then calls
  onAuthSuccess() and onClose().

  It fills the screen, so nothing else is visible before login.
*/

const BrandLogo = () => {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="text-2xl font-extrabold tracking-tight text-[#0B4BAA]">
      Movement <span className="text-[#00C2CB]">Rehab</span>
    </span>
  ) : (
    <img src="/logo2.jpeg" alt="Movement Rehab" className="h-12 w-auto" onError={() => setFailed(true)} />
  );
};

const AuthModal = ({ onClose, onAuthSuccess, setRole }) => {
  const [form, setForm] = useState({
    name: "", // kept so the request body stays exactly as before
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [capsOn, setCapsOn] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const url = "/api/employee/loginEmployee";
      const data = await fetchApi(url, {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (data?.token) {
        localStorage.setItem("webapptoken", data?.token);
        localStorage.setItem("token", data?.token);
        localStorage.setItem("loginEmployeeData", JSON.stringify(data?.employee));
      }
      if (data?.employee) {
        if (data?.employee?.personalDetails?.email === import.meta.env.VITE_ADMIN_EMAIL) {
          setRole("admin");
        } else {
          setRole("employee");
        }
      }

      onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || "Unable to sign in. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-[15px] text-slate-900 placeholder-slate-400 outline-none transition hover:border-slate-400 focus:border-[#0B4BAA] focus:ring-4 focus:ring-[#0B4BAA]/10";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-slate-100">
      {/* Brand accent */}
      <div className="h-1.5 shrink-0 bg-gradient-to-r from-[#00C2CB] via-[#0B4BAA] to-[#082F6B]" />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center">
            <BrandLogo />
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 sm:p-9">
            <h1 className="text-center text-[22px] font-bold tracking-tight text-slate-900">Sign in to your account</h1>
            <p className="mt-1.5 text-center text-sm text-slate-500">Staff access only. Enter your work email and password.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div aria-live="polite">
                {error && (
                  <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder="name@movementrehab.online"
                    autoComplete="username"
                    className={inputClass}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1zM8 11V7a4 4 0 118 0v4" />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`${inputClass} pr-11`}
                    onChange={handleChange}
                    onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
                    onBlur={() => setCapsOn(false)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 transition hover:text-[#0B4BAA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4BAA]"
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={19} /> : <AiOutlineEye size={19} />}
                  </button>
                </div>
                {capsOn && <p className="mt-1.5 text-[13px] font-medium text-amber-700">Caps Lock is on.</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B4BAA] py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4BAA] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-slate-500">
              Forgot your password? Contact your administrator.
            </p>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure staff portal
          </p>
        </div>
      </main>

      <footer className="shrink-0 pb-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Movement Rehab. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthModal;
