



// import { Fragment, useState, useEffect, useCallback } from "react";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import RentReportPdf from "../Component/pdf/RentReportPdf.jsx";
// import {
//   MdEdit,
//   MdClose,
//   MdCheck,
//   MdFileDownload,
//   MdWarningAmber,
//   MdCheckCircle,
//   MdErrorOutline,
// } from "react-icons/md";
// import { exportToExcel } from "../utils/exportToExcel";
// import { fetchReport, MONTHS, YEARS, formatINR } from "../utils/reportFetch";

// /* ------------------------------------------------------------------ */
// /* Design tokens                                                       */
// /* Palette: deep teal ink (hero), slate neutrals, and three status     */
// /* colours that mean the same thing everywhere on the page.            */
// /* ------------------------------------------------------------------ */
// const FIELD =
//   "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10";
// const SELECT = `${FIELD} sm:w-auto sm:min-w-[9.5rem]`;
// const BTN_PRIMARY =
//   "inline-flex w-full items-center justify-center rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30";
// const BTN_OUTLINE =
//   "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20";

// const STATUS = {
//   Paid: {
//     dot: "bg-emerald-500",
//     pill: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
//     bar: "bg-emerald-400",
//     text: "text-emerald-700",
//   },
//   Unpaid: {
//     dot: "bg-rose-500",
//     pill: "bg-rose-50 text-rose-800 ring-rose-600/15",
//     bar: "bg-rose-400",
//     text: "text-rose-700",
//   },
//   Pending: {
//     dot: "bg-amber-500",
//     pill: "bg-amber-50 text-amber-800 ring-amber-600/20",
//     bar: "bg-amber-300",
//     text: "text-amber-700",
//   },
// };

// const STATUS_KEYS = ["Paid", "Unpaid", "Pending"];

// const PAYMENT_MODES = [
//   "Cash",
//   "UPI",
//   "Bank transfer",
//   "Cheque",
//   "Card",
//   "Other",
// ];

// // Today as YYYY-MM-DD in the local time zone (for date inputs).
// const todayStr = () =>
//   new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
//     .toISOString()
//     .slice(0, 10);

// const dateInputValue = (v) => (v ? String(v).slice(0, 10) : "");

// const formatDate = (v) =>
//   v && !isNaN(new Date(v).getTime())
//     ? new Date(v).toLocaleDateString("en-IN")
//     : "-";

// // Whole days between the due date and the payment date (0 if on time).
// const daysLate = (item) => {
//   if (!item.paymentDate || !item.dueDate) return 0;
//   const diff = Math.round(
//     (new Date(dateInputValue(item.paymentDate)) -
//       new Date(dateInputValue(item.dueDate))) /
//       86400000,
//   );
//   return diff > 0 ? diff : 0;
// };

// const formatMonth = (value) => {
//   // The form saves "YYYY-MM"; show it as "Mar 2026". Anything else is shown as-is.
//   if (/^\d{4}-\d{2}$/.test(value || "")) {
//     const [y, m] = value.split("-");
//     return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-IN", {
//       month: "short",
//       year: "numeric",
//     });
//   }
//   return value || "-";
// };

// /* ------------------------------------------------------------------ */
// /* Small presentational pieces                                         */
// /* ------------------------------------------------------------------ */
// const Panel = ({ title, description, children, className = "" }) => (
//   <section
//     className={`rounded-xl border border-slate-200/80 bg-white shadow-sm ${className}`}
//   >
//     {title && (
//       <header className="border-b border-slate-100 px-6 py-4">
//         <h2 className="text-base font-semibold tracking-tight text-slate-900">
//           {title}
//         </h2>
//         {description && (
//           <p className="mt-0.5 text-sm text-slate-500">{description}</p>
//         )}
//       </header>
//     )}
//     {children}
//   </section>
// );

// const StatusPill = ({ status }) => {
//   const s = STATUS[status];
//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
//         s ? s.pill : "bg-slate-50 text-slate-700 ring-slate-500/20"
//       }`}
//     >
//       <span
//         className={`h-1.5 w-1.5 rounded-full ${s ? s.dot : "bg-slate-400"}`}
//       />
//       {status}
//     </span>
//   );
// };

// const Label = ({ htmlFor, children }) => (
//   <label
//     htmlFor={htmlFor}
//     className="mb-1.5 block text-sm font-medium text-slate-700"
//   >
//     {children}
//   </label>
// );

// const SkeletonRows = ({ rows = 4, cols = 6 }) =>
//   Array.from({ length: rows }).map((_, r) => (
//     <tr key={r}>
//       {Array.from({ length: cols }).map((__, c) => (
//         <td key={c} className="px-6 py-4">
//           <div className="h-3.5 w-full max-w-[7rem] animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
//         </td>
//       ))}
//     </tr>
//   ));

// const TableMessage = ({ colSpan, children, tone = "text-slate-500" }) => (
//   <tr>
//     <td colSpan={colSpan} className={`px-6 py-14 text-center text-sm ${tone}`}>
//       {children}
//     </td>
//   </tr>
// );

// /* ------------------------------------------------------------------ */
// /* Page                                                                */
// /* ------------------------------------------------------------------ */
// const Rent = () => {
//   const [propertyName, setPropertyName] = useState("");
//   const [month, setMonth] = useState("");
//   const [amount, setAmount] = useState(0);
//   const [dueDate, setDueDate] = useState("");
//   const [status, setStatus] = useState("Unpaid");
//   const [notes, setNotes] = useState("");
//   const [paymentMode, setPaymentMode] = useState("");
//   const [paymentDate, setPaymentDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("");

//   const [rentData, setRentData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [editId, setEditId] = useState(null);
//   const [updateStatus, setUpdateStatus] = useState(null);
//   const [updateMode, setUpdateMode] = useState("");
//   const [updateDate, setUpdateDate] = useState("");

//   const [toast, setToast] = useState(null); // { type: "success" | "error", text }

//   useEffect(() => {
//     if (!toast) return undefined;
//     const t = setTimeout(() => setToast(null), 4000);
//     return () => clearTimeout(t);
//   }, [toast]);

//   // Data is already filtered server-side by the selected period (dueDate based).
//   const fetchRentData = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const data = await fetchReport("rent", {
//         month: selectedMonth,
//         year: selectedYear,
//       });
//       setRentData(data);
//     } catch (err) {
//       console.error("Error fetching rent data:", err);
//       setError("Failed to load rent data. Please try again.");
//       setRentData([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedMonth, selectedYear]);

//   useEffect(() => {
//     fetchRentData();
//   }, [fetchRentData]);

//   // Only status filtering remains client-side; period filtering is server-side.
//   const displayedData = selectedStatus
//     ? rentData.filter((item) => item.status === selectedStatus)
//     : rentData;

