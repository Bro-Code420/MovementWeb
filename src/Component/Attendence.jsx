import { useCallback, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import {
  FaWhatsapp,
  FaTimes,
  FaCopy,
  FaCheck,
  FaDownload,
  FaShareAlt,
  FaPaperPlane,
} from "react-icons/fa";

const API = import.meta.env.VITE_BACKEND_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  token: localStorage.getItem("webapptoken"),
});

const todayIso = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
  return ist.toISOString().split("T")[0];
};

const clockTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    })
    : null;

const worked = (inTime, outTime) => {
  if (!inTime || !outTime) return null;
  const minutes = Math.round((new Date(outTime) - new Date(inTime)) / 60000);
  if (minutes < 0) return null;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const prettyDate = (iso) =>
  new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

const prettyMonth = (iso) =>
  new Date(`${iso}-01T00:00:00+05:30`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

const STATUS_STYLES = {
  Present: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Absent: "bg-rose-50 text-rose-700 ring-rose-200",
  Leave: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function AttendancePage() {
  const [mode, setMode] = useState("day");
  const [date, setDate] = useState(todayIso());
  const [month, setMonth] = useState(todayIso().slice(0, 7));
  const [roster, setRoster] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [rowBusy, setRowBusy] = useState(null);
  // Authenticator setup dialog: { row, qrDataUrl, manualKey, error, busy }
  const [setup, setSetup] = useState(null);
  const [setupCode, setSetupCode] = useState("");

  // WhatsApp Share Dialog State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [targetPhone, setTargetPhone] = useState(
    () => localStorage.getItem("movement_rehab_whatsapp_phone") || "",
  );
  const [copiedSummary, setCopiedSummary] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const url =
      mode === "day"
        ? `${API}/api/attendance/day?date=${date}`
        : `${API}/api/attendance/month?month=${month}`;
    try {
      const res = await fetch(url, { headers: authHeaders() });
      const body = await res.json().catch(() => ({}));

      if (res.status === 403) {
        setError("Only the admin can view the staff attendance report.");
        setRoster([]);
        setMonthly([]);
        return;
      }
      if (!res.ok) {
        setError(body.message || "Could not load attendance.");
        setRoster([]);
        setMonthly([]);
        return;
      }
      if (mode === "day") setRoster(body.roster || []);
      else setMonthly(body.staff || []);
    } catch {
      setError("Could not reach the server.");
      setRoster([]);
      setMonthly([]);
    } finally {
      setLoading(false);
    }
  }, [mode, date, month]);

  useEffect(() => {
    load();
  }, [load]);

  const mark = async (row, status, force = false) => {
    setSavingId(row.employeeId);
    setError("");
    try {
      const res = await fetch(
        `${API}/api/attendance/markEmployee${force ? "?force=1" : ""}`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ employeeId: row.employeeId, date, status }),
        },
      );
      const body = await res.json().catch(() => ({}));

      if (res.status === 409 && body.code === "HAS_SELF_CHECKIN") {
        const ok = window.confirm(
          `${row.name} checked in at ${clockTime(row.inTime)}. Override that punch with "${status}"?`,
        );
        if (ok) await mark(row, status, true);
        return;
      }
      if (!res.ok) {
        setError(body.message || "Could not save.");
        return;
      }
      await load();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSavingId(null);
    }
  };

  // The owner sets an employee's authenticator up: the QR shows here and the
  // employee scans it with their own phone.
  const startSetup = async (row) => {
    if (
      row.authenticator &&
      !window.confirm(
        `${row.name} already has an authenticator. Setting it up again stops their current phone from working. Continue?`,
      )
    ) {
      return;
    }
    setError("");
    setSetupCode("");
    setSetup({ row, busy: true });
    try {
      const res = await fetch(`${API}/api/attendance/totp/enroll-for`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ employeeId: row.employeeId, reset: !!row.authenticator }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSetup(null);
        setError(body.message || "Could not start setup.");
        return;
      }
      setSetup({ row, qrDataUrl: body.qrDataUrl, manualKey: body.manualKey });
    } catch {
      setSetup(null);
      setError("Could not reach the server.");
    }
  };

  const confirmSetup = async () => {
    setSetup((s) => ({ ...s, busy: true, error: "" }));
    try {
      const res = await fetch(`${API}/api/attendance/totp/confirm-for`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ employeeId: setup.row.employeeId, code: setupCode }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSetup((s) => ({ ...s, busy: false, error: body.message || "Could not confirm." }));
        return;
      }
      setNotice(`${setup.row.name} can now check in with their Employee ID and code.`);
      setSetup(null);
      await load();
    } catch {
      setSetup((s) => ({ ...s, busy: false, error: "Could not reach the server." }));
    }
  };

  const rows = mode === "day" ? roster : monthly;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || (r.code || "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totals = useMemo(() => {
    if (mode === "day") {
      const count = (s) => roster.filter((r) => r.status === s).length;
      return {
        present: count("Present"),
        absent: count("Absent"),
        leave: count("Leave"),
        fourth: roster.filter((r) => !r.status).length,
      };
    }
    return monthly.reduce(
      (acc, s) => ({
        present: acc.present + s.present,
        absent: acc.absent + s.absent,
        leave: acc.leave + s.leave,
        fourth: acc.fourth + s.late,
      }),
      { present: 0, absent: 0, leave: 0, fourth: 0 },
    );
  }, [mode, roster, monthly]);

  /* ---------- export ---------- */

  const fileName =
    mode === "day" ? `Staff-Attendance-${date}.pdf` : `Staff-Attendance-${month}.pdf`;

  // The text that lands in the WhatsApp chat. The PDF carries the detail; this
  // is the at-a-glance summary that shows in the chat list itself.
  const message = useMemo(() => {
    const isDay = mode === "day";
    const head = isDay
      ? `🏥 *Movement Rehab - Staff Attendance*\n📅 ${prettyDate(date)}`
      : `🏥 *Movement Rehab - Staff Attendance Summary*\n📅 ${prettyMonth(month)}`;

    let text = `${head}\n\n📊 *Summary:*`;
    text += `\n• Present: ${totals.present}`;
    text += `\n• Absent: ${totals.absent}`;
    text += `\n• Leave: ${totals.leave}`;
    text += `\n• ${isDay ? "Not Marked" : "Late"}: ${totals.fourth}\n`;
    text += `\n👥 *Staff List:*`;

    if (isDay) {
      filtered.forEach((r) => {
        const inAt = clockTime(r.inTime);
        if (inAt) {
          const outAt = clockTime(r.outTime);
          const icon = r.late ? "⏳" : "✅";
          text += `\n${icon} *${r.name}*: ${inAt}${outAt ? ` - ${outAt}` : " (in clinic)"}${r.late ? " (Late)" : ""}`;
        } else {
          const icon =
            r.status === "Absent"
              ? "❌"
              : r.status === "Leave"
                ? "🟡"
                : "⚪";
          text += `\n${icon} *${r.name}*: ${r.status || "Not marked"}`;
        }
      });
    } else {
      filtered.forEach((s) => {
        text += `\n• *${s.name}*: ${s.present} Present, ${s.absent} Absent, ${s.leave} Leave${s.late ? `, ${s.late} Late` : ""}`;
      });
    }

    text += `\n\n_Movement Rehab Clinic Management_`;
    return text;
  }, [mode, date, month, filtered, totals]);

  const buildPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Movement Rehab - Staff Attendance", 14, 18);
    doc.setFontSize(10);
    doc.text(mode === "day" ? prettyDate(date) : prettyMonth(month), 14, 26);

    let y = 38;
    doc.setFontSize(9);

    if (mode === "day") {
      doc.text(
        `Present ${totals.present}   Absent ${totals.absent}   Leave ${totals.leave}   Not marked ${totals.fourth}`,
        14,
        32,
      );
      ["Name", "In", "Out", "Worked", "Status", "Source"].forEach((h, i) =>
        doc.text(h, [14, 80, 102, 124, 148, 178][i], y),
      );
      y += 4;
      doc.line(14, y, 196, y);
      y += 6;

      filtered.forEach((r) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(String(r.name).slice(0, 34), 14, y);
        doc.text(clockTime(r.inTime) || "-", 80, y);
        doc.text(clockTime(r.outTime) || "-", 102, y);
        doc.text(worked(r.inTime, r.outTime) || "-", 124, y);
        doc.text((r.late ? "Late " : "") + (r.status || "Not marked"), 148, y);
        doc.text(
          r.source === "self" ? "Self" : r.source === "admin" ? "Admin" : "-",
          178,
          y,
        );
        y += 7;
      });
    } else {
      doc.text(
        `Present ${totals.present}   Absent ${totals.absent}   Leave ${totals.leave}   Late ${totals.fourth}`,
        14,
        32,
      );
      ["Name", "Role", "Present", "Absent", "Leave", "Late"].forEach((h, i) =>
        doc.text(h, [14, 80, 120, 143, 164, 184][i], y),
      );
      y += 4;
      doc.line(14, y, 196, y);
      y += 6;

      filtered.forEach((s) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(String(s.name).slice(0, 30), 14, y);
        doc.text(String(s.role || "-").slice(0, 16), 80, y);
        doc.text(String(s.present), 120, y);
        doc.text(String(s.absent), 143, y);
        doc.text(String(s.leave), 164, y);
        doc.text(String(s.late), 184, y);
        y += 7;
      });
    }

    return doc;
  };

  // One person's month, day by day. Always a month report even from the Day
  // view - a single day is a row, not a document worth downloading.
  const buildStaffPdf = (person, monthKey) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Movement Rehab - Attendance", 14, 18);
    doc.setFontSize(11);
    doc.text(person.name, 14, 27);
    doc.setFontSize(9);
    doc.text(
      [person.code, person.role].filter(Boolean).join("  |  ") || "-",
      14,
      33,
    );
    doc.text(prettyMonth(monthKey), 14, 39);
    doc.text(
      `Present ${person.present}   Absent ${person.absent}   Leave ${person.leave}   Late ${person.late}`,
      14,
      45,
    );

    let y = 57;
    ["Date", "In", "Out", "Worked", "Status", "Source"].forEach((h, i) =>
      doc.text(h, [14, 60, 85, 110, 138, 172][i], y),
    );
    y += 4;
    doc.line(14, y, 196, y);
    y += 6;

    const days = Object.keys(person.days).sort();
    if (!days.length) {
      doc.text("No attendance recorded this month.", 14, y);
    }

    days.forEach((day) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const entry = person.days[day];
      doc.text(prettyDate(day), 14, y);
      doc.text(clockTime(entry.inTime) || "-", 60, y);
      doc.text(clockTime(entry.outTime) || "-", 85, y);
      doc.text(worked(entry.inTime, entry.outTime) || "-", 110, y);
      doc.text((entry.late ? "Late " : "") + (entry.status || "-"), 138, y);
      doc.text(entry.source === "self" ? "Self" : "Admin", 172, y);
      y += 7;
    });

    return doc;
  };

  const downloadStaffPdf = async (row) => {
    setRowBusy(row.employeeId);
    setError("");
    setNotice("");
    const monthKey = mode === "day" ? date.slice(0, 7) : month;
    try {
      const res = await fetch(`${API}/api/attendance/month?month=${monthKey}`, {
        headers: authHeaders(),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message || "Could not build that report.");
        return;
      }
      const person = (body.staff || []).find(
        (s) => String(s.employeeId) === String(row.employeeId),
      );
      if (!person) {
        setError(`No record found for ${row.name}.`);
        return;
      }
      buildStaffPdf(person, monthKey).save(
        `Attendance-${person.name.replace(/\s+/g, "_")}-${monthKey}.pdf`,
      );
    } catch {
      setError("Could not reach the server.");
    } finally {
      setRowBusy(null);
    }
  };

  const downloadPdf = () => buildPdf().save(fileName);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
      setNotice("Summary copied to clipboard.");
    } catch {
      setNotice("Could not copy the summary.");
    }
  };

  const handleSendWhatsApp = (customNumber = null) => {
    const phoneToUse = customNumber !== null ? customNumber : targetPhone;
    let cleanPhone = (phoneToUse || "").replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    if (targetPhone.trim()) {
      localStorage.setItem("movement_rehab_whatsapp_phone", targetPhone.trim());
    }

    // Auto copy text
    try {
      navigator.clipboard.writeText(message);
    } catch { }

    // Build URL
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    setNotice(
      cleanPhone
        ? `WhatsApp opened for +${cleanPhone}.`
        : "WhatsApp opened with attendance summary.",
    );
    setShowWhatsAppModal(false);
  };

  const handleNativeShare = async () => {
    setNotice("");
    try {
      const file = new File([buildPdf().output("blob")], fileName, {
        type: "application/pdf",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Staff attendance",
          text: message,
        });
        setShowWhatsAppModal(false);
        return;
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
    // Fallback if not supported
    handleSendWhatsApp();
  };

  /* ---------- render ---------- */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Staff attendance</h1>
            <p className="mt-1 text-sm text-slate-500">
              Check-ins appear here automatically. Mark only the staff who did not punch.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
            {[
              ["day", "Day"],
              ["month", "Month"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${mode === value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {mode === "day" ? (
            <input
              type="date"
              value={date}
              max={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          ) : (
            <input
              type="month"
              value={month}
              max={todayIso().slice(0, 7)}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          )}

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />

          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              disabled={!filtered.length}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-40"
            >
              {copiedSummary ? (
                <FaCheck className="text-emerald-600 text-xs" />
              ) : (
                <FaCopy className="text-xs" />
              )}
              <span>{copiedSummary ? "Copied" : "Copy summary"}</span>
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={!filtered.length}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-40"
            >
              <FaDownload className="text-xs" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              disabled={!filtered.length}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              <FaWhatsapp className="text-base" />
              <span>Send on WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Present", totals.present, "text-emerald-700"],
            ["Absent", totals.absent, "text-rose-700"],
            ["Leave", totals.leave, "text-amber-700"],
            [mode === "day" ? "Not marked" : "Late", totals.fourth, "text-slate-500"],
          ].map(([label, value, tone]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <p className={`text-2xl font-bold ${tone}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800 ring-1 ring-sky-200">
            {notice}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Staff</th>
                  {mode === "day" ? (
                    <>
                      <th className="px-4 py-3 font-semibold">In</th>
                      <th className="px-4 py-3 font-semibold">Out</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Authenticator</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 font-semibold">Present</th>
                      <th className="px-4 py-3 font-semibold">Absent</th>
                      <th className="px-4 py-3 font-semibold">Leave</th>
                      <th className="px-4 py-3 font-semibold">Late</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-right font-semibold">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && !filtered.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      {rows.length ? "No staff match that search." : "No staff found."}
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((row) => (
                    <tr key={row.employeeId} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-400">
                          {[row.code, row.role].filter(Boolean).join(" · ") || "—"}
                        </p>
                        {!row.code && (
                          <p className="text-xs text-amber-600">
                            No Employee ID - add one on the Staff page
                          </p>
                        )}
                      </td>

                      {mode === "day" ? (
                        <>
                          <td className="px-4 py-3 tabular-nums text-slate-700">
                            {clockTime(row.inTime) || (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-slate-700">
                            {clockTime(row.outTime) || (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {row.source === "self" ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
                                  Self check-in
                                </span>
                                {row.late && (
                                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                    Late
                                  </span>
                                )}
                                {worked(row.inTime, row.outTime) && (
                                  <span className="text-xs text-slate-500">
                                    {worked(row.inTime, row.outTime)} worked
                                  </span>
                                )}
                                {row.inTime && !row.outTime && (
                                  <span className="text-xs text-slate-400">still in</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <select
                                  value={row.status || ""}
                                  disabled={savingId === row.employeeId}
                                  onChange={(e) =>
                                    e.target.value && mark(row, e.target.value)
                                  }
                                  className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium ring-1 ring-inset focus:outline-none ${row.status
                                      ? STATUS_STYLES[row.status]
                                      : "border-slate-300 bg-white text-slate-500 ring-transparent"
                                    }`}
                                >
                                  <option value="">Not marked</option>
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Leave">Leave</option>
                                </select>
                                {savingId === row.employeeId && (
                                  <span className="text-xs text-slate-400">saving...</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${row.authenticator
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                    : "bg-slate-50 text-slate-500 ring-slate-200"
                                  }`}
                              >
                                {row.authenticator ? "Active" : "Not set up"}
                              </span>
                              <button
                                type="button"
                                onClick={() => startSetup(row)}
                                className="text-xs font-semibold text-sky-700 hover:underline"
                              >
                                {row.authenticator ? "Reset" : "Set up"}
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 tabular-nums font-semibold text-emerald-700">
                            {row.present}
                          </td>
                          <td className="px-4 py-3 tabular-nums font-semibold text-rose-700">
                            {row.absent}
                          </td>
                          <td className="px-4 py-3 tabular-nums font-semibold text-amber-700">
                            {row.leave}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-slate-500">
                            {row.late}
                          </td>
                        </>
                      )}

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => downloadStaffPdf(row)}
                          disabled={rowBusy === row.employeeId}
                          title={`Download ${row.name}'s month as PDF`}
                          aria-label={`Download ${row.name}'s attendance for the month`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                        >
                          {rowBusy === row.employeeId ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <svg
                              className="h-[18px] w-[18px]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M12 3v12" />
                              <path d="m7 11 5 5 5-5" />
                              <path d="M5 21h14" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          For one person&apos;s full month, open them from the Staff list - their page has
          its own attendance calendar, PDF and WhatsApp share.
        </p>

        {setup && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Set up authenticator for ${setup.row.name}`}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-bold text-slate-900">Set up {setup.row.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Ask them to scan this with Google or Microsoft Authenticator, then type the 6-digit
                code their app shows.
              </p>

              {setup.qrDataUrl ? (
                <>
                  <div className="mt-4 grid place-items-center rounded-xl border border-slate-200 p-3">
                    <img src={setup.qrDataUrl} alt="Authenticator setup QR code" className="h-44 w-44" />
                  </div>
                  <p className="mt-3 break-all rounded-lg bg-slate-100 px-3 py-2 text-center font-mono text-xs text-slate-600">
                    {setup.manualKey}
                  </p>
                  <input
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && setupCode.length === 6 && confirmSetup()}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6-digit code"
                    className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-center text-lg font-bold tracking-[0.4em] focus:border-sky-500 focus:outline-none"
                  />
                  {setup.error && <p className="mt-2 text-sm text-rose-600">{setup.error}</p>}
                  <button
                    type="button"
                    onClick={confirmSetup}
                    disabled={setup.busy || setupCode.length !== 6}
                    className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {setup.busy ? "Checking..." : "Confirm"}
                  </button>
                </>
              ) : (
                <p className="mt-6 text-center text-sm text-slate-400">Preparing the QR code...</p>
              )}

              <button
                type="button"
                onClick={() => setSetup(null)}
                className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ================= WHATSAPP SHARE MODAL ================= */}
        {showWhatsAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shadow-xs">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Share Attendance on WhatsApp
                    </h3>
                    <p className="text-xs text-slate-500">
                      {mode === "day" ? prettyDate(date) : prettyMonth(month)} • {filtered.length} Staff records
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Target Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Send to WhatsApp Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      placeholder="e.g. 9876543210 (Leave blank to pick chat in WhatsApp)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    If empty, WhatsApp will let you search and select any contact or group.
                  </p>
                </div>

                {/* Formatted Message Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Message Preview
                    </label>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
                    >
                      {copiedSummary ? (
                        <>
                          <FaCheck className="text-[10px]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <FaCopy className="text-[10px]" />
                          <span>Copy text</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 max-h-44 overflow-y-auto text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {message}
                  </div>
                </div>

                {/* Tip note */}
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3 text-xs text-emerald-900 leading-normal">
                  <p className="font-semibold mb-0.5">💬 WhatsApp Message:</p>
                  <p className="text-emerald-800">
                    Clicking below directly opens WhatsApp with the formatted attendance summary ready to send.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSendWhatsApp()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition active:scale-95"
                >
                  <FaWhatsapp className="text-sm" />
                  <span>Send to WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
