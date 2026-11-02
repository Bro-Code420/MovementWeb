// import { useCallback, useEffect, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// /* ------------------------------------------------------------------
//    Movement Rehab: daily attendance (employees and patients)

//    One open page, one screen, one go. Nobody needs the admin's email and
//    password - those are only for the owner's dashboard.

//    EMPLOYEE  Employee ID + the 6-digit code from their authenticator app.
//      First code of the day  = start of day: checked in, and logged in.
//      Second code of the day = end of day:   checked out, and logged out.
//      The owner sets each employee's authenticator up once, from
//      Staff Attendance (the QR is shown on the owner's screen).
//        POST /api/attendance/punch          { employeeId, code }

//    SIGNED-IN person (the owner, or an employee already logged in):
//      only the code is needed.
//        GET  /api/attendance/me/today
//        POST /api/attendance/selfCheckIn    { code }
//        POST /api/attendance/totp/enroll    (their own QR)
//        POST /api/attendance/totp/confirm   { code }

//    PATIENT   Patient ID + the mobile number registered with the clinic.
//        POST /api/attendance/patient/punch  { patientId, contactNumber }

//    Both punches only work from the clinic network (enforced by the server).
// ------------------------------------------------------------------- */

// const API = import.meta.env.VITE_BACKEND_URL;
// const IST = "Asia/Kolkata";

// // How long the result stays on screen before the page clears itself.
// const CHECK_IN_RESULT_SECONDS = 10;
// const CHECK_OUT_RESULT_SECONDS = 5;

// const STORAGE_KEYS = ["webapptoken", "employeeData", "loginEmployeeData"];

// const readToken = () => {
//   try {
//     return localStorage.getItem("webapptoken");
//   } catch {
//     return null;
//   }
// };

// const authHeaders = (token = readToken()) => ({
//   "Content-Type": "application/json",
//   ...(token ? { token } : {}),
// });

// // Marking attendance also sends where the phone is, so the clinic can insist
// // on being there. A fresh reading is asked for each time (never a remembered one).
// const PUNCH_PATHS = ["/api/attendance/punch", "/api/attendance/selfCheckIn", "/api/attendance/patient/punch"];
// let lastLocationProblem = "";

// const getLocation = () =>
//   new Promise((resolve) => {
//     lastLocationProblem = "";
//     if (!navigator.geolocation) {
//       lastLocationProblem = "unsupported";
//       resolve(null);
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
//       (err) => {
//         lastLocationProblem = err.code === 1 ? "denied" : "unavailable";
//         resolve(null);
//       },
//       { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
//     );
//   });

// const request = async (method, path, payload, token) => {
//   const location = PUNCH_PATHS.includes(path) ? await getLocation() : null;
//   const res = await fetch(`${API}${path}`, {
//     method,
//     headers: authHeaders(token),
//     ...(payload ? { body: JSON.stringify(location ? { ...payload, location } : payload) } : {}),
//   });
//   const body = await res.json().catch(() => ({}));
//   return { ok: res.ok, status: res.status, body };
// };

// const fmtTime = (value) =>
//   value
//     ? new Date(value).toLocaleTimeString("en-IN", {
//         hour: "2-digit",
//         minute: "2-digit",
//         timeZone: IST,
//       })
//     : "--";

// const fmtWorked = (minutes) =>
//   minutes === null || minutes === undefined
//     ? null
//     : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

// /** Turns a failed response into a message worth showing. */
// const readError = (status, body) => {
//   if (body?.code === "LOCATION_REQUIRED") {
//     if (lastLocationProblem === "denied") {
//       return "Location is blocked. Allow location for this site in your browser settings, then try again.";
//     }
//     if (lastLocationProblem === "unavailable") {
//       return "Could not get your location. Turn on GPS and try again.";
//     }
//     return "Turn on location for this site to mark attendance, then try again.";
//   }
//   if (body?.code === "LOCATION_TOO_VAGUE") {
//     return "Your location is not precise enough. Turn on GPS, or step near a window, and try again.";
//   }
//   if (body?.code === "OUTSIDE_CLINIC_AREA") {
//     return body.message || "Attendance can only be marked at the clinic.";
//   }
//   if (body?.code === "CLINIC_LOCATION_NOT_CONFIGURED") {
//     return "Attendance is not set up yet. Ask the owner to set the clinic location.";
//   }
//   if (body?.code === "OUTSIDE_CLINIC_NETWORK") {
//     return "Attendance can only be marked on the clinic's WiFi. Connect to it and try again.";
//   }
//   if (body?.code === "CLINIC_IP_NOT_CONFIGURED") {
//     return "Attendance is not set up yet. Ask the owner to set the clinic network.";
//   }
//   if (body?.code === "NOT_ENROLLED") {
//     return "Your authenticator is not set up yet. Ask the owner to set it up for you.";
//   }
//   if (body?.code === "ALREADY_COMPLETE") {
//     return "You have already checked in and out today.";
//   }
//   if (status === 401 && !body?.code) return "Your session has expired. Please sign in again.";
//   return body?.message || "Something went wrong. Please try again.";
// };

// /* ---------------- visual bits ---------------- */
// const Styles = () => (
//   <style>{`
//     @keyframes mrShake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
//     @keyframes mrRise{from{opacity:0;transform:translateY(12px)}}
//     .mr-shake{animation:mrShake .4s}.mr-rise{animation:mrRise .4s}
//     @media(prefers-reduced-motion:reduce){.mr-shake,.mr-rise{animation:none}}
//   `}</style>
// );

// const inputClass =
//   "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-bold tracking-widest outline-none transition focus:border-[#1f4aa8] focus:ring-4 focus:ring-blue-100";
// const primaryButton =
//   "w-full rounded-2xl bg-gradient-to-r from-[#1f4aa8] to-[#2f6fd6] py-3.5 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 active:scale-95 disabled:pointer-events-none disabled:opacity-50";
// const quietButton =
//   "w-full rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200";

// /** One centred card. Everything on this page lives inside it. */
// function Card({ children, tabs }) {
//   return (
//     <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-slate-50 p-4">
//       <div className="mr-rise w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5">
//         <p className="mb-5 text-center text-xl font-extrabold text-[#1f4aa8]">
//           Movement <span className="text-[#4fc3c9]">Rehab</span>
//         </p>
//         {tabs}
//         {children}
//       </div>
//     </div>
//   );
// }