//   const sumBy = (predicate) =>
//     displayedData
//       .filter(predicate)
//       .reduce((sum, item) => sum + Number(item.amount || 0), 0);

//   const totalAmount = sumBy(() => true);
//   const paidTotal = sumBy((i) => i.status === "Paid");
//   const unpaidTotal = sumBy((i) => i.status === "Unpaid");
//   const pendingTotal = sumBy((i) => i.status === "Pending");

//   const totalsByStatus = {
//     Paid: paidTotal,
//     Unpaid: unpaidTotal,
//     Pending: pendingTotal,
//   };
//   const countsByStatus = STATUS_KEYS.reduce((acc, key) => {
//     acc[key] = displayedData.filter((i) => i.status === key).length;
//     return acc;
//   }, {});
//   // Counts for the status filter come from the period data so they stay stable.
//   const periodCounts = STATUS_KEYS.reduce((acc, key) => {
//     acc[key] = rentData.filter((i) => i.status === key).length;
//     return acc;
//   }, {});

//   const share = (part) => (totalAmount > 0 ? (part / totalAmount) * 100 : 0);
//   const collectedPct = Math.round(share(paidTotal));

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const isOverdue = (item) =>
//     item.status !== "Paid" &&
//     !isNaN(new Date(item.dueDate).getTime()) &&
//     new Date(item.dueDate) < today;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Mode and date of payment only apply to rent that has been paid.
//     const formData = {
//       propertyName,
//       month,
//       amount,
//       dueDate,
//       status,
//       notes,
//       ...(status === "Paid" ? { paymentMode, paymentDate } : {}),
//     };
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/report/rent`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(formData),
//         },
//       );
//       const result = await response.json();
//       setToast({
//         type: response.ok ? "success" : "error",
//         text: result.message || (response.ok ? "Rent saved." : "Could not save rent."),
//       });
//       fetchRentData();
//       setPropertyName("");
//       setMonth("");
//       setAmount(0);
//       setDueDate("");
//       setStatus("Unpaid");
//       setNotes("");
//       setPaymentMode("");
//       setPaymentDate("");
//     } catch (error) {
//       console.error("Error:", error);
//       setToast({ type: "error", text: "Could not save rent. Please try again." });
//     }
//   };

//   const selectStatus = (key) => {
//     setStatus(key);
//     if (key === "Paid") {
//       setPaymentDate((d) => d || todayStr());
//     } else {
//       setPaymentMode("");
//       setPaymentDate("");
//     }
//   };

//   const startEdit = (item) => {
//     setEditId(item._id);
//     setUpdateStatus(item.status);
//     setUpdateMode(item.paymentMode || "");
//     setUpdateDate(dateInputValue(item.paymentDate));
//   };

//   const cancelEdit = () => {
//     setEditId(null);
//     setUpdateStatus(null);
//     setUpdateMode("");
//     setUpdateDate("");
//   };

//   const changeUpdateStatus = (value) => {
//     setUpdateStatus(value);
//     if (value === "Paid") setUpdateDate((d) => d || todayStr());
//   };

//   const handleUpdate = async (item) => {
//     const isPaid = updateStatus === "Paid";
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/report/rent/${item._id}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             status: updateStatus,
//             paymentMode: isPaid ? updateMode : "",
//             paymentDate: isPaid ? updateDate : null,
//           }),
//         },
//       );
//       const result = await response.json();

//       if (result.success) {
//         fetchRentData(); // refresh
//         setToast({ type: "success", text: "Rent record updated." });
//       } else {
//         setToast({
//           type: "error",
//           text: result.message || "Could not update the record.",
//         });
//       }
//     } catch (error) {
//       console.error("Update failed", error);
//       setToast({ type: "error", text: "Could not update the record." });
//     } finally {
//       cancelEdit();
//     }
//   };

//   // Derived from the already-filtered data using the real dueDate field
//   // (not the free-text `month` string).
//   const monthWiseSummary = displayedData.reduce((acc, item) => {
//     const date = new Date(item.dueDate);
//     const monthYear = isNaN(date.getTime())
//       ? "Unknown"
//       : date.toLocaleString("default", { month: "short", year: "numeric" });

//     if (!acc[monthYear]) {
//       acc[monthYear] = { Paid: 0, Unpaid: 0, Pending: 0, Total: 0 };
//     }

//     const value = Number(item.amount || 0);
//     if (acc[monthYear][item.status] !== undefined) {
//       acc[monthYear][item.status] += value;
//     }
//     acc[monthYear].Total += value;

//     return acc;
//   }, {});

//   const downloadRentExcel = () => {
//     const rows = displayedData.map((item) => ({
//       Property: item.propertyName,
//       Month: item.month,
//       "Due Date": new Date(item.dueDate).toLocaleDateString("en-IN"),
//       Status: item.status,
//       "Payment Mode": item.paymentMode || "-",
//       "Payment Date": item.paymentDate
//         ? new Date(item.paymentDate).toLocaleDateString("en-IN")
//         : "-",
//       Amount: Number(item.amount || 0),
//       Notes: item.notes || "-",
//     }));

//     exportToExcel({
//       data: rows,
//       fileName: `Rent_Report_${selectedMonth || "All"}_${selectedYear || "All_Years"}`,
//       sheetName: "Rent",
//     });
//   };

//   const rentPdfDocument = (
//     <RentReportPdf
//       rents={displayedData}
//       selectedMonth={selectedMonth}
//       selectedYear={selectedYear}
//       selectedStatus={selectedStatus}
//       totals={{
//         total: totalAmount,
//         paid: paidTotal,
//         unpaid: unpaidTotal,
//         pending: pendingTotal,
//       }}
//     />
//   );

//   const pdfFileName = `Rent_Report_${selectedMonth || "All"}_${
//     selectedYear || "Years"
//   }.pdf`;

//   // Plain-language label of the active period for the header.
//   const monthName = selectedMonth
//     ? MONTHS.find((m) => String(m.value) === String(selectedMonth))?.label
//     : "";
//   const periodLabel = selectedMonth
//     ? selectedYear
//       ? `${monthName} ${selectedYear}`
//       : `${monthName}, all years`
//     : selectedYear
//       ? `Year ${selectedYear}`
//       : "All time";

//   const monthRows = Object.entries(monthWiseSummary);

//   return (
//     <div className="space-y-6">
//       {/* ================= TOAST ================= */}
//       {toast && (
//         <div
//           role="status"
//           aria-live="polite"
//           className={`fixed right-6 top-6 z-50 flex max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg ${
//             toast.type === "success"
//               ? "border-emerald-200 bg-emerald-50 text-emerald-900"
//               : "border-rose-200 bg-rose-50 text-rose-900"
//           }`}
//         >
//           {toast.type === "success" ? (
//             <MdCheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-600" />
//           ) : (
//             <MdErrorOutline size={18} className="mt-0.5 shrink-0 text-rose-600" />
//           )}
//           <p className="flex-1">{toast.text}</p>
//           <button
//             aria-label="Dismiss message"
//             onClick={() => setToast(null)}
//             className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
//           >
//             <MdClose size={16} />
//           </button>
//         </div>
//       )}

//       {/* ================= HEADER ================= */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
//             Rent
//           </h1>
//           <p className="mt-1 text-sm text-slate-500">
//             {periodLabel}
//             <span className="mx-2 text-slate-300">|</span>
//             {displayedData.length}{" "}
//             {displayedData.length === 1 ? "record" : "records"}
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <button onClick={downloadRentExcel} className={BTN_OUTLINE}>
//             <MdFileDownload size={18} className="text-slate-500" />
//             Excel
//           </button>
//           <PDFDownloadLink
//             document={rentPdfDocument}
//             fileName={pdfFileName}
//             className={BTN_OUTLINE}
//           >
//             {({ loading: pdfLoading }) => (
//               <>
//                 <MdFileDownload size={18} className="text-slate-500" />
//                 {pdfLoading ? "Preparing PDF..." : "PDF"}
//               </>
//             )}
//           </PDFDownloadLink>
//         </div>
//       </div>

//       {/* ================= FILTER BAR ================= */}
//       <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
//         <div
//           role="group"
//           aria-label="Filter by status"
//           className="flex w-full overflow-x-auto rounded-lg bg-slate-100 p-1 lg:w-auto"
//         >
//           {[
//             { value: "", label: "All", count: rentData.length },
//             ...STATUS_KEYS.map((k) => ({
//               value: k,
//               label: k,
//               count: periodCounts[k],
//             })),
//           ].map((opt) => {
//             const active = selectedStatus === opt.value;
//             return (
//               <button
//                 key={opt.label}
//                 type="button"
//                 aria-pressed={active}
//                 onClick={() => setSelectedStatus(opt.value)}
//                 className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 lg:flex-none ${
//                   active
//                     ? "bg-white text-slate-900 shadow-sm"
//                     : "text-slate-500 hover:text-slate-800"
//                 }`}
//               >
//                 {opt.label}
//                 <span
//                   className={`rounded-full px-1.5 text-xs tabular-nums ${
//                     active ? "bg-slate-100 text-slate-600" : "text-slate-400"
//                   }`}
//                 >
//                   {opt.count}
//                 </span>
//               </button>
//             );
//           })}
//         </div>

//         <div className="flex flex-col gap-2 sm:flex-row">
//           <select
//             aria-label="Filter by month"
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(e.target.value)}
//             className={SELECT}
//           >
//             <option value="">All months</option>
//             {MONTHS.map((m) => (
//               <option key={m.value} value={m.value}>
//                 {m.label}
//               </option>
//             ))}
//           </select>

