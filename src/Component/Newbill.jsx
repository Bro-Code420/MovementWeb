

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

/*
  Billing page (admin).

  HOW TO CONNECT YOUR REAL BACKEND
  1. Patient search is connected to the live backend; bill saving remains in demo mode.
  2. Check the endpoint and payload in submit() against your bill API.
     The payload keeps your existing bill fields (customer, billType, status, paymentStatus,
     advancePayment, items, total, date) and adds new ones (GST, discount, coupon, installments).
     Your backend must accept and store the new fields.
     installments[].dueDate can be null (custom installments with no fixed date),
     and installmentMode is "equal" or "custom".
  3. Coupons are listed in COUPONS below for now. For real use, validate them on the server.

  Patient search uses your existing GET /api/enquiry/getEnquiry endpoint.
*/

// Patient search uses the live backend. Bill saving remains in demo mode until
// the /api/bill/createBill endpoint and payload are confirmed.
const USE_DEMO_PATIENTS = false;
const USE_DEMO_BILL_SAVE = true;

const BACKEND = import.meta.env.VITE_BACKEND_URL;
const CLINIC = { name: "Movement Rehab", tagline: "Elevate your health & performance" };

const COUPONS = {
  WELCOME10: { kind: "discount", type: "pct", value: 10, label: "Welcome offer, 10% off" },
  FIRSTVISIT: { kind: "discount", type: "flat", value: 200, label: "First visit, ₹200 off" },
  REFER500: { kind: "referral", type: "flat", value: 500, label: "Referral reward, ₹500 off" },
};

const DEMO_PATIENTS = [
  { id: "p1", code: "MR-00099/2026", name: "Anil Verma", phone: "9826996079" },
  { id: "p2", code: "MR-00098/2026", name: "Meena Joshi", phone: "9827528620" },
  { id: "p3", code: "MR-00097/2026", name: "Karan Mehta", phone: "9009390095" },
  { id: "p4", code: "MR-00096/2026", name: "Sita Rathore", phone: "9826795296" },
];

/* ------------------------------ helpers ------------------------------ */

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const num = (v) => (v === "" || v === null || isNaN(Number(v)) ? 0 : Number(v));
const inr = (n) => Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const addMonths = (iso, i) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1 + i, 1);
  const last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  dt.setDate(Math.min(d, last));
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};
const fmtDate = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const freshCustomInst = () => [
  { id: 1, amount: "", dueDate: "", paid: false },
  { id: 2, amount: "", dueDate: "", paid: false },
];