// function RoleTabs({ role, onChange }) {
//   return (
//     <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1.5" role="tablist">
//       {[
//         ["employee", "Employee"],
//         ["patient", "Patient"],
//       ].map(([key, label]) => (
//         <button
//           key={key}
//           role="tab"
//           aria-selected={role === key}
//           onClick={() => role !== key && onChange(key)}
//           className={`rounded-xl py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4aa8] ${
//             role === key ? "bg-white text-[#1f4aa8] shadow" : "text-slate-500 hover:text-slate-800"
//           }`}
//         >
//           {label}
//         </button>
//       ))}
//     </div>
//   );
// }

// /** Six single-digit boxes with paste support; submits itself on the sixth digit. */
// function CodeBoxes({ onComplete, busy, shake, resetKey }) {
//   const [digits, setDigits] = useState(Array(6).fill(""));
//   const boxes = useRef([]);

//   useEffect(() => {
//     setDigits(Array(6).fill(""));
//     // Do not steal focus from the ID field on first paint.
//     if (resetKey > 0) boxes.current[0]?.focus();
//   }, [resetKey]);

//   const setDigit = (i, value) => {
//     const digit = value.replace(/\D/g, "").slice(-1);
//     const next = [...digits];
//     next[i] = digit;
//     setDigits(next);
//     if (digit && i < 5) boxes.current[i + 1]?.focus();
//     if (next.every(Boolean)) onComplete(next.join(""));
//   };

//   const paste = (e) => {
//     const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
//     if (!text) return;
//     e.preventDefault();
//     setDigits(
//       Array(6)
//         .fill("")
//         .map((_, i) => text[i] || ""),
//     );
//     if (text.length === 6) onComplete(text);
//     else boxes.current[text.length]?.focus();
//   };

//   return (
//     <div className={`flex justify-between gap-2 ${shake ? "mr-shake" : ""}`} onPaste={paste}>
//       {digits.map((digit, i) => (
//         <input
//           key={i}
//           ref={(el) => (boxes.current[i] = el)}
//           value={digit}
//           disabled={busy}
//           inputMode="numeric"
//           autoComplete="one-time-code"
//           aria-label={`Code digit ${i + 1}`}
//           onChange={(e) => setDigit(i, e.target.value)}
//           onKeyDown={(e) => e.key === "Backspace" && !digit && boxes.current[i - 1]?.focus()}
//           className="h-14 w-full rounded-2xl border border-slate-200 bg-white text-center text-2xl font-bold outline-none transition focus:border-[#1f4aa8] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
//         />
//       ))}
//     </div>
//   );
// }

// /** Shared "wrong code" behaviour: show the message, shake, clear the boxes. */
// function useCodeFeedback() {
//   const [error, setError] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [shake, setShake] = useState(false);
//   const [resetKey, setResetKey] = useState(0);

//   const fail = (message) => {
//     setError(message);
//     setShake(true);
//     setTimeout(() => setShake(false), 450);
//     setResetKey((k) => k + 1);
//   };

//   return { error, setError, busy, setBusy, shake, resetKey, fail };
// }

// /* ---------------- EMPLOYEE (not signed in): ID + code, one screen ---------------- */
// function EmployeeForm({ onPunched }) {
//   const [id, setId] = useState("");
//   const f = useCodeFeedback();
//   const cleanId = id.trim().toUpperCase();

//   const submit = async (code) => {
//     if (!cleanId) {
//       f.fail("Enter your Employee ID first.");
//       return;
//     }
//     f.setBusy(true);
//     f.setError("");
//     try {
//       const { ok, status, body } = await request("POST", "/api/attendance/punch", {
//         employeeId: cleanId,
//         code,
//       });
//       if (ok) {
//         onPunched(body);
//         return;
//       }
//       f.fail(readError(status, body));
//     } catch {
//       f.fail("Could not reach the server.");
//     } finally {
//       f.setBusy(false);
//     }
//   };

//   return (
//     <>
//       <label className="mb-2 block text-sm font-semibold text-slate-500" htmlFor="eid">
//         Employee ID
//       </label>
//       <input
//         id="eid"
//         value={id}
//         onChange={(e) => setId(e.target.value.toUpperCase())}
//         placeholder="e.g. MR-EMP-0012"
//         autoFocus
//         autoComplete="off"
//         className={inputClass}
//       />

//       <p className="mb-2 mt-5 text-sm font-semibold text-slate-500">
//         6-digit code from your authenticator app
//       </p>
//       <CodeBoxes onComplete={submit} busy={f.busy} shake={f.shake} resetKey={f.resetKey} />
//       <p role="alert" className="mt-2 min-h-[20px] text-sm text-red-600">
//         {f.error}
//       </p>

//       <p className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
//         First code of the day checks you in. Second code checks you out. No authenticator yet? Ask
//         the owner to set it up for you.
//       </p>
//     </>
//   );
// }

// /* ---------------- SIGNED IN (owner / logged-in employee): code only ---------------- */
// function SignedInForm({ me, onPunched, onSetup, onLogout }) {
//   const f = useCodeFeedback();
//   const checkedIn = !!me.today?.inTime;

//   const submit = async (code) => {
//     f.setBusy(true);
//     f.setError("");
//     try {
//       const { ok, status, body } = await request("POST", "/api/attendance/selfCheckIn", { code });
//       if (ok) {
//         onPunched(body);
//         return;
//       }
//       f.fail(readError(status, body));
//     } catch {
//       f.fail("Could not reach the server.");
//     } finally {
//       f.setBusy(false);
//     }
//   };

//   return (
//     <>
//       <h2 className="text-2xl font-extrabold text-slate-900">Hello, {me.name.split(" ")[0]}</h2>
//       <p className="mb-5 mt-1 text-slate-500">
//         {checkedIn
//           ? `You checked in at ${fmtTime(me.today.inTime)}. Enter a code to check out.`
//           : "Enter a code to start your day."}
//       </p>