//           <select
//             aria-label="Filter by year"
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(e.target.value)}
//             className={SELECT}
//           >
//             <option value="">All years</option>
//             {YEARS.map((year) => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* ================= OVERVIEW (the one bold element) ================= */}
//       <section
//         aria-label="Rent overview"
//         className="rounded-xl bg-gradient-to-br from-[#17458f] via-[#102f6b] to-[#0a1f4d] p-6 text-white shadow-sm ring-1 ring-blue-950/40 sm:p-8"
//       >
//         <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
//           <div className="lg:col-span-2">
//             <p className="text-sm text-cyan-200/90">Total rent</p>
//             <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
//               ₹{formatINR(totalAmount)}
//             </p>
//             <p className="mt-3 text-sm text-blue-100/80">
//               <span className="font-semibold text-emerald-300">
//                 {collectedPct}% collected
//               </span>{" "}
//               (₹{formatINR(paidTotal)} of ₹{formatINR(totalAmount)})
//             </p>
//           </div>

//           <div className="lg:col-span-3">
//             <div
//               className="flex h-3 w-full overflow-hidden rounded-full bg-white/10"
//               role="img"
//               aria-label={`Paid ${collectedPct}%, unpaid ${Math.round(
//                 share(unpaidTotal),
//               )}%, pending ${Math.round(share(pendingTotal))}%`}
//             >
//               {STATUS_KEYS.map((key) => (
//                 <div
//                   key={key}
//                   className={`${STATUS[key].bar} h-full transition-all duration-500 motion-reduce:transition-none`}
//                   style={{ width: `${share(totalsByStatus[key])}%` }}
//                 />
//               ))}
//             </div>

//             <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
//               {STATUS_KEYS.map((key) => (
//                 <div key={key}>
//                   <dt className="flex items-center gap-2 text-sm text-blue-100/80">
//                     <span className={`h-2 w-2 rounded-full ${STATUS[key].dot}`} />
//                     {key}
//                   </dt>
//                   <dd className="mt-1 text-xl font-semibold tabular-nums">
//                     ₹{formatINR(totalsByStatus[key])}
//                   </dd>
//                   <dd className="mt-0.5 text-xs text-blue-200/70">
//                     {countsByStatus[key]}{" "}
//                     {countsByStatus[key] === 1 ? "record" : "records"},{" "}
//                     {Math.round(share(totalsByStatus[key]))}%
//                   </dd>
//                 </div>
//               ))}
//             </dl>
//           </div>
//         </div>
//       </section>

//       <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
//         {/* ================= LEFT: RECORDS + MONTH SUMMARY ================= */}
//         <div className="space-y-6 xl:col-span-2">
//           <Panel
//             title="Rent records"
//             description="Select the pencil to update a payment's status, mode and date."
//           >
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm">
//                 <thead className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-medium text-slate-500">
//                   <tr>
//                     <th className="px-6 py-3">Property</th>
//                     <th className="px-6 py-3">Month</th>
//                     <th className="px-6 py-3">Due date</th>
//                     <th className="px-6 py-3">Status</th>
//                     <th className="px-6 py-3">Payment</th>
//                     <th className="px-6 py-3 text-right">Amount</th>
//                     <th className="w-14 px-6 py-3">
//                       <span className="sr-only">Actions</span>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {loading ? (
//                     <SkeletonRows rows={4} cols={7} />
//                   ) : error ? (
//                     <TableMessage colSpan={7} tone="text-rose-600">
//                       {error}
//                     </TableMessage>
//                   ) : displayedData.length === 0 ? (
//                     <TableMessage colSpan={7}>
//                       No rent records for this period. Add one using the form.
//                     </TableMessage>
//                   ) : (
//                     displayedData.map((item) => {
//                       const isEditing = editId === item._id;
//                       const overdue = isOverdue(item);
//                       const late = daysLate(item);
//                       const hasPaymentInfo =
//                         item.status === "Paid" &&
//                         (item.paymentMode || item.paymentDate);