const Icon = ({ d, className = "h-5 w-5" }) => (
  <svg className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICONS = {
  search: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
  plus: "M12 5v14M5 12h14",
  close: "M6 18L18 6M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  alert: "M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  cash: "M2 7h20v10H2zM12 14a2 2 0 100-4 2 2 0 000 4zM6 12h.01M18 12h.01",
  online: "M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1zM11 18h2",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  print: "M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z",
  share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
  lock: "M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1zM8 11V7a4 4 0 118 0v4",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-800 placeholder-slate-400 outline-none transition hover:border-slate-400 focus:border-[#0B4BAA] focus:ring-4 focus:ring-[#00C2CB]/20";

const Card = ({ step, title, sub, children }) => (
  <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
    <div className="mb-5 flex items-center gap-3">
      {step && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0B4BAA] text-sm font-bold text-white">{step}</span>
      )}
      <div>
        <h3 className="text-base font-bold tracking-tight text-slate-900">{title}</h3>
        {sub && <p className="text-sm text-slate-500">{sub}</p>}
      </div>
    </div>
    {children}
  </section>
);

const Label = ({ htmlFor, children, hint }) => (
  <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-slate-700">
    <span>{children}</span>
    {hint && <span className="text-xs font-medium text-slate-400">{hint}</span>}
  </label>
);

const Segment = ({ value, onChange, options, label, cols }) => (
  <div className={`grid gap-1 rounded-xl bg-slate-100 p-1 ${cols}`} role="radiogroup" aria-label={label}>
    {options.map((o) => {
      const on = value === o.value;
      return (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
            on ? "bg-white text-[#0B4BAA] shadow-sm" : "text-slate-600 hover:text-[#0B4BAA]"
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const Money = ({ id, value, onChange, placeholder = "0", ariaLabel }) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₹</span>
    <input
      id={id}
      type="number"
      inputMode="decimal"
      min="0"
      step="any"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={`${inputClass} pl-8`}
    />
  </div>
);

const Row = ({ label, value, tone = "text-slate-800", strong }) => (
  <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className={`${strong ? "text-base font-extrabold" : "font-semibold"} ${tone}`}>{value}</span>
  </div>
);

/* ------------------------------ printable invoice ------------------------------ */

const InvoiceSheet = ({ b }) => (
  <div style={{ maxWidth: "190mm", margin: "0 auto", fontFamily: "Figtree, system-ui, sans-serif", color: "#14302E" }}>
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "3px solid #0B4BAA", paddingBottom: "10px" }}>
      <div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#0B4BAA" }}>{CLINIC.name}</div>
        <div style={{ fontSize: "12px", color: "#5F7573" }}>{CLINIC.tagline}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "20px", fontWeight: 800 }}>INVOICE</div>
        <div style={{ fontSize: "12px" }}>No. {b.billNumber || "-"}</div>
        <div style={{ fontSize: "12px" }}>Date: {fmtDate(b.date)}</div>
      </div>
    </div>

    <div style={{ margin: "16px 0", fontSize: "13px" }}>
      <div style={{ color: "#5F7573", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Billed to</div>
      <div style={{ fontWeight: 700, fontSize: "15px" }}>{b.patient.name}</div>
      <div>{b.patient.phone}{b.patient.code ? ` · ${b.patient.code}` : ""}</div>
      <div>{b.serviceType} service</div>
    </div>

    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
      <thead>
        <tr style={{ background: "#F2F6F5", textAlign: "left" }}>
          <th style={{ padding: "8px" }}>Item</th>
          <th style={{ padding: "8px", textAlign: "right" }}>Qty</th>
          <th style={{ padding: "8px", textAlign: "right" }}>Rate</th>
          <th style={{ padding: "8px", textAlign: "right" }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {b.lines.map((l, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #DCE6E4" }}>
            <td style={{ padding: "8px" }}>{l.name}</td>
            <td style={{ padding: "8px", textAlign: "right" }}>{l.qty}</td>
            <td style={{ padding: "8px", textAlign: "right" }}>{inr(l.price)}</td>
            <td style={{ padding: "8px", textAlign: "right" }}>{inr(l.qty * l.price)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div style={{ marginLeft: "auto", marginTop: "12px", width: "270px", fontSize: "13px" }}>
      {[
        ["Subtotal", inr(b.c.subtotal)],
        b.c.manual > 0 && ["Discount", `- ${inr(b.c.manual)}`],
        b.c.couponDisc > 0 && [`Coupon ${b.coupon?.code || ""}`, `- ${inr(b.c.couponDisc)}`],
        b.c.gstRate > 0 && [`GST (${b.c.gstRate}%)`, inr(b.c.gstAmt)],
      ]
        .filter(Boolean)
        .map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
            <span>{k}</span>
            <span>{v}</span>
          </div>
        ))}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", marginTop: "4px", borderTop: "2px solid #0B4BAA", fontWeight: 800, fontSize: "16px" }}>
        <span>Total</span>
        <span>{inr(b.c.total)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
        <span>Paid ({b.method})</span>
        <span>{inr(b.c.paidNow)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontWeight: 700 }}>
        <span>Balance due</span>
        <span>{inr(b.c.balance)}</span>
      </div>
    </div>

    {b.plan === "installment" && (
      <div style={{ marginTop: "18px", fontSize: "13px" }}>
        <div style={{ fontWeight: 700, marginBottom: "6px" }}>Installment schedule</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {b.c.schedule.map((s) => (
              <tr key={s.no} style={{ borderBottom: "1px solid #DCE6E4" }}>
                <td style={{ padding: "6px 8px" }}>Installment {s.no}</td>
                <td style={{ padding: "6px 8px" }}>{s.dueDate ? fmtDate(s.dueDate) : "Date not fixed"}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{inr(s.amount)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{s.paid ? "Paid" : "Due"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {b.plan === "advance" && b.c.balance > 0 && b.balanceDue && (
      <div style={{ marginTop: "14px", fontSize: "13px" }}>Balance of {inr(b.c.balance)} is due by {fmtDate(b.balanceDue)}.</div>
    )}
    {b.notes && <div style={{ marginTop: "14px", fontSize: "12px", color: "#5F7573" }}>Note: {b.notes}</div>}

    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "48px", fontSize: "12px", color: "#5F7573" }}>
      <span>Thank you for choosing {CLINIC.name}.</span>
      <span style={{ borderTop: "1px solid #5F7573", paddingTop: "4px", minWidth: "140px", textAlign: "center" }}>Authorised signature</span>
    </div>
  </div>
);

/* ------------------------------ page ------------------------------ */

const Billing = () => {
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [patientOpen, setPatientOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [serviceType, setServiceType] = useState("Clinic");

  const [pricePerSession, setPricePerSession] = useState("");
  const [sessions, setSessions] = useState(1);
  const [extras, setExtras] = useState([]);

  const [manualType, setManualType] = useState("flat");
  const [manualValue, setManualValue] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [referredBy, setReferredBy] = useState("");

  const [gstChoice, setGstChoice] = useState(0);
  const [customGst, setCustomGst] = useState("");

  const [method, setMethod] = useState("Cash");
  const [plan, setPlan] = useState("full");
  const [advance, setAdvance] = useState("");
  const [balanceDue, setBalanceDue] = useState("");
  const [instCount, setInstCount] = useState(3);
  const [firstNow, setFirstNow] = useState(true);
  const [startDate, setStartDate] = useState(todayISO());
  const [instMode, setInstMode] = useState("equal"); // "equal" | "custom"
  const [customInst, setCustomInst] = useState(freshCustomInst());

  const [billDate, setBillDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [toast, setToast] = useState(null);

  const reqId = useRef(0);

  let me = null;
  try {
    me = JSON.parse(localStorage.getItem("loginEmployeeData"));
  } catch {
    me = null;
  }
  const isAdmin = me?.personalDetails?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- patient search ---------- */
  useEffect(() => {
    const q = patientQuery.trim();
    if (!q || patient) {
      setPatientResults([]);
      return;
    }
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        let list;
        if (USE_DEMO_PATIENTS) {
          list = DEMO_PATIENTS.filter((p) =>
            `${p.name} ${p.phone} ${p.code}`.toLowerCase().includes(q.toLowerCase())
          );
        } else {
          if (!BACKEND) {
            throw new Error("VITE_BACKEND_URL is missing in your .env file.");
          }

          const backendUrl = BACKEND.replace(/\/$/, "");
          const params = new URLSearchParams({
            page: "1",
            limit: "50",
            activeStatus: "patient",
            patientStatus: "active",
            search: q,
            sortBy: "newest",
          });

          const token = localStorage.getItem("webapptoken");
          const res = await fetch(
            `${backendUrl}/api/enquiry/getEnquiry?${params.toString()}`,
            {
              method: "GET",
              headers: {
                ...(token ? { token } : {}),
              },
            }
          );

          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            throw new Error(json?.message || `Patient search failed (${res.status}).`);
          }

          const enquiries = Array.isArray(json?.enquiries) ? json.enquiries : [];

          list = enquiries
            .filter((e) => e?.patientId && typeof e.patientId === "object" && e.patientId?._id)
            .map((e) => {
              const details = e.patientId?.personalDetails || {};
              return {
                id: e.patientId._id,
                code: details.patientId || e.patientCode || "",
                name: e.patientName || details.name || e.name || "Unnamed patient",
                phone: e.contactNumber || details.contactNumber || e.phone || "",
              };
            })
            .filter((p) => p.id);
        }
        if (id === reqId.current) setPatientResults(list);
      } catch (err) {
        console.error("Patient search failed:", err);
        if (id === reqId.current) setPatientResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [patientQuery, patient]);

  /* ---------- calculations ---------- */
  const c = useMemo(() => {
    const price = num(pricePerSession);
    const qty = Math.max(1, Math.floor(num(sessions)));
    const lines = [
      { name: `${serviceType} session`, qty, price },
      ...extras.filter((x) => x.name.trim() && num(x.price) > 0).map((x) => ({ name: x.name.trim(), qty: Math.max(1, Math.floor(num(x.qty))), price: num(x.price) })),
    ];
    const subtotal = round2(lines.reduce((s, l) => s + l.qty * l.price, 0));

    const manualRaw = manualType === "pct" ? (subtotal * num(manualValue)) / 100 : num(manualValue);
    const manual = round2(Math.min(Math.max(manualRaw, 0), subtotal));
    const afterManual = subtotal - manual;
    const couponRaw = coupon ? (coupon.type === "pct" ? (afterManual * coupon.value) / 100 : coupon.value) : 0;
    const couponDisc = round2(Math.min(couponRaw, afterManual));

    const taxable = round2(subtotal - manual - couponDisc);
    const gstRate = gstChoice === "custom" ? Math.min(Math.max(num(customGst), 0), 28) : gstChoice;
    const gstAmt = round2((taxable * gstRate) / 100);
    const total = round2(taxable + gstAmt);

    let paidNow = 0;
    let schedule = [];
    if (plan === "full") {
      paidNow = total;
    } else if (plan === "advance") {
      paidNow = round2(Math.min(Math.max(num(advance), 0), total));
    } else if (instMode === "custom") {
      schedule = customInst
        .filter((x) => num(x.amount) > 0)
        .map((x, i) => ({ no: i + 1, dueDate: x.dueDate || "", amount: round2(num(x.amount)), paid: x.paid }));
      paidNow = round2(schedule.filter((s) => s.paid).reduce((a, s) => a + s.amount, 0));
    } else {
      const n = Math.max(2, Math.floor(num(instCount)));
      const base = Math.floor((total / n) * 100) / 100;
      schedule = Array.from({ length: n }, (_, i) => ({
        no: i + 1,
        dueDate: addMonths(startDate, i),
        amount: i === n - 1 ? round2(total - base * (n - 1)) : base,
        paid: firstNow && i === 0,
      }));
      paidNow = firstNow && schedule[0] ? schedule[0].amount : 0;
    }
    const balance = round2(total - paidNow);
    const scheduledSum = round2(schedule.reduce((s, x) => s + x.amount, 0));

    return { price, qty, lines, subtotal, manual, couponDisc, taxable, gstRate, gstAmt, total, paidNow, balance, schedule, scheduledSum };
  }, [pricePerSession, sessions, extras, serviceType, manualType, manualValue, coupon, gstChoice, customGst, plan, advance, instCount, firstNow, startDate, instMode, customInst]);

  const errors = useMemo(() => {
    const e = [];
    if (!patient) e.push("Select a patient.");
    if (c.price <= 0) e.push("Enter the price per session.");
    if (num(sessions) < 1) e.push("Sessions must be at least 1.");
    if (manualType === "pct" && num(manualValue) > 100) e.push("Discount cannot be more than 100%.");
    if (manualType === "flat" && num(manualValue) > c.subtotal && c.subtotal > 0) e.push("Discount is more than the subtotal.");
    if (gstChoice === "custom" && (num(customGst) < 0 || num(customGst) > 28)) e.push("GST must be between 0 and 28%.");
    if (c.total <= 0) e.push("The total must be more than zero.");
    if (plan === "advance" && (num(advance) <= 0 || num(advance) >= c.total)) e.push("Advance must be more than 0 and less than the total.");
    if (plan === "installment" && instMode === "custom") {
      if (c.schedule.length < 2) e.push("Add at least 2 installments with an amount.");
      else if (Math.abs(c.scheduledSum - c.total) > 0.01)
        e.push(`Installments add up to ${inr(c.scheduledSum)}, but the total is ${inr(c.total)}.`);
    }
    return e;
  }, [patient, c, sessions, manualType, manualValue, gstChoice, customGst, plan, advance, instMode]);

  const paymentStatusLabel = plan === "full" ? "Fully paid" : plan === "advance" ? "Advance received" : "Installment plan";

  /* ---------- actions ---------- */
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const found = COUPONS[code];
    if (!found) {
      setCoupon(null);
      setCouponError("This code is not valid.");
      return;
    }
    setCoupon({ code, ...found });
    setCouponError("");
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
    setReferredBy("");
  };

  const addExtra = () => setExtras((x) => [...x, { id: Date.now() + Math.random(), name: "", qty: 1, price: "" }]);
  const updateExtra = (id, key, val) => setExtras((x) => x.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
  const removeExtra = (id) => setExtras((x) => x.filter((r) => r.id !== id));

  const addCustomInst = (amount = "") =>
    setCustomInst((x) => [...x, { id: Date.now() + Math.random(), amount, dueDate: "", paid: false }]);
  const updateCustomInst = (id, key, val) =>
    setCustomInst((x) => x.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
  const removeCustomInst = (id) => setCustomInst((x) => x.filter((r) => r.id !== id));

  const resetAll = () => {
    setPatientQuery("");
    setPatient(null);
    setServiceType("Clinic");
    setPricePerSession("");
    setSessions(1);
    setExtras([]);
    setManualType("flat");
    setManualValue("");
    removeCoupon();
    setGstChoice(0);
    setCustomGst("");
    setMethod("Cash");
    setPlan("full");
    setAdvance("");
    setBalanceDue("");
    setInstCount(3);
    setFirstNow(true);
    setStartDate(todayISO());
    setInstMode("equal");
    setCustomInst(freshCustomInst());
    setBillDate(todayISO());
    setNotes("");
    setAttempted(false);
    setSaved(null);
  };

  const submit = async () => {
    setAttempted(true);
    if (errors.length) return;
    setSaving(true);

    const paymentStatus = c.balance <= 0 ? "Paid" : "Unpaid";
    const payload = {
      // existing bill fields
      patientId: patient.id,
      customer: patient.name,
      billType: serviceType,
      status: method,
      paymentStatus,
      advancePayment: c.balance > 0 ? c.paidNow : 0,
      items: c.lines,
      total: c.total,
      date: billDate,
      // new fields (your backend must store these)
      pricePerSession: c.price,
      sessions: c.qty,
      subtotal: c.subtotal,
      discount: { manual: c.manual, manualType, manualValue: num(manualValue) },
      coupon: coupon ? { code: coupon.code, kind: coupon.kind, amount: c.couponDisc, referredBy: referredBy.trim() || undefined } : null,
      gst: { rate: c.gstRate, amount: c.gstAmt },
      paymentPlan: plan,
      balanceDueDate: plan === "advance" ? balanceDue || null : null,
      installmentMode: plan === "installment" ? instMode : null,
      installments: plan === "installment" ? c.schedule.map((s) => ({ ...s, dueDate: s.dueDate || null })) : [],
      notes: notes.trim(),
    };

    try {
      let billNumber = "";
      if (USE_DEMO_BILL_SAVE) {
        await new Promise((r) => setTimeout(r, 600));
        billNumber = "INV-2026-0414";
      } else {
        const res = await fetch(`${BACKEND}/api/bill/createBill`, {
          // TODO: confirm this path with your backend
          method: "POST",
          headers: { "Content-Type": "application/json", token: localStorage.getItem("webapptoken") },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!result?.success) throw new Error(result?.message || "Could not create the bill.");
        billNumber = result?.bill?.billNumber || result?.billNumber || "";
      }
      setSaved({ billNumber, date: billDate, patient, serviceType, lines: c.lines, c, coupon, method, plan, balanceDue, notes: notes.trim() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Create bill failed:", err);
      showToast(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const printInvoice = () => setTimeout(() => window.print(), 100);

  const whatsappLink = (s) => {
    const digits = String(s.patient.phone || "").replace(/\D/g, "");
    const to = digits.length === 10 ? `91${digits}` : digits;
    const L = [];
    L.push(`*${CLINIC.name}*`, `_${CLINIC.tagline}_`, "");
    L.push(`*Invoice:* ${s.billNumber || "-"}`);
    L.push(`*Date:* ${fmtDate(s.date)}`);
    L.push(`*Patient:* ${s.patient.name}${s.patient.code ? ` (${s.patient.code})` : ""}`);
    L.push(`*Service:* ${s.serviceType === "Home" ? "Home visit" : "Clinic visit"}`, "");

    L.push("*Items*");
    s.lines.forEach((l, i) => L.push(`${i + 1}. ${l.name} × ${l.qty} @ ${inr(l.price)} = ${inr(l.qty * l.price)}`));
    L.push("");

    L.push(`Subtotal: ${inr(s.c.subtotal)}`);
    if (s.c.manual > 0) L.push(`Discount: - ${inr(s.c.manual)}`);
    if (s.c.couponDisc > 0) L.push(`Coupon ${s.coupon?.code || ""}: - ${inr(s.c.couponDisc)}`);
    if (s.c.gstRate > 0) L.push(`GST (${s.c.gstRate}%): ${inr(s.c.gstAmt)}`);
    L.push(`*Total: ${inr(s.c.total)}*`);
    L.push(`Paid (${s.method}): ${inr(s.c.paidNow)}`);
    L.push(`*Balance due: ${inr(s.c.balance)}*`);

    if (s.plan === "installment" && s.c.schedule.length) {
      L.push("", "*Installment schedule*");
      s.c.schedule.forEach((x) =>
        L.push(`${x.no}. ${inr(x.amount)} - ${x.dueDate ? fmtDate(x.dueDate) : "Date not fixed"} - ${x.paid ? "Paid" : "Due"}`)
      );
    }
    if (s.plan === "advance" && s.c.balance > 0 && s.balanceDue) {
      L.push("", `Balance of ${inr(s.c.balance)} is due by ${fmtDate(s.balanceDue)}.`);
    }
    if (s.notes) L.push("", `Note: ${s.notes}`);
    L.push("", `Thank you for choosing ${CLINIC.name}.`);
    L.push("", "_T&C apply._");

    return `https://wa.me/${to}?text=${encodeURIComponent(L.join("\n"))}`;
  };

  /* ---------- not admin ---------- */
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-6 pt-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon d={ICONS.lock} className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-800">Admin access only</h2>
        <p className="mt-1.5 text-sm text-slate-500">You are not authorized to create bills.</p>
      </div>
    );
  }

  /* ---------- saved state ---------- */
  if (saved) {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <div className="overflow-hidden rounded-2xl bg-white text-center shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
          <div className="h-1.5 bg-gradient-to-r from-[#00C2CB] via-[#0B4BAA] to-[#082F6B]" />
          <div className="px-6 py-10 sm:px-10">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Icon d={ICONS.check} className="h-8 w-8" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">Bill created</h2>
            <p className="mt-1 text-sm text-slate-500">
              {saved.billNumber ? `Invoice ${saved.billNumber} for ` : "Invoice for "}
              <b className="text-slate-700">{saved.patient.name}</b>
            </p>

            <dl className="mx-auto mt-7 grid max-w-md grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 py-4 ring-1 ring-slate-200">
              <div><dd className="text-lg font-extrabold text-slate-900">{inr(saved.c.total)}</dd><dt className="text-xs text-slate-500">Total</dt></div>
              <div><dd className="text-lg font-extrabold text-emerald-600">{inr(saved.c.paidNow)}</dd><dt className="text-xs text-slate-500">Paid</dt></div>
              <div><dd className={`text-lg font-extrabold ${saved.c.balance > 0 ? "text-amber-600" : "text-slate-900"}`}>{inr(saved.c.balance)}</dd><dt className="text-xs text-slate-500">Balance</dt></div>
            </dl>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={printInvoice} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
                <Icon d={ICONS.print} className="h-4 w-4" /> Print invoice
              </button>
              <a href={whatsappLink(saved)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <Icon d={ICONS.share} className="h-4 w-4" /> Share on WhatsApp
              </a>
              <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl bg-[#0B4BAA] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2">
                <Icon d={ICONS.plus} className="h-4 w-4" /> New bill
              </button>
            </div>
            {USE_DEMO_BILL_SAVE && <p className="mt-6 text-xs text-slate-400">Bill demo mode: nothing was saved to your database.</p>}
          </div>
        </div>

        {createPortal(
          <>
            <style>{`
              .print-sheet { display: none; }
              @page { size: A4; margin: 12mm; }
              @media print {
                #root { display: none !important; }
                body { padding: 0 !important; background: #fff !important; }
                .print-sheet { display: block !important; }
                .print-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            `}</style>
            <div className="print-sheet"><InvoiceSheet b={saved} /></div>
          </>,
          document.body
        )}
      </div>
    );
  }

  /* ---------- form ---------- */
  const showErrors = attempted && errors.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">New bill</h2>
          <p className="mt-0.5 text-sm text-slate-500">Set the price, add tax and discounts, and choose how the patient pays.</p>
        </div>
        <div className="flex items-center gap-3">
          {USE_DEMO_BILL_SAVE && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Bill demo mode</span>}
          <button onClick={resetAll} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
            Reset
          </button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* ---------------- left: form ---------------- */}
        <div className="space-y-6">
          {/* 1 Patient */}
          <Card step="1" title="Patient and service">
            <div className="space-y-5">
              {patient ? (
                <div className="flex items-center gap-3 rounded-xl bg-[#E6F9FA]/70 p-3.5 ring-1 ring-[#00C2CB]/30">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0B4BAA] to-[#082F6B] font-bold uppercase text-white">{patient.name.charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">{patient.name}</p>
                    <p className="text-sm text-slate-600">{patient.code ? `${patient.code} · ` : ""}{patient.phone}</p>
                  </div>
                  <button onClick={() => { setPatient(null); setPatientQuery(""); }} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0B4BAA] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Label htmlFor="patient">Patient</Label>
                  <div className="relative">
                    <Icon d={ICONS.search} className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                    <input
                      id="patient"
                      role="combobox"
                      aria-expanded={patientOpen && patientResults.length > 0}
                      aria-controls="patient-list"
                      autoComplete="off"
                      value={patientQuery}
                      onChange={(e) => { setPatientQuery(e.target.value); setPatientOpen(true); }}
                      onFocus={() => setPatientOpen(true)}
                      onBlur={() => setTimeout(() => setPatientOpen(false), 150)}
                      placeholder="Search by name, phone or patient ID"
                      className={`${inputClass} pl-10 ${attempted && !patient ? "!border-rose-400" : ""}`}
                    />
                  </div>
                  {patientOpen && patientQuery.trim() && (
                    <ul id="patient-list" role="listbox" className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200">
                      {patientResults.length === 0 ? (
                        <li className="px-3 py-3 text-sm text-slate-400">No active patients found.</li>
                      ) : (
                        patientResults.map((p) => (
                          <li key={p.id} role="option" aria-selected="false">
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { setPatient(p); setPatientOpen(false); }}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#E6F9FA]"
                            >
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0B4BAA]/10 text-xs font-bold uppercase text-[#0B4BAA]">{p.name.charAt(0)}</span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-slate-800">{p.name}</span>
                                <span className="block text-xs text-slate-500">{p.code} · {p.phone}</span>
                              </span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label>Service type</Label>
                  <Segment value={serviceType} onChange={setServiceType} label="Service type" cols="grid-cols-2"
                    options={[{ value: "Clinic", label: "Clinic visit" }, { value: "Home", label: "Home visit" }]} />
                </div>
                <div>
                  <Label htmlFor="billDate">Bill date</Label>
                  <input id="billDate" type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </Card>

          {/* 2 Sessions */}
          <Card step="2" title="Sessions and price" sub="Price per session is set by the admin for each bill.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price per session</Label>
                <Money id="price" value={pricePerSession} onChange={setPricePerSession} placeholder="e.g. 800" />
              </div>
              <div>
                <Label htmlFor="sessions">Number of sessions</Label>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Fewer sessions" onClick={() => setSessions(Math.max(1, Math.floor(num(sessions)) - 1))} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-300 text-lg font-bold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">−</button>
                  <input id="sessions" type="number" min="1" inputMode="numeric" value={sessions} onChange={(e) => setSessions(e.target.value)} className={`${inputClass} text-center font-bold`} />
                  <button type="button" aria-label="More sessions" onClick={() => setSessions(Math.floor(num(sessions)) + 1)} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-300 text-lg font-bold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">+</button>
                </div>
              </div>
            </div>

            {/* Extra items */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Extra items <span className="font-normal text-slate-400">(optional, for example equipment or a kit)</span></p>
                <button type="button" onClick={addExtra} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0B4BAA] hover:bg-[#E6F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
                  <Icon d={ICONS.plus} className="h-4 w-4" /> Add item
                </button>
              </div>
              {extras.length > 0 && (
                <ul className="space-y-3">
                  {extras.map((x) => (
                    <li key={x.id} className="grid grid-cols-[1fr_72px_120px_36px] items-center gap-2">
                      <input aria-label="Item name" value={x.name} onChange={(e) => updateExtra(x.id, "name", e.target.value)} placeholder="Item name" className={inputClass} />
                      <input aria-label="Quantity" type="number" min="1" value={x.qty} onChange={(e) => updateExtra(x.id, "qty", e.target.value)} className={`${inputClass} text-center`} />
                      <Money ariaLabel="Item price" value={x.price} onChange={(v) => updateExtra(x.id, "price", v)} placeholder="Price" />
                      <button type="button" aria-label="Remove item" onClick={() => removeExtra(x.id)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
                        <Icon d={ICONS.trash} className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* 3 Discount and coupon */}
          <Card step="3" title="Discount and coupon" sub="Both are optional. The coupon applies after the discount.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="discount">Discount</Label>
                <div className="flex gap-2">
                  <div className="w-32 shrink-0">
                    <Segment value={manualType} onChange={setManualType} label="Discount type" cols="grid-cols-2"
                      options={[{ value: "flat", label: "₹" }, { value: "pct", label: "%" }]} />
                  </div>
                  <input id="discount" type="number" inputMode="decimal" min="0" value={manualValue} onChange={(e) => setManualValue(e.target.value)} placeholder={manualType === "pct" ? "e.g. 10" : "e.g. 100"} className={inputClass} />
                </div>
              </div>

              <div>
                <Label htmlFor="coupon" hint="Discount or referral code">Coupon code</Label>
                {coupon ? (
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3.5 py-2.5 ring-1 ring-emerald-200">
                    <Icon d={ICONS.tag} className="h-5 w-5 text-emerald-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-emerald-800">{coupon.code}</p>
                      <p className="text-xs text-emerald-700">{coupon.label}</p>
                    </div>
                    <button type="button" onClick={removeCoupon} aria-label="Remove coupon" className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                      <Icon d={ICONS.close} className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      id="coupon"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                      placeholder="e.g. WELCOME10"
                      className={`${inputClass} uppercase`}
                    />
                    <button type="button" onClick={applyCoupon} className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2">
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="mt-1.5 text-[13px] font-medium text-rose-600" role="alert">{couponError}</p>}
              </div>
            </div>

            {coupon?.kind === "referral" && (
              <div className="mt-5">
                <Label htmlFor="referredBy" hint="Optional">Referred by</Label>
                <input id="referredBy" value={referredBy} onChange={(e) => setReferredBy(e.target.value)} placeholder="Name of the person who referred this patient" className={inputClass} />
              </div>
            )}
          </Card>

          {/* 4 GST */}
          <Card step="4" title="GST">
            <Segment value={gstChoice} onChange={setGstChoice} label="GST rate" cols="grid-cols-2 sm:grid-cols-4"
              options={[{ value: 0, label: "No GST" }, { value: 5, label: "5%" }, { value: 10, label: "10%" }, { value: "custom", label: "Custom" }]} />
            {gstChoice === "custom" && (
              <div className="mt-4 max-w-xs">
                <Label htmlFor="customGst" hint="0 to 28">Custom GST rate (%)</Label>
                <input id="customGst" type="number" inputMode="decimal" min="0" max="28" value={customGst} onChange={(e) => setCustomGst(e.target.value)} placeholder="e.g. 12" className={inputClass} />
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400">GST is added on top of the amount after discounts.</p>
          </Card>

          {/* 5 Payment */}
          <Card step="5" title="Payment">
            <div className="space-y-6">
              <div>
                <Label>Payment method</Label>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method">
                  {[
                    { v: "Cash", icon: ICONS.cash, sub: "Paid at the clinic" },
                    { v: "Online", icon: ICONS.online, sub: "UPI, card or bank transfer" },
                  ].map((m) => {
                    const on = method === m.v;
                    return (
                      <button
                        key={m.v}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setMethod(m.v)}
                        className={`flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
                          on ? "border-[#0B4BAA] bg-[#0B4BAA]/5" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className={`grid h-10 w-10 place-items-center rounded-lg ${on ? "bg-[#0B4BAA] text-white" : "bg-slate-100 text-slate-500"}`}>
                          <Icon d={m.icon} />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-slate-800">{m.v === "Online" ? "Online" : "Cash"}</span>
                          <span className="block text-xs text-slate-500">{m.sub}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>Payment plan</Label>
                <Segment value={plan} onChange={setPlan} label="Payment plan" cols="grid-cols-1 sm:grid-cols-3"
                  options={[{ value: "full", label: "Full payment" }, { value: "advance", label: "Advance + balance" }, { value: "installment", label: "Installments" }]} />
              </div>

              {plan === "advance" && (
                <div className="grid gap-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="advance">Advance received now</Label>
                    <Money id="advance" value={advance} onChange={setAdvance} placeholder="Amount" />
                    <div className="mt-2 flex gap-2">
                      {[25, 50].map((p) => (
                        <button key={p} type="button" onClick={() => setAdvance(String(round2((c.total * p) / 100)))} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:text-[#0B4BAA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
                          {p}% of total
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="balanceDue" hint="Optional">Balance due by</Label>
                    <input id="balanceDue" type="date" value={balanceDue} onChange={(e) => setBalanceDue(e.target.value)} className={inputClass} />
                    <p className="mt-2 text-sm text-slate-500">Balance: <b className="text-amber-600">{inr(c.balance)}</b></p>
                  </div>
                </div>
              )}

              {plan === "installment" && (
                <div className="space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <Segment value={instMode} onChange={setInstMode} label="Installment type" cols="grid-cols-2"
                    options={[{ value: "equal", label: "Equal monthly" }, { value: "custom", label: "Custom (dates not fixed)" }]} />

                  {instMode === "equal" ? (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="instCount">Number of installments</Label>
                          <select id="instCount" value={instCount} onChange={(e) => setInstCount(Number(e.target.value))} className={inputClass}>
                            {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                              <option key={n} value={n}>{n} installments</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="startDate">First due date</Label>
                          <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                        </div>
                      </div>
                      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                        <input type="checkbox" checked={firstNow} onChange={(e) => setFirstNow(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#0B4BAA] focus:ring-[#00C2CB]" />
                        Collect the first installment now
                      </label>
                      <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                        {c.schedule.map((s) => (
                          <li key={s.no} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                            <span className="font-semibold text-slate-700">Installment {s.no}</span>
                            <span className="text-slate-500">{s.dueDate ? fmtDate(s.dueDate) : "Date not fixed"}</span>
                            <span className="font-bold text-slate-800">{inr(s.amount)}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{s.paid ? "Paid" : "Due"}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-500">Enter each amount. Leave the date empty if the patient will pay whenever they can.</p>
                      <ul className="space-y-3">
                        {customInst.map((x, i) => (
                          <li key={x.id} className="grid grid-cols-[1fr_1fr] items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200 sm:grid-cols-[28px_1fr_1fr_auto_36px]">
                            <span className="hidden text-sm font-bold text-slate-400 sm:block">{i + 1}</span>
                            <Money ariaLabel={`Installment ${i + 1} amount`} value={x.amount} onChange={(v) => updateCustomInst(x.id, "amount", v)} placeholder="Amount" />
                            <input type="date" aria-label={`Installment ${i + 1} due date`} value={x.dueDate} onChange={(e) => updateCustomInst(x.id, "dueDate", e.target.value)} className={inputClass} />
                            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                              <input type="checkbox" checked={x.paid} onChange={(e) => updateCustomInst(x.id, "paid", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#0B4BAA] focus:ring-[#00C2CB]" />
                              Paid now
                            </label>
                            <button type="button" aria-label="Remove installment" onClick={() => removeCustomInst(x.id)} disabled={customInst.length <= 2} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
                              <Icon d={ICONS.trash} className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => addCustomInst()} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0B4BAA] hover:bg-[#E6F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
                            <Icon d={ICONS.plus} className="h-4 w-4" /> Add installment
                          </button>
                          {round2(c.total - c.scheduledSum) > 0 && (
                            <button type="button" onClick={() => addCustomInst(String(round2(c.total - c.scheduledSum)))} className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:text-[#0B4BAA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
                              Add remaining {inr(c.total - c.scheduledSum)}
                            </button>
                          )}
                        </div>
                        {(() => {
                          const left = round2(c.total - c.scheduledSum);
                          return (
                            <span className={`text-sm font-semibold ${Math.abs(left) < 0.01 ? "text-emerald-600" : "text-amber-600"}`}>
                              {Math.abs(left) < 0.01 ? "All allocated" : left > 0 ? `${inr(left)} not allocated` : `${inr(-left)} over the total`}
                            </span>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="notes" hint="Optional">Note on the invoice</Label>
                <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the patient should know" className={inputClass} />
              </div>
            </div>
          </Card>
        </div>

        {/* ---------------- right: summary ---------------- */}
        <aside className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
            <div className="bg-gradient-to-br from-[#0B4BAA] to-[#082F6B] px-6 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">Bill summary</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight">{inr(c.total)}</p>
              <p className="mt-1 text-sm text-blue-100">{patient ? patient.name : "No patient selected"}</p>
            </div>

            <div className="px-6 py-5">
              <ul className="space-y-2 border-b border-slate-100 pb-4">
                {c.lines.map((l, i) => (
                  <li key={i} className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-600">{l.name} <span className="text-slate-400">× {l.qty}</span></span>
                    <span className="font-semibold text-slate-800">{inr(l.qty * l.price)}</span>
                  </li>
                ))}
              </ul>

              <div className="py-3">
                <Row label="Subtotal" value={inr(c.subtotal)} />
                {c.manual > 0 && <Row label="Discount" value={`− ${inr(c.manual)}`} tone="text-emerald-600" />}
                {c.couponDisc > 0 && <Row label={`Coupon ${coupon?.code}`} value={`− ${inr(c.couponDisc)}`} tone="text-emerald-600" />}
                {c.gstRate > 0 && <Row label={`GST (${c.gstRate}%)`} value={inr(c.gstAmt)} />}
              </div>

              <div className="space-y-0.5 border-t-2 border-slate-900 pt-3">
                <Row label="Total" value={inr(c.total)} strong />
                <Row label={`Paid now (${method})`} value={inr(c.paidNow)} tone="text-emerald-600" />
                <Row label="Balance due" value={inr(c.balance)} tone={c.balance > 0 ? "text-amber-600" : "text-slate-800"} strong />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm ring-1 ring-slate-200">
                <span className="text-slate-500">Payment</span>
                <span className={`font-bold ${plan === "full" ? "text-emerald-600" : "text-amber-600"}`}>{paymentStatusLabel}</span>
              </div>

              {showErrors && (
                <ul role="alert" className="mt-4 space-y-1 rounded-xl bg-rose-50 p-3.5 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
                  {errors.map((e) => (
                    <li key={e} className="flex gap-2"><Icon d={ICONS.alert} className="mt-0.5 h-4 w-4" /> {e}</li>
                  ))}
                </ul>
              )}

              <button
                onClick={submit}
                disabled={saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B4BAA] py-3 text-[15px] font-semibold text-white shadow-md shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving && <AiOutlineLoading3Quarters className="animate-spin" />}
                {saving ? "Creating bill..." : "Generate bill"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {toast && (
        <div role={toast.type === "error" ? "alert" : "status"} className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${toast.type === "error" ? "bg-rose-600" : "bg-slate-900"}`}>
          <Icon d={toast.type === "error" ? ICONS.alert : ICONS.check} className="h-5 w-5" />
          {toast.text}
        </div>
      )}
    </div>
  );
};

export default Billing;