//       {me.totpEnabled ? (
//         <>
//           <CodeBoxes onComplete={submit} busy={f.busy} shake={f.shake} resetKey={f.resetKey} />
//           <p role="alert" className="mt-2 min-h-[20px] text-sm text-red-600">
//             {f.error}
//           </p>
//           <button onClick={onSetup} className="mt-2 w-full text-sm font-semibold text-[#1f4aa8]">
//             Set up a new phone
//           </button>
//         </>
//       ) : (
//         <>
//           <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
//             Your authenticator is not set up yet.
//           </p>
//           <button onClick={onSetup} className={primaryButton}>
//             Set up my authenticator
//           </button>
//         </>
//       )}

//       <button onClick={onLogout} className={`${quietButton} mt-4`}>
//         Not {me.name.split(" ")[0]}? Log out
//       </button>
//     </>
//   );
// }

// /* ---------------- Authenticator QR for the signed-in person ---------------- */
// function SetupOwn({ token, onDone, onCancel }) {
//   const [enrolment, setEnrolment] = useState(null);
//   const f = useCodeFeedback();
//   const started = useRef(false);

//   const start = useCallback(async () => {
//     f.setError("");
//     try {
//       const { ok, status, body } = await request("POST", "/api/attendance/totp/enroll", { reset: true }, token);
//       if (!ok) throw new Error(readError(status, body));
//       setEnrolment(body);
//     } catch (e) {
//       f.setError(e.message);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   useEffect(() => {
//     // One request only: each call issues a new secret, and the QR must match the last one.
//     if (started.current) return;
//     started.current = true;
//     start();
//   }, [start]);

//   const confirm = async (code) => {
//     f.setBusy(true);
//     f.setError("");
//     try {
//       const { ok, status, body } = await request("POST", "/api/attendance/totp/confirm", { code }, token);
//       if (!ok) throw new Error(readError(status, body));
//       onDone();
//     } catch (e) {
//       f.fail(e.message);
//     } finally {
//       f.setBusy(false);
//     }
//   };

//   return (
//     <>
//       <h2 className="text-2xl font-extrabold text-slate-900">Set up your phone</h2>
//       <p className="mb-4 mt-1 text-sm text-slate-500">
//         Scan this with Google or Microsoft Authenticator, then type the code it shows.
//       </p>

//       {enrolment ? (
//         <>
//           <div className="grid place-items-center rounded-2xl border border-slate-200 p-4">
//             <img src={enrolment.qrDataUrl} alt="Authenticator QR code" className="h-48 w-48" />
//           </div>
//           <p className="mt-3 break-all rounded-xl bg-slate-100 px-3 py-2 text-center font-mono text-xs text-slate-600">
//             {enrolment.manualKey}
//           </p>
//           <p className="mb-2 mt-4 text-sm font-semibold text-slate-500">Code from your app</p>
//           <CodeBoxes onComplete={confirm} busy={f.busy} shake={f.shake} resetKey={f.resetKey} />
//         </>
//       ) : (
//         !f.error && <p className="py-10 text-center text-slate-400">Preparing your QR code…</p>
//       )}

//       <p role="alert" className="mt-2 min-h-[20px] text-sm text-red-600">
//         {f.error}
//       </p>
//       <button onClick={onCancel} className={`${quietButton} mt-2`}>
//         Cancel
//       </button>
//     </>
//   );
// }

// /* ---------------- PATIENT: ID + registered mobile ---------------- */
// function PatientForm({ onPunched }) {
//   const [id, setId] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [error, setError] = useState("");
//   const [busy, setBusy] = useState(false);

//   const cleanId = id.trim().toUpperCase();
//   const digits = mobile.replace(/\D/g, "");

//   const submit = async () => {
//     setBusy(true);
//     setError("");
//     try {
//       const { ok, status, body } = await request("POST", "/api/attendance/patient/punch", {
//         patientId: cleanId,
//         contactNumber: digits,
//       });
//       if (!ok) {
//         setError(readError(status, body));
//         return;
//       }
//       onPunched(body);
//     } catch {
//       setError("Could not reach the server.");
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <>
//       <label className="mb-2 block text-sm font-semibold text-slate-500" htmlFor="pid">
//         Patient ID
//       </label>
//       <input
//         id="pid"
//         value={id}
//         onChange={(e) => setId(e.target.value.toUpperCase())}
//         placeholder="e.g. PT-0042"
//         autoFocus
//         autoComplete="off"
//         className={inputClass}
//       />
//       <label className="mb-2 mt-4 block text-sm font-semibold text-slate-500" htmlFor="pmob">
//         Registered mobile number
//       </label>
//       <input
//         id="pmob"
//         value={mobile}
//         inputMode="numeric"
//         autoComplete="off"
//         maxLength={14}
//         onChange={(e) => setMobile(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && cleanId && digits.length === 10 && submit()}
//         placeholder="10-digit number"
//         className={inputClass}
//       />
//       <p role="alert" className="mt-2 min-h-[20px] text-sm text-red-600">
//         {error}
//       </p>
//       <button onClick={submit} disabled={busy || !cleanId || digits.length !== 10} className={primaryButton}>
//         {busy ? "Checking…" : "Check in / out"}
//       </button>
//       <p className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
//         First time today starts your session. Second time ends it.
//       </p>
//     </>
//   );
// }

// /* ---------------- the one result screen ---------------- */
// function ResultCard({ result, secondsLeft, onOpenDashboard, onDone }) {
//   const out = result.action === "out";
//   const worked = fmtWorked(result.data?.workedMinutes);

//   const heading =
//     result.kind === "patient"
//       ? out
//         ? "Session ended"
//         : result.action === "done"
//           ? "Already recorded today"
//           : "Session started"
//       : out
//         ? "Checked out"
//         : "Checked in";

//   return (
//     <div className="text-center">
//       <div
//         className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full text-3xl text-white ${
//           out ? "bg-sky-500" : "bg-emerald-500"
//         }`}
//         aria-hidden="true"
//       >
//         ✓
//       </div>
//       <h2 className="text-3xl font-extrabold text-slate-900">{heading}</h2>
//       <p className="mt-1 text-lg text-slate-600">{result.name}</p>
//       {result.sub && <p className="text-sm text-slate-400">{result.sub}</p>}