//                       const isPaidEdit = updateStatus === "Paid";
//                       const incomplete =
//                         isPaidEdit && (!updateMode || !updateDate);
//                       const unchanged =
//                         updateStatus === item.status &&
//                         (!isPaidEdit ||
//                           (updateMode === (item.paymentMode || "") &&
//                             updateDate === dateInputValue(item.paymentDate)));

//                       return (
//                         <Fragment key={item._id}>
//                           <tr
//                             className={`transition-colors hover:bg-slate-50/70 ${
//                               isEditing ? "bg-slate-50/70" : ""
//                             }`}
//                           >
//                             <td className="px-6 py-4">
//                               <div className="flex items-center gap-3">
//                                 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100">
//                                   {(item.propertyName || "?")
//                                     .trim()
//                                     .charAt(0)
//                                     .toUpperCase()}
//                                 </span>
//                                 <div className="min-w-0">
//                                   <p className="truncate font-medium text-slate-900">
//                                     {item.propertyName}
//                                   </p>
//                                   {item.notes && (
//                                     <p className="max-w-[14rem] truncate text-xs text-slate-500">
//                                       {item.notes}
//                                     </p>
//                                   )}
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="whitespace-nowrap px-6 py-4 text-slate-600">
//                               {formatMonth(item.month)}
//                             </td>
//                             <td className="whitespace-nowrap px-6 py-4">
//                               <span className="text-slate-600">
//                                 {formatDate(item.dueDate)}
//                               </span>
//                               {overdue && (
//                                 <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-rose-600">
//                                   <MdWarningAmber size={14} />
//                                   Overdue
//                                 </span>
//                               )}
//                             </td>
//                             <td className="whitespace-nowrap px-6 py-4">
//                               <StatusPill status={item.status} />
//                             </td>
//                             <td className="whitespace-nowrap px-6 py-4">
//                               {hasPaymentInfo ? (
//                                 <div>
//                                   <p className="font-medium text-slate-800">
//                                     {item.paymentMode || "-"}
//                                   </p>
//                                   <p className="text-xs text-slate-500">
//                                     {formatDate(item.paymentDate)}
//                                     {late > 0 && (
//                                       <span className="ml-1.5 font-medium text-amber-700">
//                                         {late} {late === 1 ? "day" : "days"} late
//                                       </span>
//                                     )}
//                                   </p>
//                                 </div>
//                               ) : item.status === "Paid" ? (
//                                 <span className="text-xs text-slate-400">
//                                   Not recorded
//                                 </span>
//                               ) : (
//                                 <span className="text-slate-300">-</span>
//                               )}
//                             </td>
//                             <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums text-slate-900">
//                               ₹{formatINR(item.amount)}
//                             </td>
//                             <td className="px-6 py-4 text-right">
//                               <button
//                                 aria-label={
//                                   isEditing ? "Cancel editing" : "Edit payment"
//                                 }
//                                 onClick={() =>
//                                   isEditing ? cancelEdit() : startEdit(item)
//                                 }
//                                 className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
//                               >
//                                 {isEditing ? (
//                                   <MdClose size={18} />
//                                 ) : (
//                                   <MdEdit size={18} />
//                                 )}
//                               </button>
//                             </td>
//                           </tr>

//                           {isEditing && (
//                             <tr className="bg-slate-50/70">
//                               <td colSpan={7} className="px-6 pb-5 pt-1">
//                                 <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 lg:flex-row lg:items-end">
//                                   <div className="lg:w-44">
//                                     <Label htmlFor={`edit-status-${item._id}`}>
//                                       Status
//                                     </Label>
//                                     <select
//                                       id={`edit-status-${item._id}`}
//                                       value={updateStatus || ""}
//                                       onChange={(e) =>
//                                         changeUpdateStatus(e.target.value)
//                                       }
//                                       className={FIELD}
//                                     >
//                                       {STATUS_KEYS.map((k) => (
//                                         <option key={k} value={k}>
//                                           {k}
//                                         </option>
//                                       ))}
//                                     </select>
//                                   </div>

//                                   {isPaidEdit && (
//                                     <>
//                                       <div className="lg:w-44">
//                                         <Label htmlFor={`edit-mode-${item._id}`}>
//                                           Mode of payment
//                                         </Label>
//                                         <select
//                                           id={`edit-mode-${item._id}`}
//                                           value={updateMode}
//                                           onChange={(e) =>
//                                             setUpdateMode(e.target.value)
//                                           }
//                                           className={FIELD}
//                                         >
//                                           <option value="">Select mode</option>
//                                           {PAYMENT_MODES.map((m) => (
//                                             <option key={m} value={m}>
//                                               {m}
//                                             </option>
//                                           ))}
//                                         </select>
//                                       </div>
//                                       <div className="lg:w-44">
//                                         <Label htmlFor={`edit-date-${item._id}`}>
//                                           Date of payment
//                                         </Label>
//                                         <input
//                                           id={`edit-date-${item._id}`}
//                                           type="date"
//                                           max={todayStr()}
//                                           value={updateDate}
//                                           onChange={(e) =>
//                                             setUpdateDate(e.target.value)
//                                           }
//                                           className={FIELD}
//                                         />
//                                       </div>
//                                     </>
//                                   )}

//                                   <div className="flex gap-2 lg:ml-auto">
//                                     <button
//                                       type="button"
//                                       onClick={cancelEdit}
//                                       className={BTN_OUTLINE}
//                                     >
//                                       Cancel
//                                     </button>
//                                     <button
//                                       type="button"
//                                       disabled={incomplete || unchanged}
//                                       onClick={() => handleUpdate(item)}
//                                       className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
//                                     >
//                                       <MdCheck size={16} />
//                                       Save
//                                     </button>
//                                   </div>
//                                 </div>
//                                 {isPaidEdit && incomplete && (
//                                   <p className="mt-2 text-xs text-slate-500">
//                                     Choose the mode and date of payment to mark
//                                     this rent as paid.
//                                   </p>
//                                 )}
//                               </td>
//                             </tr>
//                           )}
//                         </Fragment>
//                       );
//                     })
//                   )}
//                 </tbody>
//                 {!loading && !error && displayedData.length > 0 && (
//                   <tfoot className="border-t border-slate-200 bg-slate-50/70">
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="px-6 py-3.5 text-right font-medium text-slate-600"
//                       >
//                         Total
//                       </td>
//                       <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-slate-900">
//                         ₹{formatINR(totalAmount)}
//                       </td>
//                       <td />
//                     </tr>
//                   </tfoot>
//                 )}
//               </table>
//             </div>
//           </Panel>

