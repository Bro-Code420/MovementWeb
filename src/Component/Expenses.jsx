

import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ExpenseReportPdf from "../Component/pdf/ExpenseReportPdf.jsx";
import { exportToExcel } from "../utils/exportToExcel";
import { fetchReport, MONTHS, YEARS, formatINR } from "../utils/reportFetch";

/*
  Expenses report (premium revamp).
  Same data and API as before: fetchReport("expenses", { month, year }),
  POST /api/report/expenses, Excel export and PDF export.
  The design lives in this file, so it no longer uses ./reports/ReportUI.

  EDIT / DELETE
  The two endpoints below are assumptions. Change them to match your backend:
    PUT    {VITE_BACKEND_URL}/api/report/expenses/:id   (body: same shape as POST)
    DELETE {VITE_BACKEND_URL}/api/report/expenses/:id
  Both are expected to answer with { success: true|false, message?, expense? }.
  The backend must also check that the caller is allowed to edit or delete
  expenses. Hiding buttons in the UI is not security.
*/

const PAGE_SIZE = 10;
const DEFAULT_CATEGORIES = ["Utilities", "Supplies", "Maintenance", "Marketing", "Equipment", "Travel", "Other"];
const BAR_COLORS = ["bg-[#0B4BAA]", "bg-[#00C2CB]", "bg-amber-400", "bg-emerald-500", "bg-rose-400", "bg-slate-400"];

const UPDATE_EXPENSE_PATH = (id) => `/api/report/expenses/${id}`;
const DELETE_EXPENSE_PATH = (id) => `/api/report/expenses/${id}`;

const expenseApi = async (path, method, body) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      token: localStorage.getItem("token"),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await res.json();
  return { ok: res.ok, result };
};