//       <div className="my-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-4">
//         {[
//           [result.kind === "patient" ? "Started" : "In", fmtTime(result.data?.inTime)],
//           [result.kind === "patient" ? "Ended" : "Out", fmtTime(result.data?.outTime)],
//           ["Time", worked || "--"],
//         ].map(([label, value]) => (
//           <div key={label}>
//             <p className="text-lg font-bold text-slate-900">{value}</p>
//             <p className="text-xs text-slate-500">{label}</p>
//           </div>
//         ))}
//       </div>

//       {result.data?.late && !out && (
//         <p className="mb-4 rounded-2xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
//           Marked late today.
//         </p>
//       )}

//       {result.kind === "patient" && result.stats && (
//         <p className="mb-4 text-sm text-slate-500">
//           {result.stats.attended} {result.stats.attended === 1 ? "session" : "sessions"} attended in total.
//         </p>
//       )}

//       {result.kind === "employee" && !out && (
//         <button onClick={onOpenDashboard} className={primaryButton}>
//           Open dashboard
//         </button>
//       )}

//       <p className="mt-4 text-sm text-slate-400">
//         {result.kind === "employee" && out
//           ? `You have been logged out. This screen clears in ${secondsLeft}s.`
//           : `This screen clears in ${secondsLeft}s.`}
//       </p>
//       <button onClick={onDone} className={`${quietButton} mt-3`}>
//         Done
//       </button>
//     </div>
//   );
// }

// /* ---------------- ROOT ---------------- */
// export default function AttendancePortal() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [role, setRole] = useState("employee");
//   const [me, setMe] = useState(null); // signed in: { name, code, totpEnabled, today }
//   const [view, setView] = useState("punch"); // punch | setup
//   const [result, setResult] = useState(null);
//   const [notice, setNotice] = useState("");
//   const [booting, setBooting] = useState(!!readToken());
//   const [secondsLeft, setSecondsLeft] = useState(0);

//   const resultRef = useRef(null);
//   resultRef.current = result;

//   // The navbar reads localStorage on render, so nudge the router after the
//   // token changes to make the sidebar appear or disappear.
//   const refreshNavbar = useCallback(() => {
//     navigate(location.pathname, { replace: true, state: { at: Date.now() } });
//   }, [navigate, location.pathname]);

//   const clearLogin = useCallback(() => {
//     try {
//       STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
//     } catch {
//       /* storage unavailable */
//     }
//   }, []);

//   const logout = useCallback(
//     (message = "") => {
//       clearLogin();
//       setMe(null);
//       setView("punch");
//       setResult(null);
//       setNotice(message);
//       refreshNavbar();
//     },
//     [clearLogin, refreshNavbar],
//   );

//   // Who is signed in on this device, and where they are in today.
//   const loadMe = useCallback(async () => {
//     const token = readToken();
//     if (!token) {
//       setMe(null);
//       return;
//     }
//     try {
//       const { ok, status, body } = await request("GET", "/api/attendance/me/today", null, token);
//       if (!ok) {
//         if (status === 401) {
//           clearLogin();
//           setMe(null);
//           refreshNavbar();
//         }
//         return;
//       }
//       if (body.today?.outTime) {
//         // Day already ended - the rule is that they are logged out.
//         clearLogin();
//         setMe(null);
//         refreshNavbar();
//         setNotice("You have already checked out for today.");
//         return;
//       }
//       setMe({
//         name: body.employee?.fullName || "there",
//         code: body.employee?.employeeId,
//         totpEnabled: !!body.totpEnabled,
//         today: body.today,
//       });
//     } catch {
//       /* offline: fall back to the signed-out form */
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     loadMe().finally(() => setBooting(false));
//   }, [loadMe]);

//   // Result screens clear themselves so the next person starts from a blank form.
//   const finish = useCallback(() => {
//     const r = resultRef.current;
//     if (!r) return;
//     setResult(null);
//     if (r.kind === "employee" && r.action === "out") {
//       clearLogin();
//       setMe(null);
//       setNotice("You have been checked out and logged out. See you tomorrow.");
//       refreshNavbar();
//     } else if (r.kind === "employee") {
//       loadMe();
//     }
//   }, [clearLogin, refreshNavbar, loadMe]);

//   const resultKey = result ? `${result.kind}-${result.action}-${result.data?._id}-${result.data?.outTime}` : "";
//   useEffect(() => {
//     if (!resultRef.current) return undefined;
//     setSecondsLeft(resultRef.current.resetAfter);
//     const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
//     return () => clearInterval(timer);
//   }, [resultKey]);

//   useEffect(() => {
//     if (result && secondsLeft === 0) finish();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [secondsLeft]);

//   const showEmployeeResult = (body, name, code) => {
//     setNotice("");
//     setResult({
//       kind: "employee",
//       action: body.action,
//       name,
//       sub: code,
//       data: body.data,
//       resetAfter: body.action === "out" ? CHECK_OUT_RESULT_SECONDS : CHECK_IN_RESULT_SECONDS,
//     });
//   };

//   // Not signed in: start of day also logs them in.
//   const onEmployeePunched = (body) => {
//     const details = body.employee?.personalDetails || {};
//     if (body.action === "in" && body.token) {
//       try {
//         localStorage.setItem("webapptoken", body.token);
//         localStorage.setItem("loginEmployeeData", JSON.stringify(body.employee));
//       } catch {
//         /* storage unavailable - the result still shows, they just are not signed in */
//       }
//       refreshNavbar();
//     }
//     showEmployeeResult(body, details.fullName || "Employee", details.employeeId);
//   };

//   // Already signed in: nothing to store.
//   const onSignedInPunched = (body) => showEmployeeResult(body, me.name, me.code);

//   const onPatientPunched = (body) => {
//     setNotice("");
//     setResult({
//       kind: "patient",
//       action: body.action,
//       name: body.patient.name,
//       sub: body.patient.patientId,
//       data: body.data,
//       stats: body.stats,
//       resetAfter: body.action === "in" ? CHECK_IN_RESULT_SECONDS : CHECK_OUT_RESULT_SECONDS,
//     });
//   };

//   if (booting) {
//     return (
//       <>
//         <Styles />
//         <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-slate-50 text-slate-500">
//           Loading…
//         </div>
//       </>
//     );
//   }