//           <Panel
//             title="Month-wise summary"
//             description="Grouped by due date. The bar shows how much has been collected."
//           >
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm">
//                 <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-500">
//                   <tr>
//                     <th className="px-6 py-3 text-left">Month</th>
//                     <th className="px-6 py-3 text-right">Paid</th>
//                     <th className="px-6 py-3 text-right">Unpaid</th>
//                     <th className="px-6 py-3 text-right">Pending</th>
//                     <th className="px-6 py-3 text-right">Total</th>
//                     <th className="px-6 py-3 text-left">Collected</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {monthRows.length === 0 ? (
//                     <TableMessage colSpan={6}>No data available.</TableMessage>
//                   ) : (
//                     monthRows.map(([label, data]) => {
//                       const collected =
//                         data.Total > 0
//                           ? Math.round((data.Paid / data.Total) * 100)
//                           : 0;
//                       return (
//                         <tr
//                           key={label}
//                           className="transition-colors hover:bg-slate-50/70"
//                         >
//                           <td className="whitespace-nowrap px-6 py-3.5 font-medium text-slate-900">
//                             {label}
//                           </td>
//                           <td className="px-6 py-3.5 text-right tabular-nums text-emerald-700">
//                             ₹{formatINR(data.Paid)}
//                           </td>
//                           <td className="px-6 py-3.5 text-right tabular-nums text-rose-700">
//                             ₹{formatINR(data.Unpaid)}
//                           </td>
//                           <td className="px-6 py-3.5 text-right tabular-nums text-amber-700">
//                             ₹{formatINR(data.Pending)}
//                           </td>
//                           <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-slate-900">
//                             ₹{formatINR(data.Total)}
//                           </td>
//                           <td className="px-6 py-3.5">
//                             <div className="flex items-center gap-2">
//                               <div className="h-1.5 w-20 rounded-full bg-slate-100">
//                                 <div
//                                   className="h-1.5 rounded-full bg-emerald-500"
//                                   style={{ width: `${collected}%` }}
//                                 />
//                               </div>
//                               <span className="w-9 text-xs tabular-nums text-slate-500">
//                                 {collected}%
//                               </span>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </Panel>
//         </div>

//         {/* ================= RIGHT: FORM ================= */}
//         <div className="xl:col-span-1">
//           <Panel
//             title="Record rent payment"
//             description="Add a rent entry for a property."
//             className="xl:sticky xl:top-6"
//           >
//             <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
//               <div>
//                 <Label htmlFor="propertyName">Property name</Label>
//                 <input
//                   id="propertyName"
//                   type="text"
//                   placeholder="e.g. Main building"
//                   value={propertyName}
//                   onChange={(e) => setPropertyName(e.target.value)}
//                   required
//                   className={FIELD}
//                 />
//               </div>

//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
//                 <div>
//                   <Label htmlFor="rentMonth">Rent month</Label>
//                   <input
//                     id="rentMonth"
//                     type="month"
//                     value={month}
//                     onChange={(e) => setMonth(e.target.value)}
//                     required
//                     className={FIELD}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="dueDate">Due date</Label>
//                   <input
//                     id="dueDate"
//                     type="date"
//                     value={dueDate}
//                     onChange={(e) => setDueDate(e.target.value)}
//                     required
//                     className={FIELD}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="amount">Amount</Label>
//                 <div className="relative">
//                   <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-400">
//                     ₹
//                   </span>
//                   <input
//                     id="amount"
//                     type="number"
//                     placeholder="0"
//                     min={0}
//                     value={amount}
//                     onChange={(e) => setAmount(Number(e.target.value))}
//                     className={`${FIELD} pl-8 tabular-nums`}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <span className="mb-1.5 block text-sm font-medium text-slate-700">
//                   Payment status
//                 </span>
//                 <div
//                   role="group"
//                   aria-label="Payment status"
//                   className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1"
//                 >
//                   {STATUS_KEYS.map((key) => {
//                     const active = status === key;
//                     return (
//                       <button
//                         key={key}
//                         type="button"
//                         aria-pressed={active}
//                         onClick={() => selectStatus(key)}
//                         className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 ${
//                           active
//                             ? "bg-white text-slate-900 shadow-sm"
//                             : "text-slate-500 hover:text-slate-800"
//                         }`}
//                       >
//                         <span
//                           className={`h-1.5 w-1.5 rounded-full ${STATUS[key].dot}`}
//                         />
//                         {key}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               {status === "Paid" && (
//                 <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2 xl:grid-cols-1">
//                   <div>
//                     <Label htmlFor="paymentMode">Mode of payment</Label>
//                     <select
//                       id="paymentMode"
//                       value={paymentMode}
//                       onChange={(e) => setPaymentMode(e.target.value)}
//                       required
//                       className={FIELD}
//                     >
//                       <option value="">Select mode</option>
//                       {PAYMENT_MODES.map((m) => (
//                         <option key={m} value={m}>
//                           {m}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <Label htmlFor="paymentDate">Date of payment</Label>
//                     <input
//                       id="paymentDate"
//                       type="date"
//                       max={todayStr()}
//                       value={paymentDate}
//                       onChange={(e) => setPaymentDate(e.target.value)}
//                       required
//                       className={FIELD}
//                     />
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <Label htmlFor="notes">Notes (optional)</Label>
//                 <textarea
//                   id="notes"
//                   rows={3}
//                   placeholder="Receipt number, remarks..."
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   className={FIELD}
//                 />
//               </div>

//               <div className="border-t border-slate-100 pt-4">
//                 <button type="submit" className={BTN_PRIMARY}>
//                   Save rent
//                 </button>
//               </div>
//             </form>
//           </Panel>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Rent;







import { Fragment, useState, useEffect, useCallback } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RentReportPdf from "../Component/pdf/RentReportPdf.jsx";
import {
  MdEdit,
  MdClose,
  MdCheck,
  MdFileDownload,
  MdWarningAmber,
  MdCheckCircle,
  MdErrorOutline,
} from "react-icons/md";
import { exportToExcel } from "../utils/exportToExcel";
import { fetchReport, MONTHS, YEARS, formatINR } from "../utils/reportFetch";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* Palette: deep teal ink (hero), slate neutrals, and three status     */
/* colours that mean the same thing everywhere on the page.            */
/* ------------------------------------------------------------------ */
const FIELD =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10";
const SELECT = `${FIELD} sm:w-auto sm:min-w-[9.5rem]`;
const BTN_PRIMARY =
  "inline-flex w-full items-center justify-center rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30";
const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20";

const STATUS = {
  Paid: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
    bar: "bg-emerald-400",
    text: "text-emerald-700",
  },
  Unpaid: {
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-800 ring-rose-600/15",
    bar: "bg-rose-400",
    text: "text-rose-700",
  },
  Pending: {
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-800 ring-amber-600/20",
    bar: "bg-amber-300",
    text: "text-amber-700",
  },
};

const STATUS_KEYS = ["Paid", "Unpaid", "Pending"];

const PAYMENT_MODES = [
  "UPI",
  "Cash",
  "Cheque",
  "Bank transfer",
];

// Today as YYYY-MM-DD in the local time zone (for date inputs).
const todayStr = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

const dateInputValue = (v) => (v ? String(v).slice(0, 10) : "");