const rupee = (n) => `₹${formatINR(n)}`;
const compact = (n) => {
  const v = Math.abs(n);
  if (v >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
};
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const newItem = () => ({ id: Date.now() + Math.random(), description: "", amount: "" });

const Icon = ({ d, className = "h-5 w-5" }) => (
  <svg className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICONS = {
  plus: "M12 5v14M5 12h14",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  search: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
  close: "M6 18L18 6M6 6l12 12",
  chevron: "M9 18l6-6-6-6",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  alert: "M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  check: "M20 6L9 17l-5-5",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  wallet: "M3 7a2 2 0 012-2h13a1 1 0 011 1v2M3 7v11a2 2 0 002 2h14a1 1 0 001-1v-3M3 7h16a2 2 0 012 2v3h-4a2 2 0 100 4h4",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  avg: "M3 3v18h18M7 14l4-4 3 3 5-6",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-800 placeholder-slate-400 outline-none transition hover:border-slate-400 focus:border-[#0B4BAA] focus:ring-4 focus:ring-[#00C2CB]/20";
const selectClass =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-[#0B4BAA] focus:ring-4 focus:ring-[#00C2CB]/20";

/* ------------------------------ building blocks ------------------------------ */

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${className}`}>{children}</div>
);

const CardTitle = ({ title, sub }) => (
  <div className="mb-4">
    <h3 className="text-base font-bold tracking-tight text-slate-800">{title}</h3>
    {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
  </div>
);

const TONES = {
  blue: "bg-[#0B4BAA]/10 text-[#0B4BAA]",
  rose: "bg-rose-50 text-rose-600",
  cyan: "bg-[#00C2CB]/15 text-[#0A8F96]",
  amber: "bg-amber-50 text-amber-600",
};

const Kpi = ({ icon, label, value, hint, tone, valueClass = "text-slate-900" }) => (
  <Card>
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${TONES[tone]}`}>
        <Icon d={icon} />
      </span>
    </div>
    <p className={`mt-3 truncate text-2xl font-extrabold tracking-tight sm:text-[28px] ${valueClass}`}>{value}</p>
    <p className="mt-1 truncate text-[13px] text-slate-500">{hint}</p>
  </Card>
);

const TrendChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex h-56 items-end gap-2 sm:gap-3" role="img" aria-label={`Expenses per month: ${data.map((d) => `${d.label} ${compact(d.total)}`).join(", ")}`}>
      {data.map((d, i) => (
        <div key={d.key} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[11px] font-semibold text-slate-600">{compact(d.total)}</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-t-lg transition-all ${i === data.length - 1 ? "bg-gradient-to-t from-rose-500 to-rose-300" : "bg-rose-200 group-hover:bg-rose-300"}`}
              style={{ height: `${Math.max((d.total / max) * 100, 3)}%` }}
              title={`${d.label}: ${rupee(d.total)}`}
            />
          </div>
          <span className="text-xs font-medium text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------ page ------------------------------ */

const Expenses = () => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const [expensesData, setExpensesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState({});

  // add / edit expense form (slide-over panel)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding a new expense
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState("");
  const [billerName, setBillerName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [billerId, setBillerId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([newItem()]);
  const [saving, setSaving] = useState(false);
  const [attempted, setAttempted] = useState(false);

  // delete confirmation
  const [deleting, setDeleting] = useState(null); // the expense being deleted
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [pdfBusy, setPdfBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- data ---------- */
  const fetchExpensesData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReport("expenses", { month: selectedMonth, year: selectedYear });
      setExpensesData(data);
    } catch (err) {
      console.error("Error fetching expenses data:", err);
      setError("Failed to load expenses. Please try again.");
      setExpensesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear, query, sortBy]);

  const resetForm = () => {
    setDate(todayISO());
    setCategory("");
    setBillerName("");
    setGstNumber("");
    setBillerId("");
    setNotes("");
    setItems([newItem()]);
    setAttempted(false);
  };

  // Close the panel. If it was an edit, clear the form so "Add expense" starts empty.
  const closePanel = () => {
    if (saving) return;
    setShowForm(false);
    if (editingId) {
      setEditingId(null);
      resetForm();
    }
  };

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, saving, editingId]);

  useEffect(() => {
    if (!deleting) return;
    const onKey = (e) => e.key === "Escape" && !deleteBusy && setDeleting(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleting, deleteBusy]);

  /* ---------- derived ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return expensesData;
    return expensesData.filter((e) => {
      const text = `${e.category || ""} ${e.billerName || ""} ${e.gstNumber || ""} ${e.billerId || ""} ${e.notes || ""} ${(e.expenses || []).map((i) => i.description).join(" ")}`.toLowerCase();
      return text.includes(q);
    });
  }, [expensesData, query]);

  const stats = useMemo(() => {
    const count = filtered.length;
    const total = filtered.reduce((s, e) => s + (e.total || 0), 0);
    const catMap = {};
    const monthMap = {};
    let highest = 0;
    filtered.forEach((e) => {
      const t = e.total || 0;
      highest = Math.max(highest, t);
      const cat = (e.category || "Uncategorised").trim() || "Uncategorised";
      catMap[cat] = (catMap[cat] || 0) + t;
      const d = new Date(e.date);
      if (!isNaN(d)) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap[key] = monthMap[key] || { key, label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }), total: 0 };
        monthMap[key].total += t;
      }
    });
    const categories = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return {
      count,
      total,
      avg: count ? total / count : 0,
      highest,
      categories,
      top: categories[0],
      months: Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key)).slice(-12),
    };
  }, [filtered]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      if (sortBy === "highest") return (b.total || 0) - (a.total || 0);
      const d = new Date(b.date) - new Date(a.date);
      return sortBy === "oldest" ? -d : d;
    });
    return list;
  }, [filtered, sortBy]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const categoryOptions = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    expensesData.forEach((e) => e.category && set.add(e.category.trim()));
    return [...set];
  }, [expensesData]);

  const monthName = selectedMonth ? MONTHS.find((m) => String(m.value) === String(selectedMonth))?.label : null;
  const periodLabel = monthName && selectedYear ? `${monthName} ${selectedYear}` : selectedYear ? `Year ${selectedYear}` : monthName ? `${monthName} (all years)` : "All time";

  /* ---------- form ---------- */
  const formTotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const validItems = items.filter((i) => i.description.trim() && Number(i.amount) > 0);
  const formErrors = [];
  if (!date) formErrors.push("Choose the date.");
  if (!category.trim()) formErrors.push("Enter a category.");
  if (validItems.length === 0) formErrors.push("Add at least one item with a description and an amount.");

  const openAdd = () => {
    if (editingId) {
      setEditingId(null);
      resetForm();
    }
    setAttempted(false);
    setShowForm(true);
  };

  const openEdit = (expense) => {
    setEditingId(expense._id);
    setDate(expense.date ? String(expense.date).slice(0, 10) : todayISO());
    setCategory(expense.category || "");
    setBillerName(expense.billerName || "");
    setGstNumber(expense.gstNumber || "");
    setBillerId(expense.billerId || "");
    setNotes(expense.notes || "");
    const list = (expense.expenses || []).map((it) => ({
      id: it._id || Date.now() + Math.random(),
      description: it.description || "",
      amount: it.amount === undefined || it.amount === null ? "" : String(it.amount),
    }));
    setItems(list.length ? list : [newItem()]);
    setAttempted(false);
    setShowForm(true);
  };

  const updateItem = (id, key, val) => setItems((list) => list.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
  const removeItem = (id) => setItems((list) => (list.length > 1 ? list.filter((r) => r.id !== id) : list));

  const handleSubmit = async () => {
    setAttempted(true);
    if (formErrors.length) return;
    setSaving(true);

    const formData = {
      date,
      category: category.trim(),
      billerName: billerName.trim(),
      gstNumber: gstNumber.trim().toUpperCase(),
      billerId: billerId.trim(),
      notes: notes.trim(),
      expenses: validItems.map((i) => ({ description: i.description.trim(), amount: Number(i.amount) })),
      total: validItems.reduce((s, i) => s + Number(i.amount), 0),
    };

    try {
      if (editingId) {
        // ----- edit existing expense -----
        const { ok, result } = await expenseApi(UPDATE_EXPENSE_PATH(editingId), "PUT", formData);
        if (!ok || result?.success === false) {
          showToast(result?.message || "Failed to update the expense", "error");
        } else {
          setExpensesData((list) =>
            list.map((e) => (e._id === editingId ? { ...e, ...formData, ...(result?.expense || {}) } : e))
          );
          showToast(result?.message || "Expense updated");
          setShowForm(false);
          setEditingId(null);
          resetForm();
        }
      } else {
        // ----- add new expense -----
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (!response.ok || result?.success === false) {
          showToast(result?.message || "Failed to submit expenses", "error");
        } else {
          showToast(result?.message || "Expenses saved");
          setShowForm(false);
          resetForm();
          fetchExpensesData();
        }
      }
    } catch (err) {
      console.error("Error:", err);
      showToast(editingId ? "Failed to update the expense" : "Failed to submit expenses", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- delete ---------- */
  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const { ok, result } = await expenseApi(DELETE_EXPENSE_PATH(deleting._id), "DELETE");
      if (!ok || result?.success === false) {
        setDeleteError(result?.message || "Could not delete the expense.");
      } else {
        const id = deleting._id;
        setExpensesData((list) => list.filter((e) => e._id !== id));
        setOpen((o) => {
          const { [id]: _removed, ...rest } = o;
          return rest;
        });
        setDeleting(null);
        showToast(result?.message || "Expense deleted");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteError(err.message || "Could not delete the expense.");
    } finally {
      setDeleteBusy(false);
    }
  };

  /* ---------- exports ---------- */
  const downloadExpensesExcel = () => {
    const excelRows = filtered.flatMap((expense) =>
      (expense.expenses || []).map((item, index) => ({
        Date: index === 0 ? new Date(expense.date).toLocaleDateString("en-IN") : "",
        Category: index === 0 ? expense.category : "",
        "Biller Name": index === 0 ? expense.billerName || "-" : "",
        "GST Number": index === 0 ? expense.gstNumber || "-" : "",
        "Biller ID": index === 0 ? expense.billerId || "-" : "",
        Description: item.description,
        Amount: item.amount,
        Notes: index === 0 ? expense.notes || "-" : "",
        Total: index === 0 ? expense.total : "",
      }))
    );
    exportToExcel({
      data: excelRows,
      fileName: `Expense_Report_${selectedMonth || "All_Months"}_${selectedYear || "All_Years"}`,
      sheetName: "Expenses",
    });
  };

  // The PDF is built only when you click, so changing filters stays fast
  const downloadExpensesPdf = async () => {
    setPdfBusy(true);
    try {
      const blob = await pdf(
        <ExpenseReportPdf
          expenses={filtered}
          month={monthName || "All Months"}
          year={selectedYear || "All Years"}
          total={formatINR(stats.total)}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Expense_Report_${selectedMonth || "All_Months"}_${selectedYear || "All_Years"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
      showToast("Could not create the PDF. Please try again.", "error");
    } finally {
      setPdfBusy(false);
    }
  };

  const noData = !loading && !error && filtered.length === 0;
  const isEditing = !!editingId;

  return (
    <div className="space-y-6">
      <style>{`@keyframes expSlide{from{transform:translateX(28px);opacity:0}to{transform:none;opacity:1}}`}</style>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Expenses</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            Showing
            <span className="rounded-full bg-[#0B4BAA]/10 px-2.5 py-0.5 text-xs font-bold text-[#0B4BAA]">{periodLabel}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Month"
            value={selectedMonth || ""}
            onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">All Months</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            aria-label="Year"
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={downloadExpensesExcel}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-emerald-700"
          >
            <Icon d={ICONS.download} className="h-4 w-4" /> Excel
          </button>
          <button
            onClick={downloadExpensesPdf}
            disabled={!filtered.length || pdfBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-600 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pdfBusy ? <AiOutlineLoading3Quarters className="animate-spin" /> : <Icon d={ICONS.download} className="h-4 w-4" />}
            {pdfBusy ? "Preparing..." : "PDF"}
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B4BAA] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2"
          >
            <Icon d={ICONS.plus} className="h-4 w-4" /> Add expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading expenses">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-slate-200" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-72 rounded-2xl bg-slate-200 lg:col-span-2" />
            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
        </div>
      ) : error ? (
        <Card className="text-center">
          <p className="text-base font-bold text-slate-800">{error}</p>
          <button
            onClick={fetchExpensesData}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0B4BAA] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2"
          >
            <Icon d={ICONS.refresh} className="h-4 w-4" /> Try again
          </button>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={ICONS.wallet} tone="rose" label="Total expenses" value={rupee(stats.total)} hint="Money spent in this view" valueClass="text-rose-600" />
            <Kpi icon={ICONS.list} tone="blue" label="Entries" value={stats.count} hint={`Largest ${rupee(stats.highest)}`} />
            <Kpi icon={ICONS.avg} tone="cyan" label="Average entry" value={rupee(stats.avg)} hint="Total divided by entries" />
            <Kpi icon={ICONS.tag} tone="amber" label="Top category" value={stats.top ? stats.top.name : "-"} hint={stats.top ? `${rupee(stats.top.value)} · ${Math.round((stats.top.value / stats.total) * 100)}%` : "No data yet"} />
          </div>

          {noData ? (
            <Card className="py-14 text-center">
              <p className="text-lg font-semibold text-slate-700">No expenses found</p>
              <p className="mt-1 text-sm text-slate-400">Try another period or clear the search, or add a new expense.</p>
              <button onClick={openAdd} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B4BAA] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2">
                <Icon d={ICONS.plus} className="h-4 w-4" /> Add expense
              </button>
            </Card>
          ) : (
            <>
              {/* Trend + categories */}
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardTitle title="Spending by month" sub="Last 12 months in this view" />
                  {stats.months.length ? <TrendChart data={stats.months} /> : <p className="py-10 text-center text-sm text-slate-400">No dated entries</p>}
                </Card>
                <Card>
                  <CardTitle title="By category" sub="Share of total spending" />
                  <ul className="space-y-4">
                    {stats.categories.slice(0, 6).map((c, i) => {
                      const pct = stats.total ? (c.value / stats.total) * 100 : 0;
                      return (
                        <li key={c.name}>
                          <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                            <span className="truncate font-semibold text-slate-700">{c.name}</span>
                            <span className="shrink-0 text-slate-500"><b className="text-slate-800">{rupee(c.value)}</b> · {pct.toFixed(0)}%</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {stats.categories.length > 6 && <p className="mt-4 text-xs text-slate-400">+ {stats.categories.length - 6} more categories</p>}
                </Card>
              </div>

              {/* Table */}
              <Card className="!p-0">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">All expense entries</h3>
                    <p className="text-sm text-slate-500">Select a row to see its items, or use the edit and delete buttons.</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <div className="relative">
                      <Icon d={ICONS.search} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search category, notes or item"
                        aria-label="Search expenses"
                        className="w-64 rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#0B4BAA] focus:ring-4 focus:ring-[#00C2CB]/20"
                      />
                    </div>
                    <select aria-label="Sort expenses" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="highest">Highest amount</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <th className="w-10 px-4 py-3" />
                        <th className="px-3 py-3 font-semibold">Date</th>
                        <th className="px-3 py-3 font-semibold">Category</th>
                        <th className="px-3 py-3 font-semibold">Biller</th>
                        <th className="px-3 py-3 font-semibold">Notes</th>
                        <th className="px-3 py-3 text-right font-semibold">Items</th>
                        <th className="px-3 py-3 text-right font-semibold">Total</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((expense) => {
                        const isOpen = !!open[expense._id];
                        const list = expense.expenses || [];
                        const toggle = () => setOpen((o) => ({ ...o, [expense._id]: !o[expense._id] }));
                        return (
                          <ExpenseRows key={expense._id}>
                            <tr onClick={toggle} className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  aria-expanded={isOpen}
                                  aria-label={`${isOpen ? "Hide" : "Show"} items for ${expense.category}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggle();
                                  }}
                                  className="rounded p-1 text-slate-400 transition hover:text-[#0B4BAA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
                                >
                                  <Icon d={ICONS.chevron} className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                </button>
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-slate-600">{new Date(expense.date).toLocaleDateString("en-GB")}</td>
                              <td className="px-3 py-3">
                                <span className="inline-flex rounded-full bg-[#0B4BAA]/10 px-2.5 py-1 text-xs font-semibold text-[#0B4BAA]">{expense.category || "Uncategorised"}</span>
                              </td>
                              <td className="px-3 py-3 text-slate-600">
                                <div className="min-w-[140px]">
                                  <p className="font-medium text-slate-700">{expense.billerName || "-"}</p>
                                  <p className="text-xs text-slate-400">{expense.billerId || "-"}</p>
                                </div>
                              </td>
                              <td className="max-w-[260px] px-3 py-3 text-slate-600"><p className="truncate">{expense.notes || <span className="text-slate-300">-</span>}</p></td>
                              <td className="px-3 py-3 text-right text-slate-600">{list.length}</td>
                              <td className="px-3 py-3 text-right font-bold text-rose-600">{rupee(expense.total)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEdit(expense);
                                    }}
                                    aria-label={`Edit ${expense.category || "expense"} entry`}
                                    title="Edit expense"
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-[#0B4BAA]/10 hover:text-[#0B4BAA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
                                  >
                                    <Icon d={ICONS.edit} className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteError("");
                                      setDeleting(expense);
                                    }}
                                    aria-label={`Delete ${expense.category || "expense"} entry`}
                                    title="Delete expense"
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                                  >
                                    <Icon d={ICONS.trash} className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isOpen && (
                              <tr className="bg-slate-50/70">
                                <td />
                                <td colSpan={7} className="px-3 py-3">
                                  <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                                    <span>GST Number: <b className="text-slate-700">{expense.gstNumber || "-"}</b></span>
                                    <span>Biller ID: <b className="text-slate-700">{expense.billerId || "-"}</b></span>
                                  </div>
                                  <table className="w-full max-w-xl text-sm">
                                    <thead>
                                      <tr className="text-xs uppercase tracking-wider text-slate-400">
                                        <th className="py-1.5 text-left font-semibold">Description</th>
                                        <th className="py-1.5 text-right font-semibold">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {list.map((item, i) => (
                                        <tr key={item._id || i} className="border-t border-slate-200/70">
                                          <td className="py-1.5 text-slate-700">{item.description}</td>
                                          <td className="py-1.5 text-right font-semibold text-slate-800">{rupee(item.amount)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </ExpenseRows>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row">
                  <span>
                    Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(safePage - 1)}
                      disabled={safePage <= 1}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="px-1 font-medium text-slate-700">Page {safePage} of {pages}</span>
                    <button
                      onClick={() => setPage(safePage + 1)}
                      disabled={safePage >= pages}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* Add / edit expense panel */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-[65] bg-slate-900/40" onClick={closePanel} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? "Edit expense" : "Record expense"}
            style={{ animation: "expSlide .2s ease-out" }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-lg flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-br from-[#0B4BAA] to-[#082F6B] px-6 py-5 text-white">
              <div>
                <h2 className="text-lg font-bold">{isEditing ? "Edit expense" : "Record expense"}</h2>
                <p className="text-sm text-blue-100">
                  {isEditing ? "Change the details, then save." : "Add one or more items under a category."}
                </p>
              </div>
              <button onClick={closePanel} aria-label="Close panel" className="rounded-lg p-1.5 text-blue-100 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <Icon d={ICONS.close} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="exp-date" className="mb-1.5 block text-sm font-semibold text-slate-700">Date</label>
                  <input id="exp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} ${attempted && !date ? "!border-rose-400" : ""}`} />
                </div>
                <div>
                  <label htmlFor="exp-cat" className="mb-1.5 block text-sm font-semibold text-slate-700">Category</label>
                  <input
                    id="exp-cat"
                    list="exp-categories"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Utilities"
                    autoComplete="off"
                    className={`${inputClass} ${attempted && !category.trim() ? "!border-rose-400" : ""}`}
                  />
                  <datalist id="exp-categories">
                    {categoryOptions.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="exp-biller-name" className="mb-1.5 block text-sm font-semibold text-slate-700">Biller name</label>
                  <input id="exp-biller-name" type="text" value={billerName} onChange={(e) => setBillerName(e.target.value)} placeholder="Supplier / vendor name" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="exp-biller-id" className="mb-1.5 block text-sm font-semibold text-slate-700">Biller ID</label>
                  <input id="exp-biller-id" type="text" value={billerId} onChange={(e) => setBillerId(e.target.value)} placeholder="Vendor / biller ID" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="exp-gst-number" className="mb-1.5 block text-sm font-semibold text-slate-700">GST number</label>
                  <input id="exp-gst-number" type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} placeholder="e.g. 22AAAAA0000A1Z5" maxLength={15} className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="exp-notes" className="mb-1.5 flex justify-between text-sm font-semibold text-slate-700">
                  <span>Notes</span><span className="text-xs font-medium text-slate-400">Optional</span>
                </label>
                <textarea id="exp-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional info" className={inputClass} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Items</p>
                  <button type="button" onClick={() => setItems((l) => [...l, newItem()])} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0B4BAA] hover:bg-[#E6F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
                    <Icon d={ICONS.plus} className="h-4 w-4" /> Add item
                  </button>
                </div>
                <ul className="space-y-3">
                  {items.map((it, idx) => (
                    <li key={it.id} className="grid grid-cols-[1fr_130px_36px] items-center gap-2">
                      <input
                        aria-label={`Item ${idx + 1} description`}
                        value={it.description}
                        onChange={(e) => updateItem(it.id, "description", e.target.value)}
                        placeholder="Expense detail"
                        className={inputClass}
                      />
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₹</span>
                        <input
                          aria-label={`Item ${idx + 1} amount`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          value={it.amount}
                          onChange={(e) => updateItem(it.id, "amount", e.target.value)}
                          placeholder="0"
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove item ${idx + 1}`}
                        onClick={() => removeItem(it.id)}
                        disabled={items.length === 1}
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                      >
                        <Icon d={ICONS.trash} className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {attempted && formErrors.length > 0 && (
                <ul role="alert" className="space-y-1 rounded-xl bg-rose-50 p-3.5 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
                  {formErrors.map((e) => (
                    <li key={e} className="flex gap-2"><Icon d={ICONS.alert} className="mt-0.5 h-4 w-4" /> {e}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total</p>
                <p className="text-xl font-extrabold text-slate-900">{rupee(formTotal)}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={closePanel} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0B4BAA] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving && <AiOutlineLoading3Quarters className="animate-spin" />}
                  {saving ? "Saving..." : isEditing ? "Save changes" : "Save"}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleteBusy) setDeleting(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Delete expense"
            className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
          >
            <div className="px-6 py-5">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Delete this expense?</h2>
              <p className="mt-2 text-sm text-slate-600">
                The <b>{deleting.category || "Uncategorised"}</b> entry dated{" "}
                <b>{new Date(deleting.date).toLocaleDateString("en-GB")}</b> ({rupee(deleting.total)}, {(deleting.expenses || []).length}{" "}
                {(deleting.expenses || []).length === 1 ? "item" : "items"}) will be removed from the report and from the totals. This cannot be undone.
              </p>
              {deleteError && (
                <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{deleteError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                disabled={deleteBusy}
                autoFocus
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:opacity-50"
              >
                Keep expense
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteBusy && <AiOutlineLoading3Quarters className="animate-spin" />}
                {deleteBusy ? "Deleting..." : "Delete expense"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div role={toast.type === "error" ? "alert" : "status"} className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${toast.type === "error" ? "bg-rose-600" : "bg-slate-900"}`}>
          <Icon d={toast.type === "error" ? ICONS.alert : ICONS.check} className="h-5 w-5" />
          {toast.text}
        </div>
      )}
    </div>
  );
};

// Lets one entry render as two table rows without an extra wrapper element
const ExpenseRows = ({ children }) => <>{children}</>;

export default Expenses;