//   let body;
//   if (result) {
//     body = (
//       <ResultCard
//         result={result}
//         secondsLeft={secondsLeft}
//         onOpenDashboard={() => navigate("/")}
//         onDone={finish}
//       />
//     );
//   } else if (role === "patient") {
//     body = <PatientForm onPunched={onPatientPunched} />;
//   } else if (me && view === "setup") {
//     body = (
//       <SetupOwn
//         token={readToken()}
//         onDone={() => {
//           setView("punch");
//           setNotice("Authenticator ready. Enter the current code to start your day.");
//           loadMe();
//         }}
//         onCancel={() => setView("punch")}
//       />
//     );
//   } else if (me) {
//     body = (
//       <SignedInForm
//         me={me}
//         onPunched={onSignedInPunched}
//         onSetup={() => setView("setup")}
//         onLogout={() => logout()}
//       />
//     );
//   } else {
//     body = <EmployeeForm onPunched={onEmployeePunched} />;
//   }

//   const showTabs = !result && !(me && view === "setup");

//   return (
//     <>
//       <Styles />
//       <Card tabs={showTabs ? <RoleTabs role={role} onChange={(r) => { setRole(r); setNotice(""); }} /> : null}>
//         {notice && !result && (
//           <p className="mb-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 ring-1 ring-sky-200">
//             {notice}
//           </p>
//         )}
//         {body}
//       </Card>
//     </>
//   );
// }