const formatDate = (v) =>
  v && !isNaN(new Date(v).getTime())
    ? new Date(v).toLocaleDateString("en-IN")
    : "-";

// Whole days between the due date and the payment date (0 if on time).
const daysLate = (item) => {
  if (!item.paymentDate || !item.dueDate) return 0;
  const diff = Math.round(
    (new Date(dateInputValue(item.paymentDate)) -
      new Date(dateInputValue(item.dueDate))) /
      86400000,
  );
  return diff > 0 ? diff : 0;
};

const formatMonth = (value) => {
  // The form saves "YYYY-MM"; show it as "Mar 2026". Anything else is shown as-is.
  if (/^\d{4}-\d{2}$/.test(value || "")) {
    const [y, m] = value.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }
  return value || "-";
};

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */
const Panel = ({ title, description, children, className = "" }) => (
  <section
    className={`rounded-xl border border-slate-200/80 bg-white shadow-sm ${className}`}
  >
    {title && (
      <header className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </header>
    )}
    {children}
  </section>
);

const StatusPill = ({ status }) => {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        s ? s.pill : "bg-slate-50 text-slate-700 ring-slate-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${s ? s.dot : "bg-slate-400"}`}
      />
      {status}
    </span>
  );
};

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="mb-1.5 block text-sm font-medium text-slate-700"
  >
    {children}
  </label>
);

const SkeletonRows = ({ rows = 4, cols = 6 }) =>
  Array.from({ length: rows }).map((_, r) => (
    <tr key={r}>
      {Array.from({ length: cols }).map((__, c) => (
        <td key={c} className="px-6 py-4">
          <div className="h-3.5 w-full max-w-[7rem] animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
        </td>
      ))}
    </tr>
  ));

const TableMessage = ({ colSpan, children, tone = "text-slate-500" }) => (
  <tr>
    <td colSpan={colSpan} className={`px-6 py-14 text-center text-sm ${tone}`}>
      {children}
    </td>
  </tr>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
const Rent = () => {
  const [propertyName, setPropertyName] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [rentData, setRentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [updateMode, setUpdateMode] = useState("");
  const [updateDate, setUpdateDate] = useState("");

  const [toast, setToast] = useState(null); // { type: "success" | "error", text }

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Data is already filtered server-side by the selected period (dueDate based).
  const fetchRentData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReport("rent", {
        month: selectedMonth,
        year: selectedYear,
      });
      setRentData(data);
    } catch (err) {
      console.error("Error fetching rent data:", err);
      setError("Failed to load rent data. Please try again.");
      setRentData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchRentData();
  }, [fetchRentData]);

  // Only status filtering remains client-side; period filtering is server-side.
  const displayedData = selectedStatus
    ? rentData.filter((item) => item.status === selectedStatus)
    : rentData;

  const sumBy = (predicate) =>
    displayedData
      .filter(predicate)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalAmount = sumBy(() => true);
  const paidTotal = sumBy((i) => i.status === "Paid");
  const unpaidTotal = sumBy((i) => i.status === "Unpaid");
  const pendingTotal = sumBy((i) => i.status === "Pending");

  const totalsByStatus = {
    Paid: paidTotal,
    Unpaid: unpaidTotal,
    Pending: pendingTotal,
  };
  const countsByStatus = STATUS_KEYS.reduce((acc, key) => {
    acc[key] = displayedData.filter((i) => i.status === key).length;
    return acc;
  }, {});
  // Counts for the status filter come from the period data so they stay stable.
  const periodCounts = STATUS_KEYS.reduce((acc, key) => {
    acc[key] = rentData.filter((i) => i.status === key).length;
    return acc;
  }, {});

  const share = (part) => (totalAmount > 0 ? (part / totalAmount) * 100 : 0);
  const collectedPct = Math.round(share(paidTotal));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = (item) =>
    item.status !== "Paid" &&
    !isNaN(new Date(item.dueDate).getTime()) &&
    new Date(item.dueDate) < today;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mode and date of payment only apply to rent that has been paid.
    const formData = {
      propertyName,
      month,
      amount,
      dueDate,
      status,
      notes,
      ...(status === "Paid" ? { paymentMode, paymentDate } : {}),
    };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/rent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const result = await response.json();
      setToast({
        type: response.ok ? "success" : "error",
        text: result.message || (response.ok ? "Rent saved." : "Could not save rent."),
      });
      fetchRentData();
      setPropertyName("");
      setMonth("");
      setAmount(0);
      setDueDate("");
      setStatus("Unpaid");
      setNotes("");
      setPaymentMode("");
      setPaymentDate("");
    } catch (error) {
      console.error("Error:", error);
      setToast({ type: "error", text: "Could not save rent. Please try again." });
    }
  };

  const selectStatus = (key) => {
    setStatus(key);
    if (key === "Paid") {
      setPaymentDate((d) => d || todayStr());
    } else {
      setPaymentMode("");
      setPaymentDate("");
    }
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setUpdateStatus(item.status);
    setUpdateMode(item.paymentMode || "");
    setUpdateDate(dateInputValue(item.paymentDate));
  };

  const cancelEdit = () => {
    setEditId(null);
    setUpdateStatus(null);
    setUpdateMode("");
    setUpdateDate("");
  };

  const changeUpdateStatus = (value) => {
    setUpdateStatus(value);
    if (value === "Paid") setUpdateDate((d) => d || todayStr());
  };

  const handleUpdate = async (item) => {
    const isPaid = updateStatus === "Paid";
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/rent/${item._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: updateStatus,
            paymentMode: isPaid ? updateMode : "",
            paymentDate: isPaid ? updateDate : null,
          }),
        },
      );
      const result = await response.json();

      if (result.success) {
        fetchRentData(); // refresh
        setToast({ type: "success", text: "Rent record updated." });
      } else {
        setToast({
          type: "error",
          text: result.message || "Could not update the record.",
        });
      }
    } catch (error) {
      console.error("Update failed", error);
      setToast({ type: "error", text: "Could not update the record." });
    } finally {
      cancelEdit();
    }
  };

  // Derived from the already-filtered data using the real dueDate field
  // (not the free-text `month` string).
  const monthWiseSummary = displayedData.reduce((acc, item) => {
    const date = new Date(item.dueDate);
    const monthYear = isNaN(date.getTime())
      ? "Unknown"
      : date.toLocaleString("default", { month: "short", year: "numeric" });

    if (!acc[monthYear]) {
      acc[monthYear] = { Paid: 0, Unpaid: 0, Pending: 0, Total: 0 };
    }

    const value = Number(item.amount || 0);
    if (acc[monthYear][item.status] !== undefined) {
      acc[monthYear][item.status] += value;
    }
    acc[monthYear].Total += value;

    return acc;
  }, {});

  const downloadRentExcel = () => {
    const rows = displayedData.map((item) => ({
      Property: item.propertyName,
      Month: item.month,
      "Due Date": new Date(item.dueDate).toLocaleDateString("en-IN"),
      Status: item.status,
      "Payment Mode": item.paymentMode || "-",
      "Payment Date": item.paymentDate
        ? new Date(item.paymentDate).toLocaleDateString("en-IN")
        : "-",
      Amount: Number(item.amount || 0),
      Notes: item.notes || "-",
    }));

    exportToExcel({
      data: rows,
      fileName: `Rent_Report_${selectedMonth || "All"}_${selectedYear || "All_Years"}`,
      sheetName: "Rent",
    });
  };

  const rentPdfDocument = (
    <RentReportPdf
      rents={displayedData}
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
      selectedStatus={selectedStatus}
      totals={{
        total: totalAmount,
        paid: paidTotal,
        unpaid: unpaidTotal,
        pending: pendingTotal,
      }}
    />
  );

  const pdfFileName = `Rent_Report_${selectedMonth || "All"}_${
    selectedYear || "Years"
  }.pdf`;

  // Plain-language label of the active period for the header.
  const monthName = selectedMonth
    ? MONTHS.find((m) => String(m.value) === String(selectedMonth))?.label
    : "";
  const periodLabel = selectedMonth
    ? selectedYear
      ? `${monthName} ${selectedYear}`
      : `${monthName}, all years`
    : selectedYear
      ? `Year ${selectedYear}`
      : "All time";

  const monthRows = Object.entries(monthWiseSummary);

  return (
    <div className="space-y-6">
      {/* ================= TOAST ================= */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-6 top-6 z-50 flex max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {toast.type === "success" ? (
            <MdCheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <MdErrorOutline size={18} className="mt-0.5 shrink-0 text-rose-600" />
          )}
          <p className="flex-1">{toast.text}</p>
          <button
            aria-label="Dismiss message"
            onClick={() => setToast(null)}
            className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
          >
            <MdClose size={16} />
          </button>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Rent
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {periodLabel}
            <span className="mx-2 text-slate-300">|</span>
            {displayedData.length}{" "}
            {displayedData.length === 1 ? "record" : "records"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={downloadRentExcel} className={BTN_OUTLINE}>
            <MdFileDownload size={18} className="text-slate-500" />
            Excel
          </button>
          <PDFDownloadLink
            document={rentPdfDocument}
            fileName={pdfFileName}
            className={BTN_OUTLINE}
          >
            {({ loading: pdfLoading }) => (
              <>
                <MdFileDownload size={18} className="text-slate-500" />
                {pdfLoading ? "Preparing PDF..." : "PDF"}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter by status"
          className="flex w-full overflow-x-auto rounded-lg bg-slate-100 p-1 lg:w-auto"
        >
          {[
            { value: "", label: "All", count: rentData.length },
            ...STATUS_KEYS.map((k) => ({
              value: k,
              label: k,
              count: periodCounts[k],
            })),
          ].map((opt) => {
            const active = selectedStatus === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedStatus(opt.value)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 lg:flex-none ${
                  active
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt.label}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    active ? "bg-slate-100 text-slate-600" : "text-slate-400"
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="Filter by month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={SELECT}
          >
            <option value="">All months</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={SELECT}
          >
            <option value="">All years</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= OVERVIEW (the one bold element) ================= */}
      <section
        aria-label="Rent overview"
        className="rounded-xl bg-gradient-to-br from-[#17458f] via-[#102f6b] to-[#0a1f4d] p-6 text-white shadow-sm ring-1 ring-blue-950/40 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <p className="text-sm text-cyan-200/90">Total rent</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              ₹{formatINR(totalAmount)}
            </p>
            <p className="mt-3 text-sm text-blue-100/80">
              <span className="font-semibold text-emerald-300">
                {collectedPct}% collected
              </span>{" "}
              (₹{formatINR(paidTotal)} of ₹{formatINR(totalAmount)})
            </p>
          </div>

          <div className="lg:col-span-3">
            <div
              className="flex h-3 w-full overflow-hidden rounded-full bg-white/10"
              role="img"
              aria-label={`Paid ${collectedPct}%, unpaid ${Math.round(
                share(unpaidTotal),
              )}%, pending ${Math.round(share(pendingTotal))}%`}
            >
              {STATUS_KEYS.map((key) => (
                <div
                  key={key}
                  className={`${STATUS[key].bar} h-full transition-all duration-500 motion-reduce:transition-none`}
                  style={{ width: `${share(totalsByStatus[key])}%` }}
                />
              ))}
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {STATUS_KEYS.map((key) => (
                <div key={key}>
                  <dt className="flex items-center gap-2 text-sm text-blue-100/80">
                    <span className={`h-2 w-2 rounded-full ${STATUS[key].dot}`} />
                    {key}
                  </dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums">
                    ₹{formatINR(totalsByStatus[key])}
                  </dd>
                  <dd className="mt-0.5 text-xs text-blue-200/70">
                    {countsByStatus[key]}{" "}
                    {countsByStatus[key] === 1 ? "record" : "records"},{" "}
                    {Math.round(share(totalsByStatus[key]))}%
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* ================= LEFT: RECORDS + MONTH SUMMARY ================= */}
        <div className="space-y-6 xl:col-span-2">
          <Panel
            title="Rent records"
            description="Select the pencil to update a payment's status, mode and date."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-medium text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Property</th>
                    <th className="px-6 py-3">Month</th>
                    <th className="px-6 py-3">Due date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="w-14 px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <SkeletonRows rows={4} cols={7} />
                  ) : error ? (
                    <TableMessage colSpan={7} tone="text-rose-600">
                      {error}
                    </TableMessage>
                  ) : displayedData.length === 0 ? (
                    <TableMessage colSpan={7}>
                      No rent records for this period. Add one using the form.
                    </TableMessage>
                  ) : (
                    displayedData.map((item) => {
                      const isEditing = editId === item._id;
                      const overdue = isOverdue(item);
                      const late = daysLate(item);
                      const hasPaymentInfo =
                        item.status === "Paid" &&
                        (item.paymentMode || item.paymentDate);

                      const isPaidEdit = updateStatus === "Paid";
                      const incomplete =
                        isPaidEdit && (!updateMode || !updateDate);
                      const unchanged =
                        updateStatus === item.status &&
                        (!isPaidEdit ||
                          (updateMode === (item.paymentMode || "") &&
                            updateDate === dateInputValue(item.paymentDate)));

                      return (
                        <Fragment key={item._id}>
                          <tr
                            className={`transition-colors hover:bg-slate-50/70 ${
                              isEditing ? "bg-slate-50/70" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100">
                                  {(item.propertyName || "?")
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-slate-900">
                                    {item.propertyName}
                                  </p>
                                  {item.notes && (
                                    <p className="max-w-[14rem] truncate text-xs text-slate-500">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                              {formatMonth(item.month)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-slate-600">
                                {formatDate(item.dueDate)}
                              </span>
                              {overdue && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                                  <MdWarningAmber size={14} />
                                  Overdue
                                </span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <StatusPill status={item.status} />
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {hasPaymentInfo ? (
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {item.paymentMode || "-"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formatDate(item.paymentDate)}
                                    {late > 0 && (
                                      <span className="ml-1.5 font-medium text-amber-700">
                                        {late} {late === 1 ? "day" : "days"} late
                                      </span>
                                    )}
                                  </p>
                                </div>
                              ) : item.status === "Paid" ? (
                                <span className="text-xs text-slate-400">
                                  Not recorded
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums text-slate-900">
                              ₹{formatINR(item.amount)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                aria-label={
                                  isEditing ? "Cancel editing" : "Edit payment"
                                }
                                onClick={() =>
                                  isEditing ? cancelEdit() : startEdit(item)
                                }
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
                              >
                                {isEditing ? (
                                  <MdClose size={18} />
                                ) : (
                                  <MdEdit size={18} />
                                )}
                              </button>
                            </td>
                          </tr>

                          {isEditing && (
                            <tr className="bg-slate-50/70">
                              <td colSpan={7} className="px-6 pb-5 pt-1">
                                <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 lg:flex-row lg:items-end">
                                  <div className="lg:w-44">
                                    <Label htmlFor={`edit-status-${item._id}`}>
                                      Status
                                    </Label>
                                    <select
                                      id={`edit-status-${item._id}`}
                                      value={updateStatus || ""}
                                      onChange={(e) =>
                                        changeUpdateStatus(e.target.value)
                                      }
                                      className={FIELD}
                                    >
                                      {STATUS_KEYS.map((k) => (
                                        <option key={k} value={k}>
                                          {k}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {isPaidEdit && (
                                    <>
                                      <div className="lg:w-44">
                                        <Label htmlFor={`edit-mode-${item._id}`}>
                                          Mode of payment
                                        </Label>
                                        <select
                                          id={`edit-mode-${item._id}`}
                                          value={updateMode}
                                          onChange={(e) =>
                                            setUpdateMode(e.target.value)
                                          }
                                          className={FIELD}
                                        >
                                          <option value="">Select mode</option>
                                          {PAYMENT_MODES.map((m) => (
                                            <option key={m} value={m}>
                                              {m}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="lg:w-44">
                                        <Label htmlFor={`edit-date-${item._id}`}>
                                          Date of payment
                                        </Label>
                                        <input
                                          id={`edit-date-${item._id}`}
                                          type="date"
                                          max={todayStr()}
                                          value={updateDate}
                                          onChange={(e) =>
                                            setUpdateDate(e.target.value)
                                          }
                                          className={FIELD}
                                        />
                                      </div>
                                    </>
                                  )}

                                  <div className="flex gap-2 lg:ml-auto">
                                    <button
                                      type="button"
                                      onClick={cancelEdit}
                                      className={BTN_OUTLINE}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={incomplete || unchanged}
                                      onClick={() => handleUpdate(item)}
                                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                                    >
                                      <MdCheck size={16} />
                                      Save
                                    </button>
                                  </div>
                                </div>
                                {isPaidEdit && incomplete && (
                                  <p className="mt-2 text-xs text-slate-500">
                                    Choose the mode and date of payment to mark
                                    this rent as paid.
                                  </p>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
                {!loading && !error && displayedData.length > 0 && (
                  <tfoot className="border-t border-slate-200 bg-slate-50/70">
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-3.5 text-right font-medium text-slate-600"
                      >
                        Total
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                        ₹{formatINR(totalAmount)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Panel>

          <Panel
            title="Month-wise summary"
            description="Grouped by due date. The bar shows how much has been collected."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Month</th>
                    <th className="px-6 py-3 text-right">Paid</th>
                    <th className="px-6 py-3 text-right">Unpaid</th>
                    <th className="px-6 py-3 text-right">Pending</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-left">Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthRows.length === 0 ? (
                    <TableMessage colSpan={6}>No data available.</TableMessage>
                  ) : (
                    monthRows.map(([label, data]) => {
                      const collected =
                        data.Total > 0
                          ? Math.round((data.Paid / data.Total) * 100)
                          : 0;
                      return (
                        <tr
                          key={label}
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <td className="whitespace-nowrap px-6 py-3.5 font-medium text-slate-900">
                            {label}
                          </td>
                          <td className="px-6 py-3.5 text-right tabular-nums text-emerald-700">
                            ₹{formatINR(data.Paid)}
                          </td>
                          <td className="px-6 py-3.5 text-right tabular-nums text-rose-700">
                            ₹{formatINR(data.Unpaid)}
                          </td>
                          <td className="px-6 py-3.5 text-right tabular-nums text-amber-700">
                            ₹{formatINR(data.Pending)}
                          </td>
                          <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                            ₹{formatINR(data.Total)}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 rounded-full bg-slate-100">
                                <div
                                  className="h-1.5 rounded-full bg-emerald-500"
                                  style={{ width: `${collected}%` }}
                                />
                              </div>
                              <span className="w-9 text-xs tabular-nums text-slate-500">
                                {collected}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* ================= RIGHT: FORM ================= */}
        <div className="xl:col-span-1">
          <Panel
            title="Record rent payment"
            description="Add a rent entry for a property."
            className="xl:sticky xl:top-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <Label htmlFor="propertyName">Property name</Label>
                <input
                  id="propertyName"
                  type="text"
                  placeholder="e.g. Main building"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  required
                  className={FIELD}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <Label htmlFor="rentMonth">Rent month</Label>
                  <input
                    id="rentMonth"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                    className={FIELD}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due date</Label>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className={FIELD}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-400">
                    ₹
                  </span>
                  <input
                    id="amount"
                    type="number"
                    placeholder="0"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={`${FIELD} pl-8 tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payment status
                </span>
                <div
                  role="group"
                  aria-label="Payment status"
                  className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1"
                >
                  {STATUS_KEYS.map((key) => {
                    const active = status === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectStatus(key)}
                        className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 ${
                          active
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUS[key].dot}`}
                        />
                        {key}
                      </button>
                    );
                  })}
                </div>
              </div>

              {status === "Paid" && (
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <Label htmlFor="paymentMode">Mode of payment</Label>
                    <select
                      id="paymentMode"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      required
                      className={FIELD}
                    >
                      <option value="">Select mode</option>
                      {PAYMENT_MODES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Date of payment</Label>
                    <input
                      id="paymentDate"
                      type="date"
                      max={todayStr()}
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                      className={FIELD}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Receipt number, remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={FIELD}
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <button type="submit" className={BTN_PRIMARY}>
                  Save rent
                </button>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Rent;