import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------
   Movement Rehab: daily attendance (employees and patients)

   One open page, one screen, one go. Nobody needs the admin's email and
   password - those are only for the owner's dashboard.

   EMPLOYEE  Employee ID + the 6-digit code from their authenticator app.
     First code of the day  = start of day: checked in, and logged in.
     Second code of the day = end of day:   checked out, and logged out.
     The owner sets each employee's authenticator up once, from
     Staff Attendance (the QR is shown on the owner's screen).
       POST /api/attendance/punch          { employeeId, code }

   SIGNED-IN person (the owner, or an employee already logged in):
     only the code is needed.
       GET  /api/attendance/me/today
       POST /api/attendance/selfCheckIn    { code }
       POST /api/attendance/totp/enroll    (their own QR)
       POST /api/attendance/totp/confirm   { code }

   PATIENT   Patient ID + the mobile number registered with the clinic.
       POST /api/attendance/patient/punch  { patientId, contactNumber }

   Both punches only work from the clinic network (enforced by the server).
------------------------------------------------------------------- */

const API = import.meta.env.VITE_BACKEND_URL;
const IST = "Asia/Kolkata";

// How long the result stays on screen before the page clears itself.
const CHECK_IN_RESULT_SECONDS = 10;
const CHECK_OUT_RESULT_SECONDS = 5;

const STORAGE_KEYS = ["webapptoken", "employeeData", "loginEmployeeData"];

const readToken = () => {
  try {
    return localStorage.getItem("webapptoken");
  } catch {
    return null;
  }
};

const authHeaders = (token = readToken()) => ({
  "Content-Type": "application/json",
  ...(token ? { token } : {}),
});

// Marking attendance also sends where the phone is, so the clinic can insist
// on being there. A fresh reading is asked for each time (never a remembered one).
const PUNCH_PATHS = ["/api/attendance/punch", "/api/attendance/selfCheckIn", "/api/attendance/patient/punch"];
let lastLocationProblem = "";

const getLocation = () =>
  new Promise((resolve) => {
    lastLocationProblem = "";
    if (!navigator.geolocation) {
      lastLocationProblem = "unsupported";
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (err) => {
        lastLocationProblem = err.code === 1 ? "denied" : "unavailable";
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  });

const request = async (method, path, payload, token) => {
  const location = PUNCH_PATHS.includes(path) ? await getLocation() : null;
  const res = await fetch(`${API}${path}`, {
    method,
    headers: authHeaders(token),
    ...(payload ? { body: JSON.stringify(location ? { ...payload, location } : payload) } : {}),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
};

const fmtTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: IST,
      })
    : "--";

const fmtWorked = (minutes) =>
  minutes === null || minutes === undefined
    ? null
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

/** Turns a failed response into a message worth showing. */
const readError = (status, body) => {
  if (body?.code === "LOCATION_REQUIRED") {
    if (lastLocationProblem === "denied") {
      return "Location is blocked. Allow location for this site in your browser settings, then try again.";
    }
    if (lastLocationProblem === "unavailable") {
      return "Could not get your location. Turn on GPS and try again.";
    }
    return "Turn on location for this site to mark attendance, then try again.";
  }
  if (body?.code === "LOCATION_TOO_VAGUE") {
    return "Your location is not precise enough. Turn on GPS, or step near a window, and try again.";
  }
  if (body?.code === "OUTSIDE_CLINIC_AREA") {
    return body.message || "Attendance can only be marked at the clinic.";
  }
  if (body?.code === "CLINIC_LOCATION_NOT_CONFIGURED") {
    return "Attendance is not set up yet. Ask the owner to set the clinic location.";
  }
  if (body?.code === "OUTSIDE_CLINIC_NETWORK") {
    return "Attendance can only be marked on the clinic's WiFi. Connect to it and try again.";
  }
  if (body?.code === "CLINIC_IP_NOT_CONFIGURED") {
    return "Attendance is not set up yet. Ask the owner to set the clinic network.";
  }
  if (body?.code === "NOT_ENROLLED") {
    return "Your authenticator is not set up yet. Ask the owner to set it up for you.";
  }
  if (body?.code === "ALREADY_COMPLETE") {
    return "You have already checked in and out today.";
  }
  if (status === 401 && !body?.code) return "Your session has expired. Please sign in again.";
  return body?.message || "Something went wrong. Please try again.";
};

/* ---------------- visual bits ---------------- */
const Styles = () => (
  <style>{`
    @keyframes mrShake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
    @keyframes mrRise{from{opacity:0;transform:translateY(12px)}}
    .mr-shake{animation:mrShake .4s}.mr-rise{animation:mrRise .4s}
    @media(prefers-reduced-motion:reduce){.mr-shake,.mr-rise{animation:none}}
  `}</style>
);

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-bold tracking-widest outline-none transition focus:border-[#1f4aa8] focus:ring-4 focus:ring-blue-100";
const primaryButton =
  "w-full rounded-2xl bg-gradient-to-r from-[#1f4aa8] to-[#2f6fd6] py-3.5 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 active:scale-95 disabled:pointer-events-none disabled:opacity-50";
const quietButton =
  "w-full rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200";

/** One centred card. Everything on this page lives inside it. */
function Card({ children, tabs }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-slate-50 p-4">
      <div className="mr-rise w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5">
        <p className="mb-5 text-center text-xl font-extrabold text-[#1f4aa8]">
          Movement <span className="text-[#4fc3c9]">Rehab</span>
        </p>
        {tabs}
        {children}
      </div>
    </div>
  );
}

function RoleTabs({ role, onChange }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1.5" role="tablist">
      {[
        ["employee", "Employee"],
        ["patient", "Patient"],
      ].map(([key, label]) => (
        <button
          key={key}
          role="tab"
          aria-selected={role === key}
          onClick={() => role !== key && onChange(key)}
          className={`rounded-xl py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4aa8] ${
            role === key ? "bg-white text-[#1f4aa8] shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Six single-digit boxes with paste support; submits itself on the sixth digit. */
function CodeBoxes({ onComplete, busy, shake, resetKey }) {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const boxes = useRef([]);

  useEffect(() => {
    setDigits(Array(6).fill(""));
    // Do not steal focus from the ID field on first paint.
    if (resetKey > 0) boxes.current[0]?.focus();
  }, [resetKey]);

  const setDigit = (i, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < 5) boxes.current[i + 1]?.focus();
    if (next.every(Boolean)) onComplete(next.join(""));
  };

  const paste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    setDigits(
      Array(6)
        .fill("")
        .map((_, i) => text[i] || ""),
    );
    if (text.length === 6) onComplete(text);
    else boxes.current[text.length]?.focus();
  };

  return (
    <div className={`flex justify-between gap-2 ${shake ? "mr-shake" : ""}`} onPaste={paste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (boxes.current[i] = el)}
          value={digit}
          disabled={busy}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`Code digit ${i + 1}`}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => e.key === "Backspace" && !digit && boxes.current[i - 1]?.focus()}
          className="h-14 w-full rounded-2xl border border-slate-200 bg-white text-center text-2xl font-bold outline-none transition focus:border-[#1f4aa8] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
        />
      ))}
    </div>
  );
}

/** Shared "wrong code" behaviour: show the message, shake, clear the boxes. */
function useCodeFeedback() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const fail = (message) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 450);
    setResetKey((k) => k + 1);
  };

  return { error, setError, busy, setBusy, shake, resetKey, fail };
}

/* ---------------- EMPLOYEE (not signed in): ID + code, one screen ---------------- */
function EmployeeForm({ onPunched }) {
  const [id, setId] = useState("");
  const f = useCodeFeedback();
  const cleanId = id.trim().toUpperCase();

  const submit = async (code) => {
    if (!cleanId) {
      f.fail("Enter your Employee ID first.");
      return;
    }
    f.setBusy(true);
    f.setError("");
    try {
      const { ok, status, body } = await request("POST", "/api/attendance/punch", {
        employeeId: cleanId,
        code,
      });
      if (ok) {
        onPunched(body);
        return;
      }
      f.fail(readError(status, body));
    } catch {
      f.fail("Could not reach the server.");
    } finally {
      f.setBusy(false);
    }
  };

  return (
    <>
      <label className="mb-2 block text-sm font-semibold text-slate-500" htmlFor="eid">
        Employee ID
      </label>
      <input
        id="eid"
        value={id}
        onChange={(e) => setId(e.target.value.toUpperCase())}
        placeholder="e.g. MR-EMP-0012"
        autoFocus
        autoComplete="off"
        className={inputClass}
      />

      <p className="mb-2 mt-5 text-sm font-semibold text-slate-500">
        6-digit code from your authenticator app
      </p>
      <CodeBoxes onComplete={submit} busy={f.busy} shake={f.shake} resetKey={f.resetKey} />
      <p role="alert" className="mt-2 min-h-[20px] text-sm text-red-600">
        {f.error}
      </p>

      <p className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
        First code of the day checks you in. Second code checks you out. No authenticator yet? Ask
        the owner to set it up for you.
      </p>
    </>
  );
}

/* ---------------- SIGNED IN (owner / logged-in employee): code only ---------------- */
function SignedInForm({ me, onPunched, onSetup, onLogout }) {
  const f = useCodeFeedback();
  const checkedIn = !!me.today?.inTime;

  const submit = async (code) => {
    f.setBusy(true);
    f.setError("");
    try {
      const { ok, status, body } = await request("POST", "/api/attendance/selfCheckIn", { code });
      if (ok) {
        onPunched(body);
        return;
      }
      f.fail(readError(status, body));
    } catch {
      f.fail("Could not reach the server.");
    } finally {
      f.setBusy(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-extrabold text-slate-900">Hello, {me.name.split(" ")[0]}</h2>
      <p className="mb-5 mt-1 text-slate-500">
        {checkedIn
          ? `You checked in at ${fmtTime(me.today.inTime)}. Enter a code to check out.`
          : "Enter a code to start your day."}
      </p>

      {me.totpEnabled ? (
        <>
          <CodeBoxes onComplete={submit} busy={f.busy} shake={f.shake} resetKey={f.resetKey} />
          <p role="alert" className="mt-2 min-h-[20px] text-sm text-red-600">
            {f.error}
          </p>
          <button onClick={onSetup} className="mt-2 w-full text-sm font-semibold text-[#1f4aa8]">
            Set up a new phone
          </button>
        </>
      ) : (
        <>
          <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            Your authenticator is not set up yet.
          </p>
          <button onClick={onSetup} className={primaryButton}>
            Set up my authenticator
          </button>
        </>
      )}

      <button onClick={onLogout} className={`${quietButton} mt-4`}>
        Not {me.name.split(" ")[0]}? Log out
      </button>
    </>
  );
}

/* ---------------- Authenticator QR for the signed-in person ---------------- */
function SetupOwn({ token, onDone, onCancel }) {
  const [enrolment, setEnrolment] = useState(null);
  const f = useCodeFeedback();
  const started = useRef(false);

  const start = useCallback(async () => {
    f.setError("");
    try {
      const { ok, status, body } = await request("POST", "/api/attendance/totp/enroll", { reset: true }, token);
      if (!ok) throw new Error(readError(status, body));
      setEnrolment(body);
    } catch (e) {
      f.setError(e.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    // One request only: each call issues a new secret, and the QR must match the last one.
    if (started.current) return;
    started.current = true;
    start();
  }, [start]);

  const confirm = async (code) => {
    f.setBusy(true);
    f.setError("");
    try {
      const { ok, status, body } = await request("POST", "/api/attendance/totp/confirm", { code }, token);
      if (!ok) throw new Error(readError(status, body));
      onDone();
    } catch (e) {
      f.fail(e.message);
    } finally {
      f.setBusy(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-extrabold text-slate-900">Set up your phone</h2>
      <p className="mb-4 mt-1 text-sm text-slate-500">
        Scan this with Google or Microsoft Authenticator, then type the code it shows.
      </p>

      {enrolment ? (
        <>
          <div className="grid place-items-center rounded-2xl border border-slate-200 p-4">
            <img src={enrolment.qrDataUrl} alt="Authenticator QR code" className="h-48 w-48" />
          </div>
          <p className="mt-3 break-all rounded-xl bg-slate-100 px-3 py-2 text-center font-mono text-xs text-slate-600">
            {enrolment.manualKey}
          </p>
          <p className="mb-2 mt-4 text-sm font-semibold text-slate-500">Code from your app</p>
          <CodeBoxes onComplete={confirm} busy={f.busy} shake={f.shake} resetKey={f.resetKey} />
        </>
      ) : (
        !f.error && <p className="py-10 text-center text-slate-400">Preparing your QR code…</p>
      )}

      <p role="alert" className="mt-2 min-h-[20px] text-sm text-red-600">
        {f.error}
      </p>
      <button onClick={onCancel} className={`${quietButton} mt-2`}>
        Cancel
      </button>
    </>
  );
}

/* ---------------- PATIENT: Patient ID OR registered mobile ---------------- */
function PatientForm({ onPunched }) {
  const [lookupBy, setLookupBy] = useState("patientId");
  const [id, setId] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const cleanId = id.trim().toUpperCase();
  const digits = mobile.replace(/\D/g, "");
  const hasValidValue =
    lookupBy === "patientId" ? Boolean(cleanId) : digits.length === 10;

  const submit = async () => {
    if (!hasValidValue || busy) return;

    setBusy(true);
    setError("");

    // Send exactly one identifier. The backend endpoint must support
    // looking up a patient by either patientId OR contactNumber.
    const payload =
      lookupBy === "patientId"
        ? { patientId: cleanId }
        : { contactNumber: digits };

    try {
      const { ok, status, body } = await request(
        "POST",
        "/api/attendance/patient/punch",
        payload
      );

      if (!ok) {
        setError(readError(status, body));
        return;
      }

      onPunched(body);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="mb-3 text-sm font-semibold text-slate-500">
        Choose one way to identify yourself
      </p>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
        <button
          type="button"
          onClick={() => {
            setLookupBy("patientId");
            setError("");
          }}
          aria-pressed={lookupBy === "patientId"}
          className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
            lookupBy === "patientId"
              ? "bg-white text-[#1f4aa8] shadow"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Patient ID
        </button>
        <button
          type="button"
          onClick={() => {
            setLookupBy("mobile");
            setError("");
          }}
          aria-pressed={lookupBy === "mobile"}
          className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
            lookupBy === "mobile"
              ? "bg-white text-[#1f4aa8] shadow"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Mobile number
        </button>
      </div>

      {lookupBy === "patientId" ? (
        <>
          <label
            className="mb-2 block text-sm font-semibold text-slate-500"
            htmlFor="pid"
          >
            Patient ID
          </label>
          <input
            id="pid"
            value={id}
            onChange={(e) => setId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && cleanId && submit()}
            placeholder="e.g. PT-0042"
            autoFocus
            autoComplete="off"
            className={inputClass}
          />
        </>
      ) : (
        <>
          <label
            className="mb-2 block text-sm font-semibold text-slate-500"
            htmlFor="pmob"
          >
            Registered mobile number
          </label>
          <input
            id="pmob"
            value={mobile}
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            onKeyDown={(e) => e.key === "Enter" && digits.length === 10 && submit()}
            placeholder="10-digit number"
            className={inputClass}
          />
        </>
      )}

      <p role="alert" className="mt-2 min-h-[20px] text-sm text-red-600">
        {error}
      </p>

      <button
        type="button"
        onClick={submit}
        disabled={busy || !hasValidValue}
        className={primaryButton}
      >
        {busy ? "Checking…" : "Check in / out"}
      </button>

      <p className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
        Enter either your Patient ID or the mobile number registered with the
        clinic. You do not need both. First time today starts your session;
        second time ends it.
      </p>
    </>
  );
}

/* ---------------- the one result screen ---------------- */
function ResultCard({ result, secondsLeft, onOpenDashboard, onDone }) {
  const out = result.action === "out";
  const worked = fmtWorked(result.data?.workedMinutes);

  const heading =
    result.kind === "patient"
      ? out
        ? "Session ended"
        : result.action === "done"
          ? "Already recorded today"
          : "Session started"
      : out
        ? "Checked out"
        : "Checked in";

  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full text-3xl text-white ${
          out ? "bg-sky-500" : "bg-emerald-500"
        }`}
        aria-hidden="true"
      >
        ✓
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900">{heading}</h2>
      <p className="mt-1 text-lg text-slate-600">{result.name}</p>
      {result.sub && <p className="text-sm text-slate-400">{result.sub}</p>}

      <div className="my-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-4">
        {[
          [result.kind === "patient" ? "Started" : "In", fmtTime(result.data?.inTime)],
          [result.kind === "patient" ? "Ended" : "Out", fmtTime(result.data?.outTime)],
          ["Time", worked || "--"],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-lg font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {result.data?.late && !out && (
        <p className="mb-4 rounded-2xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
          Marked late today.
        </p>
      )}

      {result.kind === "patient" && result.stats && (
        <p className="mb-4 text-sm text-slate-500">
          {result.stats.attended} {result.stats.attended === 1 ? "session" : "sessions"} attended in total.
        </p>
      )}

      {result.kind === "employee" && !out && (
        <button onClick={onOpenDashboard} className={primaryButton}>
          Open dashboard
        </button>
      )}

      <p className="mt-4 text-sm text-slate-400">
        {result.kind === "employee" && out
          ? `You have been logged out. This screen clears in ${secondsLeft}s.`
          : `This screen clears in ${secondsLeft}s.`}
      </p>
      <button onClick={onDone} className={`${quietButton} mt-3`}>
        Done
      </button>
    </div>
  );
}

/* ---------------- ROOT ---------------- */
export default function AttendancePortal() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("employee");
  const [me, setMe] = useState(null); // signed in: { name, code, totpEnabled, today }
  const [view, setView] = useState("punch"); // punch | setup
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState("");
  const [booting, setBooting] = useState(!!readToken());
  const [secondsLeft, setSecondsLeft] = useState(0);

  const resultRef = useRef(null);
  resultRef.current = result;

  // The navbar reads localStorage on render, so nudge the router after the
  // token changes to make the sidebar appear or disappear.
  const refreshNavbar = useCallback(() => {
    navigate(location.pathname, { replace: true, state: { at: Date.now() } });
  }, [navigate, location.pathname]);

  const clearLogin = useCallback(() => {
    try {
      STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const logout = useCallback(
    (message = "") => {
      clearLogin();
      setMe(null);
      setView("punch");
      setResult(null);
      setNotice(message);
      refreshNavbar();
    },
    [clearLogin, refreshNavbar],
  );

  // Who is signed in on this device, and where they are in today.
  const loadMe = useCallback(async () => {
    const token = readToken();
    if (!token) {
      setMe(null);
      return;
    }
    try {
      const { ok, status, body } = await request("GET", "/api/attendance/me/today", null, token);
      if (!ok) {
        if (status === 401) {
          clearLogin();
          setMe(null);
          refreshNavbar();
        }
        return;
      }
      if (body.today?.outTime) {
        // Day already ended - the rule is that they are logged out.
        clearLogin();
        setMe(null);
        refreshNavbar();
        setNotice("You have already checked out for today.");
        return;
      }
      setMe({
        name: body.employee?.fullName || "there",
        code: body.employee?.employeeId,
        totpEnabled: !!body.totpEnabled,
        today: body.today,
      });
    } catch {
      /* offline: fall back to the signed-out form */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadMe().finally(() => setBooting(false));
  }, [loadMe]);

  // Result screens clear themselves so the next person starts from a blank form.
  const finish = useCallback(() => {
    const r = resultRef.current;
    if (!r) return;
    setResult(null);
    if (r.kind === "employee" && r.action === "out") {
      clearLogin();
      setMe(null);
      setNotice("You have been checked out and logged out. See you tomorrow.");
      refreshNavbar();
    } else if (r.kind === "employee") {
      loadMe();
    }
  }, [clearLogin, refreshNavbar, loadMe]);

  const resultKey = result ? `${result.kind}-${result.action}-${result.data?._id}-${result.data?.outTime}` : "";
  useEffect(() => {
    if (!resultRef.current) return undefined;
    setSecondsLeft(resultRef.current.resetAfter);
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resultKey]);

  useEffect(() => {
    if (result && secondsLeft === 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const showEmployeeResult = (body, name, code) => {
    setNotice("");
    setResult({
      kind: "employee",
      action: body.action,
      name,
      sub: code,
      data: body.data,
      resetAfter: body.action === "out" ? CHECK_OUT_RESULT_SECONDS : CHECK_IN_RESULT_SECONDS,
    });
  };

  // Not signed in: start of day also logs them in.
  const onEmployeePunched = (body) => {
    const details = body.employee?.personalDetails || {};
    if (body.action === "in" && body.token) {
      try {
        localStorage.setItem("webapptoken", body.token);
        localStorage.setItem("loginEmployeeData", JSON.stringify(body.employee));
      } catch {
        /* storage unavailable - the result still shows, they just are not signed in */
      }
      refreshNavbar();
    }
    showEmployeeResult(body, details.fullName || "Employee", details.employeeId);
  };

  // Already signed in: nothing to store.
  const onSignedInPunched = (body) => showEmployeeResult(body, me.name, me.code);

  const onPatientPunched = (body) => {
    setNotice("");
    setResult({
      kind: "patient",
      action: body.action,
      name: body.patient.name,
      sub: body.patient.patientId,
      data: body.data,
      stats: body.stats,
      resetAfter: body.action === "in" ? CHECK_IN_RESULT_SECONDS : CHECK_OUT_RESULT_SECONDS,
    });
  };

  if (booting) {
    return (
      <>
        <Styles />
        <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-slate-50 text-slate-500">
          Loading…
        </div>
      </>
    );
  }

  let body;
  if (result) {
    body = (
      <ResultCard
        result={result}
        secondsLeft={secondsLeft}
        onOpenDashboard={() => navigate("/")}
        onDone={finish}
      />
    );
  } else if (role === "patient") {
    body = <PatientForm onPunched={onPatientPunched} />;
  } else if (me && view === "setup") {
    body = (
      <SetupOwn
        token={readToken()}
        onDone={() => {
          setView("punch");
          setNotice("Authenticator ready. Enter the current code to start your day.");
          loadMe();
        }}
        onCancel={() => setView("punch")}
      />
    );
  } else if (me) {
    body = (
      <SignedInForm
        me={me}
        onPunched={onSignedInPunched}
        onSetup={() => setView("setup")}
        onLogout={() => logout()}
      />
    );
  } else {
    body = <EmployeeForm onPunched={onEmployeePunched} />;
  }

  const showTabs = !result && !(me && view === "setup");

  return (
    <>
      <Styles />
      <Card tabs={showTabs ? <RoleTabs role={role} onChange={(r) => { setRole(r); setNotice(""); }} /> : null}>
        {notice && !result && (
          <p className="mb-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 ring-1 ring-sky-200">
            {notice}
          </p>
        )}
        {body}
      </Card>
    </>
  );
}
