
// import ConvertToPatientForm from "./ConvertToPatientForm";
// import { Link } from "react-router-dom";
// import { useState, useEffect, useRef } from "react";
// import { AiOutlineLoading3Quarters } from "react-icons/ai";
// import { pdf } from "@react-pdf/renderer";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import EnquiryPdfDocument from "./pdf/EnquiryPdfDocument";

// /*
//   All Enquiry page (premium revamp).
//   Same API calls, same filters, same edit / convert / delete flows, same exports.
//   Changes in behaviour are listed in the message that came with this file.
// */

// const Icon = ({ d, className = "h-5 w-5" }) => (
//   <svg className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
//     <path d={d} />
//   </svg>
// );

// const ICONS = {
//   search: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
//   plus: "M12 5v14M5 12h14",
//   download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
//   edit: "M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z",
//   phone: "M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z",
//   close: "M6 18L18 6M6 6l12 12",
//   alert: "M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
//   check: "M20 6L9 17l-5-5",
//   trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
//   refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
// };

// const fmtDate = (d) =>
//   d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

// const TABS = [
//   { key: "all", label: "All" },
//   { key: "lead", label: "Leads" },
//   { key: "patient", label: "Patients" },
// ];

// const inputClass =
//   "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-[#0B4BAA] focus:ring-4 focus:ring-[#00C2CB]/20";

// /* ---------- small UI pieces ---------- */

// const StatusPill = ({ entry }) => {
//   if (entry.enquiryStatus === "lead") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
//         <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Lead
//       </span>
//     );
//   }
//   const active = entry?.patientId?.personalDetails?.patientStatus;
//   return (
//     <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
//       <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />
//       Patient · {active ? "Active" : "Inactive"}
//     </span>
//   );
// };

// const Stat = ({ label, value, tone }) => (
//   <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
//     <p className="text-xs font-semibold text-slate-500 sm:text-sm">{label}</p>
//     <p className={`mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl ${tone}`}>{value}</p>
//   </div>
// );

// const Modal = ({ onClose, label, children, z = "z-[70]" }) => {
//   useEffect(() => {
//     const onKey = (e) => e.key === "Escape" && onClose();
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onClose]);
//   return (
//     <div className={`fixed inset-0 ${z} overflow-y-auto bg-slate-900/60 backdrop-blur-sm`} onClick={onClose}>
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div role="dialog" aria-modal="true" aria-label={label} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// const AllEnquiry = () => {
//   const backendURL = import.meta.env.VITE_BACKEND_URL;

//   const [enquiries, setEnquiries] = useState([]);
//   const [activeStatus, setActiveStatus] = useState("all");
//   const [patientStatus, setPatientStatus] = useState("all");
//   const [showConvertToPatientForm, setShowConvertToPatientForm] = useState(false);
//   const [selectedEnquiry, setSelectedEnquiry] = useState(null);
//   const [searchInput, setSearchInput] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortBy, setSortBy] = useState("newest");
//   const [deletingEnquiryId, setDeletingEnquiryId] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editData, setEditData] = useState({
//     enquiryId: "",
//     patientId: "",
//     enquiryStatus: "",
//     patientStatus: "true",
//     remark: "",
//   });

//   const [savingEdit, setSavingEdit] = useState(false);
//   const [downloadingPdf, setDownloadingPdf] = useState(false);
//   const [downloadingExcel, setDownloadingExcel] = useState(false);

//   const [loadingEnquiries, setLoadingEnquiries] = useState(false);
//   const [loadError, setLoadError] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(9);

//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalEnquiries: 0,
//     limit: 9,
//     hasPrevPage: false,
//     hasNextPage: false,
//   });

//   const [counts, setCounts] = useState({ all: null, lead: null, patient: null });
//   const [confirm, setConfirm] = useState(null); // { kind: "delete" | "convert", data }
//   const [converting, setConverting] = useState(false);
//   const [toast, setToast] = useState(null); // { text, type }

//   const reqId = useRef(0);

//   const showToast = (text, type = "success") => {
//     setToast({ text, type });
//     setTimeout(() => setToast(null), 3200);
//   };

//   /* ---------- data loading ---------- */

//   const fetchAllEnquiries = async () => {
//     const id = ++reqId.current;
//     try {
//       setLoadingEnquiries(true);
//       setLoadError("");

//       const params = new URLSearchParams({
//         page: String(page),
//         limit: String(limit),
//         activeStatus,
//         patientStatus,
//         search: searchTerm.trim(),
//         sortBy,
//       });

//       const response = await fetch(`${backendURL}/api/enquiry/getEnquiry?${params.toString()}`);
//       const result = await response.json();
//       if (id !== reqId.current) return; // a newer request replaced this one

//       setEnquiries(result?.enquiries || []);
//       setPagination(
//         result?.pagination || {
//           currentPage: 1,
//           totalPages: 1,
//           totalEnquiries: 0,
//           limit,
//           hasPrevPage: false,
//           hasNextPage: false,
//         }
//       );
//     } catch (error) {
//       if (id !== reqId.current) return;
//       console.error("Error fetching enquiries:", error);
//       setLoadError("Could not load the enquiries. Check your connection and try again.");
//     } finally {
//       if (id === reqId.current) setLoadingEnquiries(false);
//     }
//   };

//   // Totals for the tabs and stat cards (one tiny request per tab)
//   const fetchCounts = async () => {
//     try {
//       const entries = await Promise.all(
//         TABS.map(async (t) => {
//           const params = new URLSearchParams({
//             page: "1",
//             limit: "1",
//             activeStatus: t.key,
//             patientStatus: "all",
//             search: "",
//             sortBy: "newest",
//           });
//           const res = await fetch(`${backendURL}/api/enquiry/getEnquiry?${params.toString()}`);
//           const json = await res.json();
//           return [t.key, json?.pagination?.totalEnquiries ?? null];
//         })
//       );
//       setCounts(Object.fromEntries(entries));
//     } catch (error) {
//       console.error("Error fetching counts:", error);
//     }
//   };

//   const refreshAll = () => {
//     fetchAllEnquiries();
//     fetchCounts();
//   };

//   // Wait for the user to stop typing before searching
//   useEffect(() => {
//     const t = setTimeout(() => {
//       setSearchTerm(searchInput);
//       setPage(1);
//     }, 350);
//     return () => clearTimeout(t);
//   }, [searchInput]);

//   useEffect(() => {
//     fetchAllEnquiries();
//   }, [page, limit, activeStatus, patientStatus, searchTerm, sortBy]);

//   useEffect(() => {
//     fetchCounts();
//   }, []);

//   useEffect(() => {
//     const employeeData = localStorage.getItem("loginEmployeeData");
//     if (!employeeData) {
//       setIsAdmin(false);
//       return;
//     }
//     try {
//       const employee = JSON.parse(employeeData);
//       const loggedInEmail = employee?.personalDetails?.email?.trim()?.toLowerCase();
//       const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim()?.toLowerCase();
//       setIsAdmin(loggedInEmail === adminEmail);
//     } catch (error) {
//       console.error("Failed to parse loginEmployeeData:", error);
//       setIsAdmin(false);
//     }
//   }, []);

//   /* ---------- filtering (same rules as before) ---------- */

//   const applyClientFilters = (list) => {
//     let filtered = [...list];
//     if (activeStatus === "all") {
//       filtered = filtered.filter((e) => {
//         const status = e?.patientId?.personalDetails?.patientStatus;
//         return !(e.enquiryStatus === "patient" && status === false);
//       });
//     } else if (activeStatus === "lead") {
//       filtered = filtered.filter((e) => e.enquiryStatus === "lead");
//     } else if (activeStatus === "patient") {
//       filtered = filtered.filter((e) => e.enquiryStatus === "patient");
//     }

//     if (activeStatus === "patient" && patientStatus !== "all") {
//       filtered = filtered.filter((e) => {
//         const status = e?.patientId?.personalDetails?.patientStatus;
//         if (patientStatus === "active") return status === true;
//         if (patientStatus === "inactive") return status === false;
//         return true;
//       });
//     }

//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter((item) => {
//         const nameMatch = item?.patientName?.toLowerCase().includes(term);
//         const phoneMatch = item?.contactNumber?.includes(term);
//         const patientIdMatch = item?.patientId?.personalDetails?.patientId?.toLowerCase().includes(term);
//         return nameMatch || phoneMatch || patientIdMatch;
//       });
//     }

//     filtered.sort((a, b) => {
//       const dateA = new Date(a.createdAt);
//       const dateB = new Date(b.createdAt);
//       return sortBy === "newest" ? dateB - dateA : dateA - dateB;
//     });

//     return filtered;
//   };

//   const filteredEnquiries = applyClientFilters(enquiries);

//   const changeTab = (key) => {
//     setActiveStatus(key);
//     if (key !== "patient") setPatientStatus("all");
//     setPage(1);
//   };

//   /* ---------- exports ---------- */

//   const normalizeEnquiryData = (data) =>
//     data.map((item, index) => ({
//       "S.No": index + 1,
//       "Enquiry ID": item?._id || "",
//       Type: item?.enquiryStatus || "",
//       "Patient Status":
//         item?.enquiryStatus === "patient"
//           ? item?.patientId?.personalDetails?.patientStatus
//             ? "Active"
//             : "Inactive"
//           : "-",
//       "Patient Code": item?.patientId?.personalDetails?.patientId || "-",
//       Name: item?.patientName || "",
//       Gender: item?.gender || "",
//       Age: item?.age ?? "",
//       Occupation: item?.occupation || "",
//       "Contact Number": item?.contactNumber || "",
//       Email: item?.email || "",
//       "Chief Complaint": item?.chiefComplaint || "",
//       Remark: item?.remark || "",
//       Response: item?.response || "",
//       Source: item?.source || "",
//       Address: item?.patientId?.personalDetails?.address || "-",
//       "Attendance Count": item?.patientId?.attendance?.length || 0,
//       "Billing Count": item?.patientId?.billing?.length || 0,
//       "Treatment Count": item?.patientId?.treatment?.length || 0,
//       "Created Date": item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
//       "Created Time": item?.createdAt ? new Date(item.createdAt).toLocaleTimeString() : "",
//       "Updated Date": item?.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "",
//     }));

//   const getSummaryStats = (data) => {
//     const total = data.length;
//     const leads = data.filter((item) => item.enquiryStatus === "lead").length;
//     const patients = data.filter((item) => item.enquiryStatus === "patient").length;
//     const activePatients = data.filter(
//       (item) => item.enquiryStatus === "patient" && item?.patientId?.personalDetails?.patientStatus === true
//     ).length;
//     const inactivePatients = data.filter(
//       (item) => item.enquiryStatus === "patient" && item?.patientId?.personalDetails?.patientStatus === false
//     ).length;
//     const conversionRate = total > 0 ? ((patients / total) * 100).toFixed(2) : 0;
//     return { total, leads, patients, activePatients, inactivePatients, conversionRate };
//   };

//   const getExportFileName = (type) => {
//     const date = new Date().toISOString().split("T")[0];
//     const statusPart = activeStatus || "all";
//     const patientFilterPart = activeStatus === "patient" ? `-${patientStatus}` : "";
//     const searchPart = searchTerm?.trim() ? `-${searchTerm.trim().replace(/\s+/g, "-")}` : "";
//     return `enquiry-${statusPart}${patientFilterPart}${searchPart}-${date}.${type}`;
//   };

//   // Exports cover every result of the current filters, not only the visible page
//   const fetchExportData = async () => {
//     const params = new URLSearchParams({
//       page: "1",
//       limit: String(Math.max(pagination.totalEnquiries || 0, limit, 1)),
//       activeStatus,
//       patientStatus,
//       search: searchTerm.trim(),
//       sortBy,
//     });
//     const response = await fetch(`${backendURL}/api/enquiry/getEnquiry?${params.toString()}`);
//     const result = await response.json();
//     return applyClientFilters(result?.enquiries || []);
//   };

//   const handleDownloadExcel = async () => {
//     try {
//       setDownloadingExcel(true);

//       const filteredData = await fetchExportData();
//       const normalizedData = normalizeEnquiryData(filteredData);
//       const stats = getSummaryStats(filteredData);

//       const workbook = XLSX.utils.book_new();
//       const summaryData = [
//         ["Enquiry Report Summary"],
//         [],
//         ["Total Enquiries", stats.total],
//         ["Total Leads", stats.leads],
//         ["Total Patients", stats.patients],
//         ["Active Patients", stats.activePatients],
//         ["Inactive Patients", stats.inactivePatients],
//         ["Conversion Rate (%)", stats.conversionRate],
//         [],
//         ["Applied Filters"],
//         ["Enquiry Type Filter", activeStatus],
//         ["Patient Status Filter", patientStatus],
//         ["Search Term", searchTerm || "-"],
//         ["Sort By", sortBy],
//       ];

//       XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), "Summary");
//       XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(normalizedData), "Enquiries");

//       const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//       const blob = new Blob([excelBuffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
//       });
//       saveAs(blob, getExportFileName("xlsx"));
//     } catch (error) {
//       console.error("Excel download failed:", error);
//       showToast("Failed to download Excel", "error");
//     } finally {
//       setDownloadingExcel(false);
//     }
//   };

//   const handleDownloadPdf = async () => {
//     try {
//       setDownloadingPdf(true);

//       const filteredData = await fetchExportData();
//       const stats = getSummaryStats(filteredData);

//       const blob = await pdf(
//         <EnquiryPdfDocument
//           enquiries={filteredData}
//           stats={stats}
//           activeStatus={activeStatus}
//           patientStatus={patientStatus}
//           searchTerm={searchTerm}
//           sortBy={sortBy}
//         />
//       ).toBlob();

//       saveAs(blob, getExportFileName("pdf"));
//     } catch (error) {
//       console.error("PDF download failed:", error);
//       showToast("Failed to download PDF", "error");
//     } finally {
//       setDownloadingPdf(false);
//     }
//   };

//   /* ---------- edit / convert / delete ---------- */

//   const openEditModal = (entry) => {
//     setSelectedEnquiry(entry);
//     setEditData({
//       enquiryId: entry?._id || "",
//       patientId: entry?.patientId?._id || "",
//       enquiryStatus: entry?.enquiryStatus || "lead",
//       patientStatus: entry?.patientId?.personalDetails?.patientStatus ? "true" : "false",
//       remark: entry?.remark || "",
//     });
//     setShowEditModal(true);
//   };

//   const closeEditModal = () => {
//     setShowEditModal(false);
//     setSelectedEnquiry(null);
//     setEditData({ enquiryId: "", patientId: "", enquiryStatus: "", patientStatus: "true", remark: "" });
//   };

//   // The form submits here; the actual request runs after the user confirms
//   const handleConvertToPatient = (data) => setConfirm({ kind: "convert", data });

//   const doConvertToPatient = async (data) => {
//     try {
//       setConverting(true);
//       const payload = { ...data, enquiryId: selectedEnquiry?._id };

//       const response = await fetch(`${backendURL}/api/patient/createPatient`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const result = await response.json();

//       if (result?.success) {
//         showToast("Patient created successfully");
//         refreshAll();
//         setShowConvertToPatientForm(false);
//         closeEditModal();
//       } else {
//         showToast(result?.message || "Failed to convert to patient", "error");
//       }
//     } catch (error) {
//       console.error("Convert to patient failed", error);
//       showToast("Something went wrong", "error");
//     } finally {
//       setConverting(false);
//       setConfirm(null);
//     }
//   };

//   const handleSaveEdit = async () => {
//     try {
//       setSavingEdit(true);

//       const response = await fetch(`${backendURL}/api/patient/updatePatientStatus`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           enquiryId: editData.enquiryId,
//           patientId: editData.patientId || null,
//           patientStatus: editData.enquiryStatus === "patient" ? editData.patientStatus === "true" : undefined,
//           remark: editData.remark,
//         }),
//       });
//       const result = await response.json();

//       if (result?.success) {
//         showToast("Updated successfully");
//         refreshAll();
//         closeEditModal();
//       } else {
//         showToast(result?.message || "Failed to update", "error");
//       }
//     } catch (error) {
//       console.error("Error updating enquiry/patient:", error);
//       showToast("Something went wrong", "error");
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   const handleDeleteEnquiry = async (enquiryId) => {
//     try {
//       setDeletingEnquiryId(enquiryId);

//       const response = await fetch(`${backendURL}/api/enquiry/deleteEnquiryById/${enquiryId}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           token: localStorage.getItem("webapptoken"),
//         },
//       });
//       const result = await response.json();

//       if (result?.success) {
//         showToast("Enquiry moved to the recycle bin");
//         refreshAll();
//         closeEditModal();
//       } else {
//         showToast(result?.message || "Delete failed", "error");
//       }
//     } catch (error) {
//       console.error("Delete enquiry failed", error);
//       showToast("Something went wrong", "error");
//     } finally {
//       setDeletingEnquiryId(null);
//       setConfirm(null);
//     }
//   };

//   /* ---------- derived numbers ---------- */

//   const total = counts.all;
//   const conversion = total ? Math.round(((counts.patient || 0) / total) * 100) : 0;
//   const from = pagination.totalEnquiries ? (pagination.currentPage - 1) * limit + 1 : 0;
//   const to = Math.min(pagination.currentPage * limit, pagination.totalEnquiries);
//   const show = (n) => (n === null ? "-" : n);

//   return (
//     <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Enquiries</h2>
//           <p className="mt-0.5 text-sm text-slate-500">Track leads and convert them into patients.</p>
//         </div>
//         <div className="flex flex-wrap gap-3">
//           <button
//             onClick={handleDownloadExcel}
//             disabled={downloadingExcel || loadingEnquiries || filteredEnquiries.length === 0}
//             className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-emerald-700"
//           >
//             {downloadingExcel ? <AiOutlineLoading3Quarters className="animate-spin" /> : <Icon d={ICONS.download} className="h-4 w-4" />}
//             {downloadingExcel ? "Preparing..." : "Excel"}
//           </button>
//           <button
//             onClick={handleDownloadPdf}
//             disabled={downloadingPdf || loadingEnquiries || filteredEnquiries.length === 0}
//             className="inline-flex items-center gap-2 rounded-xl border border-rose-600 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-rose-700"
//           >
//             {downloadingPdf ? <AiOutlineLoading3Quarters className="animate-spin" /> : <Icon d={ICONS.download} className="h-4 w-4" />}
//             {downloadingPdf ? "Preparing..." : "PDF"}
//           </button>
//           <Link
//             to="/enquiry"
//             className="inline-flex items-center gap-2 rounded-xl bg-[#0B4BAA] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2"
//           >
//             <Icon d={ICONS.plus} className="h-4 w-4" /> New Enquiry
//           </Link>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
//         <Stat label="Total enquiries" value={show(counts.all)} tone="text-[#0B4BAA]" />
//         <Stat label="Leads" value={show(counts.lead)} tone="text-amber-600" />
//         <Stat label="Patients" value={show(counts.patient)} tone="text-emerald-600" />
//         <Stat label="Conversion rate" value={total === null ? "-" : `${conversion}%`} tone="text-slate-900" />
//       </div>

//       {/* Filters */}
//       <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
//         <div className="flex flex-wrap items-center gap-3">
//           <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Enquiry type">
//             {TABS.map((t) => {
//               const on = activeStatus === t.key;
//               return (
//                 <button
//                   key={t.key}
//                   onClick={() => changeTab(t.key)}
//                   aria-pressed={on}
//                   className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
//                     on ? "bg-white text-[#0B4BAA] shadow-sm" : "text-slate-600 hover:text-[#0B4BAA]"
//                   }`}
//                 >
//                   {t.label}
//                   <span className={`rounded-full px-2 text-xs ${on ? "bg-[#0B4BAA]/10" : "bg-slate-200/70 text-slate-500"}`}>{show(counts[t.key])}</span>
//                 </button>
//               );
//             })}
//           </div>
//           <p className="text-sm text-slate-500">
//             Showing <b className="text-slate-700">{pagination.totalEnquiries}</b> result{pagination.totalEnquiries === 1 ? "" : "s"}
//           </p>
//         </div>

//         <div className="flex flex-col gap-3 md:flex-row md:items-center">
//           <div className="relative flex-1">
//             <Icon d={ICONS.search} className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
//             <input
//               type="text"
//               placeholder="Search by name, phone, or patient ID"
//               aria-label="Search enquiries"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               className={`${inputClass} w-full pl-10`}
//             />
//           </div>
//           {activeStatus === "patient" && (
//             <select
//               aria-label="Patient status"
//               value={patientStatus}
//               onChange={(e) => {
//                 setPatientStatus(e.target.value);
//                 setPage(1);
//               }}
//               className={inputClass}
//             >
//               <option value="all">All patients</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           )}
//           <select
//             aria-label="Sort enquiries"
//             value={sortBy}
//             onChange={(e) => {
//               setSortBy(e.target.value);
//               setPage(1);
//             }}
//             className={inputClass}
//           >
//             <option value="newest">Newest first</option>
//             <option value="oldest">Oldest first</option>
//           </select>
//           <select
//             aria-label="Results per page"
//             value={limit}
//             onChange={(e) => {
//               setLimit(Number(e.target.value));
//               setPage(1);
//             }}
//             className={inputClass}
//           >
//             <option value={6}>6 / page</option>
//             <option value={9}>9 / page</option>
//             <option value={12}>12 / page</option>
//             <option value={24}>24 / page</option>
//           </select>
//         </div>
//       </div>

//       {/* Results */}
//       {loadError ? (
//         <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
//           <Icon d={ICONS.alert} />
//           <span className="flex-1">{loadError}</span>
//           <button onClick={refreshAll} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
//             <Icon d={ICONS.refresh} className="h-3.5 w-3.5" /> Try again
//           </button>
//         </div>
//       ) : loadingEnquiries ? (
//         <div className="grid animate-pulse gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading enquiries">
//           {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
//             <div key={i} className="h-56 rounded-2xl bg-slate-200" />
//           ))}
//         </div>
//       ) : filteredEnquiries.length === 0 ? (
//         <div className="rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
//           <p className="text-lg font-semibold text-slate-700">No enquiries match your filters</p>
//           <p className="mt-1 text-sm text-slate-400">Try changing the filters or the search words.</p>
//         </div>
//       ) : (
//         <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
//           {filteredEnquiries.map((entry) => {
//             const isPatient = entry.enquiryStatus === "patient";
//             return (
//               <article key={entry._id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg">
//                 <div className="flex items-start gap-3">
//                   <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0B4BAA] to-[#082F6B] text-base font-bold uppercase text-white">
//                     {(entry?.patientName || "?").charAt(0)}
//                   </span>
//                   <div className="min-w-0 flex-1">
//                     <h3 className="truncate text-base font-bold text-slate-900">{entry?.patientName || "-"}</h3>
//                     <a href={`tel:${entry?.contactNumber}`} className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0B4BAA]">
//                       <Icon d={ICONS.phone} className="h-3.5 w-3.5" /> {entry?.contactNumber || "-"}
//                     </a>
//                   </div>
//                   {isAdmin && (
//                     <button
//                       onClick={() => openEditModal(entry)}
//                       aria-label={`Edit enquiry for ${entry?.patientName}`}
//                       title="Edit"
//                       className="rounded-lg p-2 text-slate-400 transition hover:bg-[#E6F9FA] hover:text-[#0B4BAA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
//                     >
//                       <Icon d={ICONS.edit} className="h-[18px] w-[18px]" />
//                     </button>
//                   )}
//                 </div>

//                 <div className="mt-4 flex flex-wrap items-center gap-2">
//                   <StatusPill entry={entry} />
//                   {isPatient && entry.patientId?.personalDetails?.patientId && (
//                     <span className="rounded-md bg-[#0B4BAA]/10 px-2 py-1 text-xs font-bold tracking-wide text-[#0B4BAA]">
//                       {entry.patientId.personalDetails.patientId}
//                     </span>
//                   )}
//                 </div>

//                 <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
//                   <div>
//                     <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Complaint</dt>
//                     <dd className="line-clamp-2 font-medium text-slate-800">{entry.chiefComplaint || "-"}</dd>
//                   </div>
//                   <div>
//                     <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Remark</dt>
//                     <dd className={`line-clamp-2 font-medium ${entry?.remark ? "text-slate-800" : "text-slate-400"}`}>{entry?.remark || "No remark"}</dd>
//                   </div>
//                 </dl>

//                 <div className="mt-auto flex items-center justify-between gap-2 pt-5">
//                   <span className="text-xs text-slate-400">Added {fmtDate(entry.createdAt)}</span>
//                   {isPatient && (
//                     <Link
//                       to={`/PatientDetails/${entry?.patientId?._id}`}
//                       className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0B4BAA] transition hover:bg-[#E6F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
//                     >
//                       View Details →
//                     </Link>
//                   )}
//                 </div>
//               </article>
//             );
//           })}
//         </div>
//       )}

//       {/* Pagination */}
//       {!loadingEnquiries && !loadError && pagination.totalEnquiries > 0 && (
//         <div className="flex flex-col items-center justify-between gap-3 pb-2 text-sm text-slate-500 sm:flex-row">
//           <p>
//             Showing {from}–{to} of {pagination.totalEnquiries}
//           </p>
//           {pagination.totalPages > 1 && (
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//                 disabled={!pagination.hasPrevPage || loadingEnquiries}
//                 className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Previous
//               </button>
//               <span className="rounded-xl bg-[#0B4BAA] px-4 py-2 font-bold text-white">
//                 {pagination.currentPage} <span className="font-medium text-blue-200">/ {pagination.totalPages}</span>
//               </span>
//               <button
//                 onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
//                 disabled={!pagination.hasNextPage || loadingEnquiries}
//                 className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Edit modal */}
//       {showEditModal && selectedEnquiry && (
//         <Modal onClose={closeEditModal} label="Edit enquiry">
//           <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
//             <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0B4BAA] to-[#082F6B] text-base font-bold uppercase text-white">
//               {(selectedEnquiry?.patientName || "?").charAt(0)}
//             </span>
//             <div className="min-w-0 flex-1">
//               <h2 className="truncate text-lg font-bold text-slate-900">{selectedEnquiry?.patientName}</h2>
//               <p className="text-sm text-slate-500">{selectedEnquiry?.contactNumber}</p>
//             </div>
//             <StatusPill entry={selectedEnquiry} />
//             <button onClick={closeEditModal} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]">
//               <Icon d={ICONS.close} />
//             </button>
//           </div>

//           <div className="space-y-5 px-6 py-5">
//             <div>
//               <label htmlFor="remark" className="mb-1.5 block text-sm font-semibold text-slate-700">Remark</label>
//               <textarea
//                 id="remark"
//                 rows={4}
//                 value={editData.remark}
//                 onChange={(e) => setEditData((prev) => ({ ...prev, remark: e.target.value }))}
//                 className={`${inputClass} w-full`}
//                 placeholder="Add a note about this enquiry"
//               />
//             </div>

//             {editData.enquiryStatus === "patient" && (
//               <div>
//                 <p className="mb-1.5 text-sm font-semibold text-slate-700">Patient status</p>
//                 <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Patient status">
//                   {[
//                     ["true", "Active"],
//                     ["false", "Inactive"],
//                   ].map(([v, label]) => {
//                     const on = editData.patientStatus === v;
//                     return (
//                       <button
//                         key={v}
//                         type="button"
//                         role="radio"
//                         aria-checked={on}
//                         onClick={() => setEditData((prev) => ({ ...prev, patientStatus: v }))}
//                         className={`rounded-lg py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
//                           on ? (v === "true" ? "bg-emerald-600 text-white shadow-sm" : "bg-rose-600 text-white shadow-sm") : "text-slate-600 hover:text-slate-900"
//                         }`}
//                       >
//                         {label}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
//             <button
//               onClick={() => setConfirm({ kind: "delete", data: selectedEnquiry?._id })}
//               disabled={deletingEnquiryId === selectedEnquiry?._id}
//               className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-60"
//             >
//               {deletingEnquiryId === selectedEnquiry?._id ? <AiOutlineLoading3Quarters className="animate-spin" /> : <Icon d={ICONS.trash} className="h-4 w-4" />}
//               Delete
//             </button>
//             <div className="flex flex-wrap gap-3">
//               {selectedEnquiry?.enquiryStatus === "lead" && (
//                 <button
//                   onClick={() => {
//                     setShowEditModal(false);
//                     setShowConvertToPatientForm(true);
//                   }}
//                   className="rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
//                 >
//                   Convert to Patient
//                 </button>
//               )}
//               <button
//                 onClick={handleSaveEdit}
//                 disabled={savingEdit}
//                 className="inline-flex items-center gap-2 rounded-xl bg-[#0B4BAA] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2 disabled:opacity-70"
//               >
//                 {savingEdit && <AiOutlineLoading3Quarters className="animate-spin" />}
//                 {savingEdit ? "Saving..." : "Update"}
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {showConvertToPatientForm && (
//         <ConvertToPatientForm
//           selectedEnquiry={selectedEnquiry}
//           onClose={() => {
//             setShowConvertToPatientForm(false);
//             setShowEditModal(true);
//           }}
//           onSubmit={handleConvertToPatient}
//         />
//       )}

//       {/* Confirm dialog */}
//       {confirm && (
//         <Modal onClose={() => !converting && !deletingEnquiryId && setConfirm(null)} label="Please confirm" z="z-[90]">
//           <div className="p-6 text-center">
//             <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${confirm.kind === "delete" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
//               <Icon d={confirm.kind === "delete" ? ICONS.trash : ICONS.check} className="h-7 w-7" />
//             </span>
//             <h3 className="mt-4 text-lg font-bold text-slate-900">
//               {confirm.kind === "delete" ? "Delete this enquiry?" : "Convert to patient?"}
//             </h3>
//             <p className="mt-1.5 text-sm text-slate-500">
//               {confirm.kind === "delete"
//                 ? "This cannot be undone."
//                 : "A patient record will be created from this enquiry."}
//             </p>
//             <div className="mt-6 flex justify-center gap-3">
//               <button
//                 onClick={() => setConfirm(null)}
//                 disabled={converting || !!deletingEnquiryId}
//                 className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:opacity-60"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => (confirm.kind === "delete" ? handleDeleteEnquiry(confirm.data) : doConvertToPatient(confirm.data))}
//                 disabled={converting || !!deletingEnquiryId}
//                 className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-70 ${
//                   confirm.kind === "delete" ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500" : "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
//                 }`}
//               >
//                 {(converting || deletingEnquiryId) && <AiOutlineLoading3Quarters className="animate-spin" />}
//                 {confirm.kind === "delete" ? "Delete" : "Convert"}
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* Toast */}
//       {toast && (
//         <div
//           role={toast.type === "error" ? "alert" : "status"}
//           className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${
//             toast.type === "error" ? "bg-rose-600" : "bg-slate-900"
//           }`}
//         >
//           <Icon d={toast.type === "error" ? ICONS.alert : ICONS.check} className="h-5 w-5" />
//           {toast.text}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllEnquiry;


import ConvertToPatientForm from "./ConvertToPatientForm";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { pdf } from "@react-pdf/renderer";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import EnquiryPdfDocument from "./pdf/EnquiryPdfDocument";

/*
  All Enquiry: patient register layout.
  Table of enquiries, click a row to open the detail panel on the right.
  Same API calls, filters, edit / convert / delete flows and exports as before.
  Status shown: "Lead" for leads, and only "Active" or "Inactive" for patients.
*/

const Icon = ({ d, className = "h-5 w-5" }) => (
  <svg className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICONS = {
  search: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
  plus: "M12 5v14M5 12h14",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  phone: "M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z",
  close: "M6 18L18 6M6 6l12 12",
  alert: "M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  check: "M20 6L9 17l-5-5",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  chevron: "M9 18l6-6-6-6",
  mail: "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

// Convert a stored date into the YYYY-MM-DD format required by date inputs.
const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const TABS = [
  { key: "all", label: "All" },
  { key: "lead", label: "Leads" },
  { key: "patient", label: "Patients" },
];

const inputClass =
  "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-[#0B4BAA] focus:ring-4 focus:ring-[#00C2CB]/20";

/* ---------- small UI pieces ---------- */

// Leads show "Lead". Patients show only "Active" or "Inactive".
const StatusPill = ({ entry }) => {
  if (entry.enquiryStatus === "lead") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Lead
      </span>
    );
  }
  const active = entry?.patientId?.personalDetails?.patientStatus;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
};

const Avatar = ({ name, size = "h-10 w-10 text-sm" }) => (
  <span className={`grid ${size} shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0B4BAA] to-[#082F6B] font-bold uppercase text-white`}>
    {(name || "?").charAt(0)}
  </span>
);

const Field = ({ label, children }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium text-slate-800">{children || "-"}</dd>
  </div>
);

const Section = ({ title, children }) => (
  <section>
    <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#0B4BAA]">{title}</h3>
    {children}
  </section>
);

const Modal = ({ onClose, label, children, z = "z-[90]" }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className={`fixed inset-0 ${z} overflow-y-auto bg-slate-900/60 backdrop-blur-sm`} onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-label={label} className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  );
};

const AllEnquiry = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const [enquiries, setEnquiries] = useState([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [patientStatus, setPatientStatus] = useState("all");
  const [showConvertToPatientForm, setShowConvertToPatientForm] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deletingEnquiryId, setDeletingEnquiryId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false); // the detail panel
  const [editData, setEditData] = useState({
    enquiryId: "",
    patientId: "",
    enquiryStatus: "",
    patientStatus: "true",
    remark: "",
    followUp1: "",
    followUp2: "",
    followUp3: "",
    followUp4: "",
    followUpNote1: "",
    followUpNote2: "",
    followUpNote3: "",
    followUpNote4: "",
  });

  const [savingEdit, setSavingEdit] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEnquiries: 0,
    limit: 9,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const [counts, setCounts] = useState({ all: null, lead: null, patient: null });
  const [confirm, setConfirm] = useState(null); // { kind: "delete" | "convert", data }
  const [converting, setConverting] = useState(false);
  const [toast, setToast] = useState(null);

  const reqId = useRef(0);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- data loading ---------- */

  const fetchAllEnquiries = async () => {
    const id = ++reqId.current;
    try {
      setLoadingEnquiries(true);
      setLoadError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        activeStatus,
        patientStatus,
        search: searchTerm.trim(),
        sortBy,
      });

      const response = await fetch(`${backendURL}/api/enquiry/getEnquiry?${params.toString()}`);
      const result = await response.json();
      if (id !== reqId.current) return;

      setEnquiries(result?.enquiries || []);
      setPagination(
        result?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalEnquiries: 0,
          limit,
          hasPrevPage: false,
          hasNextPage: false,
        }
      );
    } catch (error) {
      if (id !== reqId.current) return;
      console.error("Error fetching enquiries:", error);
      setLoadError("Could not load the enquiries. Check your connection and try again.");
    } finally {
      if (id === reqId.current) setLoadingEnquiries(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const entries = await Promise.all(
        TABS.map(async (t) => {
          const params = new URLSearchParams({
            page: "1",
            limit: "1",
            activeStatus: t.key,
            patientStatus: "all",
            search: "",
            sortBy: "newest",
          });
          const res = await fetch(`${backendURL}/api/enquiry/getEnquiry?${params.toString()}`);
          const json = await res.json();
          return [t.key, json?.pagination?.totalEnquiries ?? null];
        })
      );
      setCounts(Object.fromEntries(entries));
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const refreshAll = () => {
    fetchAllEnquiries();
    fetchCounts();
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchAllEnquiries();
  }, [page, limit, activeStatus, patientStatus, searchTerm, sortBy]);

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    const employeeData = localStorage.getItem("loginEmployeeData");
    if (!employeeData) {
      setIsAdmin(false);
      return;
    }
    try {
      const employee = JSON.parse(employeeData);
      const loggedInEmail = employee?.personalDetails?.email?.trim()?.toLowerCase();
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim()?.toLowerCase();
      setIsAdmin(loggedInEmail === adminEmail);
    } catch (error) {
      console.error("Failed to parse loginEmployeeData:", error);
      setIsAdmin(false);
    }
  }, []);

  /* ---------- filtering (same rules as before) ---------- */

  const applyClientFilters = (list) => {
    let filtered = [...list];
    if (activeStatus === "all") {
      filtered = filtered.filter((e) => {
        const status = e?.patientId?.personalDetails?.patientStatus;
        return !(e.enquiryStatus === "patient" && status === false);
      });
    } else if (activeStatus === "lead") {
      filtered = filtered.filter((e) => e.enquiryStatus === "lead");
    } else if (activeStatus === "patient") {
      filtered = filtered.filter((e) => e.enquiryStatus === "patient");
    }

    if (activeStatus === "patient" && patientStatus !== "all") {
      filtered = filtered.filter((e) => {
        const status = e?.patientId?.personalDetails?.patientStatus;
        if (patientStatus === "active") return status === true;
        if (patientStatus === "inactive") return status === false;
        return true;
      });
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        const nameMatch = item?.patientName?.toLowerCase().includes(term);
        const phoneMatch = item?.contactNumber?.includes(term);
        const patientIdMatch = item?.patientId?.personalDetails?.patientId?.toLowerCase().includes(term);
        return nameMatch || phoneMatch || patientIdMatch;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredEnquiries = applyClientFilters(enquiries);

  const changeTab = (key) => {
    setActiveStatus(key);
    if (key !== "patient") setPatientStatus("all");
    setPage(1);
  };

  /* ---------- exports ---------- */

  const normalizeEnquiryData = (data) =>
    data.map((item, index) => ({
      "S.No": index + 1,
      "Enquiry ID": item?._id || "",
      Type: item?.enquiryStatus || "",
      "Patient Status":
        item?.enquiryStatus === "patient"
          ? item?.patientId?.personalDetails?.patientStatus
            ? "Active"
            : "Inactive"
          : "-",
      "Patient Code": item?.patientId?.personalDetails?.patientId || "-",
      Name: item?.patientName || "",
      Gender: item?.gender || "",
      Age: item?.age ?? "",
      Occupation: item?.occupation || "",
      "Contact Number": item?.contactNumber || "",
      Email: item?.email || "",
      "Chief Complaint": item?.chiefComplaint || "",
      Remark: item?.remark || "",
      "Follow-up 1": item?.followUp1 ? fmtDate(item.followUp1) : "",
      "Follow-up 2": item?.followUp2 ? fmtDate(item.followUp2) : "",
      "Follow-up 3": item?.followUp3 ? fmtDate(item.followUp3) : "",
      "Follow-up 4": item?.followUp4 ? fmtDate(item.followUp4) : "",
      "Follow-up 1 Note": item?.followUpNote1 || "",
      "Follow-up 2 Note": item?.followUpNote2 || "",
      "Follow-up 3 Note": item?.followUpNote3 || "",
      "Follow-up 4 Note": item?.followUpNote4 || "",
      Response: item?.response || "",
      Source: item?.source || "",
      Address: item?.patientId?.personalDetails?.address || "-",
      "Attendance Count": item?.patientId?.attendance?.length || 0,
      "Billing Count": item?.patientId?.billing?.length || 0,
      "Treatment Count": item?.patientId?.treatment?.length || 0,
      "Created Date": item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
      "Created Time": item?.createdAt ? new Date(item.createdAt).toLocaleTimeString() : "",
      "Updated Date": item?.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "",
    }));

  const getSummaryStats = (data) => {
    const total = data.length;
    const leads = data.filter((item) => item.enquiryStatus === "lead").length;
    const patients = data.filter((item) => item.enquiryStatus === "patient").length;
    const activePatients = data.filter(
      (item) => item.enquiryStatus === "patient" && item?.patientId?.personalDetails?.patientStatus === true
    ).length;
    const inactivePatients = data.filter(
      (item) => item.enquiryStatus === "patient" && item?.patientId?.personalDetails?.patientStatus === false
    ).length;
    const conversionRate = total > 0 ? ((patients / total) * 100).toFixed(2) : 0;
    return { total, leads, patients, activePatients, inactivePatients, conversionRate };
  };

  const getExportFileName = (type) => {
    const date = new Date().toISOString().split("T")[0];
    const statusPart = activeStatus || "all";
    const patientFilterPart = activeStatus === "patient" ? `-${patientStatus}` : "";
    const searchPart = searchTerm?.trim() ? `-${searchTerm.trim().replace(/\s+/g, "-")}` : "";
    return `enquiry-${statusPart}${patientFilterPart}${searchPart}-${date}.${type}`;
  };

  // Exports cover every result of the current filters, not only the visible page
  const fetchExportData = async () => {
    const params = new URLSearchParams({
      page: "1",
      limit: String(Math.max(pagination.totalEnquiries || 0, limit, 1)),
      activeStatus,
      patientStatus,
      search: searchTerm.trim(),
      sortBy,
    });
    const response = await fetch(`${backendURL}/api/enquiry/getEnquiry?${params.toString()}`);
    const result = await response.json();
    return applyClientFilters(result?.enquiries || []);
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);

      const filteredData = await fetchExportData();
      const normalizedData = normalizeEnquiryData(filteredData);
      const stats = getSummaryStats(filteredData);

      const workbook = XLSX.utils.book_new();
      const summaryData = [
        ["Enquiry Report Summary"],
        [],
        ["Total Enquiries", stats.total],
        ["Total Leads", stats.leads],
        ["Total Patients", stats.patients],
        ["Active Patients", stats.activePatients],
        ["Inactive Patients", stats.inactivePatients],
        ["Conversion Rate (%)", stats.conversionRate],
        [],
        ["Applied Filters"],
        ["Enquiry Type Filter", activeStatus],
        ["Patient Status Filter", patientStatus],
        ["Search Term", searchTerm || "-"],
        ["Sort By", sortBy],
      ];

      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), "Summary");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(normalizedData), "Enquiries");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(blob, getExportFileName("xlsx"));
    } catch (error) {
      console.error("Excel download failed:", error);
      showToast("Failed to download Excel", "error");
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);

      const filteredData = await fetchExportData();
      const stats = getSummaryStats(filteredData);

      const blob = await pdf(
        <EnquiryPdfDocument
          enquiries={filteredData}
          stats={stats}
          activeStatus={activeStatus}
          patientStatus={patientStatus}
          searchTerm={searchTerm}
          sortBy={sortBy}
        />
      ).toBlob();

      saveAs(blob, getExportFileName("pdf"));
    } catch (error) {
      console.error("PDF download failed:", error);
      showToast("Failed to download PDF", "error");
    } finally {
      setDownloadingPdf(false);
    }
  };

  /* ---------- detail panel / convert / delete ---------- */

  const openEditModal = (entry) => {
    setSelectedEnquiry(entry);
    setEditData({
      enquiryId: entry?._id || "",
      patientId: entry?.patientId?._id || "",
      enquiryStatus: entry?.enquiryStatus || "lead",
      patientStatus: entry?.patientId?.personalDetails?.patientStatus ? "true" : "false",
      remark: entry?.remark || "",
      followUp1: toDateInputValue(entry?.followUp1),
      followUp2: toDateInputValue(entry?.followUp2),
      followUp3: toDateInputValue(entry?.followUp3),
      followUp4: toDateInputValue(entry?.followUp4),
      followUpNote1: entry?.followUpNote1 || "",
      followUpNote2: entry?.followUpNote2 || "",
      followUpNote3: entry?.followUpNote3 || "",
      followUpNote4: entry?.followUpNote4 || "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEnquiry(null);
    setEditData({
      enquiryId: "",
      patientId: "",
      enquiryStatus: "",
      patientStatus: "true",
      remark: "",
      followUp1: "",
      followUp2: "",
      followUp3: "",
      followUp4: "",
      followUpNote1: "",
      followUpNote2: "",
      followUpNote3: "",
      followUpNote4: "",
    });
  };

  useEffect(() => {
    if (!showEditModal) return;
    const onKey = (e) => e.key === "Escape" && !confirm && closeEditModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showEditModal, confirm]);

  const handleConvertToPatient = (data) => setConfirm({ kind: "convert", data });

  const doConvertToPatient = async (data) => {
    try {
      setConverting(true);
      const payload = { ...data, enquiryId: selectedEnquiry?._id };

      const response = await fetch(`${backendURL}/api/patient/createPatient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result?.success) {
        showToast("Patient created successfully");
        refreshAll();
        setShowConvertToPatientForm(false);
        closeEditModal();
      } else {
        showToast(result?.message || "Failed to convert to patient", "error");
      }
    } catch (error) {
      console.error("Convert to patient failed", error);
      showToast("Something went wrong", "error");
    } finally {
      setConverting(false);
      setConfirm(null);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSavingEdit(true);

      const response = await fetch(`${backendURL}/api/patient/updatePatientStatus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: editData.enquiryId,
          patientId: editData.patientId || null,
          patientStatus: editData.enquiryStatus === "patient" ? editData.patientStatus === "true" : undefined,
          remark: editData.remark,
          followUp1: editData.followUp1 || null,
          followUp2: editData.followUp2 || null,
          followUp3: editData.followUp3 || null,
          followUp4: editData.followUp4 || null,
          followUpNote1: editData.followUpNote1 || "",
          followUpNote2: editData.followUpNote2 || "",
          followUpNote3: editData.followUpNote3 || "",
          followUpNote4: editData.followUpNote4 || "",
        }),
      });
      const result = await response.json();

      if (result?.success) {
        showToast("Updated successfully");
        refreshAll();
        closeEditModal();
      } else {
        showToast(result?.message || "Failed to update", "error");
      }
    } catch (error) {
      console.error("Error updating enquiry/patient:", error);
      showToast("Something went wrong", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteEnquiry = async (enquiryId) => {
    try {
      setDeletingEnquiryId(enquiryId);

      const response = await fetch(`${backendURL}/api/enquiry/deleteEnquiryById/${enquiryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("webapptoken"),
        },
      });
      const result = await response.json();

      if (result?.success) {
        showToast("Enquiry deleted successfully");
        refreshAll();
        closeEditModal();
      } else {
        showToast(result?.message || "Delete failed", "error");
      }
    } catch (error) {
      console.error("Delete enquiry failed", error);
      showToast("Something went wrong", "error");
    } finally {
      setDeletingEnquiryId(null);
      setConfirm(null);
    }
  };

  /* ---------- derived numbers ---------- */

  const total = counts.all;
  const conversion = total ? Math.round(((counts.patient || 0) / total) * 100) : 0;
  const from = pagination.totalEnquiries ? (pagination.currentPage - 1) * limit + 1 : 0;
  const to = Math.min(pagination.currentPage * limit, pagination.totalEnquiries);
  const show = (n) => (n === null ? "-" : n);

  const sel = selectedEnquiry;
  const selIsPatient = sel?.enquiryStatus === "patient";
  const pd = sel?.patientId?.personalDetails;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <style>{`@keyframes enqSlide{from{transform:translateX(28px);opacity:0}to{transform:none;opacity:1}}`}</style>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Enquiries</h2>
          <p className="mt-0.5 text-sm text-slate-500">Your register of leads and patients. Select a row to see the full details.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel || loadingEnquiries || filteredEnquiries.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingExcel ? <AiOutlineLoading3Quarters className="animate-spin" /> : <Icon d={ICONS.download} className="h-4 w-4" />}
            {downloadingExcel ? "Preparing..." : "Excel"}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || loadingEnquiries || filteredEnquiries.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-600 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingPdf ? <AiOutlineLoading3Quarters className="animate-spin" /> : <Icon d={ICONS.download} className="h-4 w-4" />}
            {downloadingPdf ? "Preparing..." : "PDF"}
          </button>
          <Link
            to="/enquiry"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B4BAA] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2"
          >
            <Icon d={ICONS.plus} className="h-4 w-4" /> New Enquiry
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Enquiries", value: show(counts.all), note: "All time", tone: "text-[#0B4BAA]", accent: "bg-blue-50" },
          { label: "Leads", value: show(counts.lead), note: "Waiting for follow-up", tone: "text-amber-600", accent: "bg-amber-50" },
          { label: "Patients", value: show(counts.patient), note: "Converted from leads", tone: "text-emerald-600", accent: "bg-emerald-50" },
          { label: "Conversion", value: total === null ? "-" : `${conversion}%`, note: "Leads turned into patients", tone: "text-slate-900", accent: "bg-slate-100" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex min-w-0 min-h-[112px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[124px] sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-xs">
                {s.label}
              </p>
              <span className={`h-2 w-2 shrink-0 rounded-full ${s.accent}`} />
            </div>
            <p className={`mt-2 text-2xl font-extrabold leading-none tracking-tight sm:text-3xl ${s.tone}`}>
              {s.value}
            </p>
            <p className="mt-2 truncate text-[11px] font-medium text-slate-500 sm:text-xs">
              {s.note}
            </p>
          </div>
        ))}
      </div>

      {/* Register */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {/* Tabs */}
        <div className="flex gap-6 overflow-x-auto border-b border-slate-200 px-5">
          {TABS.map((t) => {
            const on = activeStatus === t.key;
            return (
              <button
                key={t.key}
                onClick={() => changeTab(t.key)}
                aria-pressed={on}
                className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
                  on ? "border-[#0B4BAA] text-[#0B4BAA]" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${on ? "bg-[#0B4BAA]/10 text-[#0B4BAA]" : "bg-slate-100 text-slate-500"}`}>{show(counts[t.key])}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Icon d={ICONS.search} className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or patient ID"
              aria-label="Search enquiries"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`${inputClass} w-full pl-10`}
            />
          </div>
          {activeStatus === "patient" && (
            <select
              aria-label="Patient status"
              value={patientStatus}
              onChange={(e) => {
                setPatientStatus(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="all">All patients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
          <select
            aria-label="Sort enquiries"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <select
            aria-label="Rows per page"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className={inputClass}
          >
            <option value={6}>6 rows</option>
            <option value={9}>9 rows</option>
            <option value={12}>12 rows</option>
            <option value={24}>24 rows</option>
          </select>
        </div>

        {/* Table */}
        {loadError ? (
          <div role="alert" className="m-4 flex flex-wrap items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
            <Icon d={ICONS.alert} />
            <span className="flex-1">{loadError}</span>
            <button onClick={refreshAll} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
              <Icon d={ICONS.refresh} className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        ) : loadingEnquiries ? (
          <div className="animate-pulse divide-y divide-slate-100" aria-busy="true" aria-label="Loading enquiries">
            {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-28 rounded bg-slate-100" />
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold text-slate-700">No enquiries match your filters</p>
            <p className="mt-1 text-sm text-slate-400">Try changing the filters or the search words.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="hidden px-3 py-3 font-semibold md:table-cell">Patient ID</th>
                  <th className="hidden px-3 py-3 font-semibold lg:table-cell">Complaint</th>
                  <th className="hidden px-3 py-3 font-semibold xl:table-cell">Remark</th>
                  <th className="hidden px-3 py-3 font-semibold sm:table-cell">Added</th>
                  <th className="w-10 px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.map((entry) => (
                  <tr
                    key={entry._id}
                    tabIndex={0}
                    onClick={() => openEditModal(entry)}
                    onKeyDown={(e) => e.key === "Enter" && openEditModal(entry)}
                    className="cursor-pointer transition hover:bg-[#E6F9FA]/50 focus:bg-[#E6F9FA]/50 focus:outline-none"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={entry?.patientName} />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{entry?.patientName || "-"}</p>
                          <p className="text-[13px] text-slate-500">{entry?.contactNumber || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5"><StatusPill entry={entry} /></td>
                    <td className="hidden px-3 py-3.5 font-semibold text-[#0B4BAA] md:table-cell">
                      {entry?.patientId?.personalDetails?.patientId || <span className="font-normal text-slate-300">-</span>}
                    </td>
                    <td className="hidden max-w-[220px] px-3 py-3.5 text-slate-600 lg:table-cell">
                      <p className="truncate">{entry.chiefComplaint || "-"}</p>
                    </td>
                    <td className="hidden max-w-[200px] px-3 py-3.5 text-slate-600 xl:table-cell">
                      <p className="truncate">{entry?.remark || <span className="text-slate-300">-</span>}</p>
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3.5 text-slate-500 sm:table-cell">{fmtDate(entry.createdAt)}</td>
                    <td className="px-3 py-3.5 text-slate-300"><Icon d={ICONS.chevron} className="h-4 w-4" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loadingEnquiries && !loadError && pagination.totalEnquiries > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row">
            <p>
              Showing {from}–{to} of {pagination.totalEnquiries}
            </p>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage || loadingEnquiries}
                  className="rounded-lg border border-slate-300 px-3.5 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 font-semibold text-slate-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNextPage || loadingEnquiries}
                  className="rounded-lg border border-slate-300 px-3.5 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {showEditModal && sel && (
        <>
          <div className="fixed inset-0 z-[65] bg-slate-900/40" onClick={closeEditModal} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Enquiry details"
            style={{ animation: "enqSlide .2s ease-out" }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Panel header */}
            <div className="border-b border-slate-100 bg-gradient-to-br from-[#0B4BAA] to-[#082F6B] px-6 py-5 text-white">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/15 text-lg font-bold uppercase ring-2 ring-white/25">
                  {(sel?.patientName || "?").charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold">{sel?.patientName}</h2>
                  <a href={`tel:${sel?.contactNumber}`} className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-blue-100 hover:text-white">
                    <Icon d={ICONS.phone} className="h-3.5 w-3.5" /> {sel?.contactNumber}
                  </a>
                </div>
                <button onClick={closeEditModal} aria-label="Close panel" className="rounded-lg p-1.5 text-blue-100 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <Icon d={ICONS.close} />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-1 py-0.5"><StatusPill entry={sel} /></span>
                {selIsPatient && pd?.patientId && (
                  <span className="rounded-md bg-white/15 px-2 py-1 text-xs font-bold tracking-wide">{pd.patientId}</span>
                )}
              </div>
            </div>

            {/* Panel body */}
            <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
              {selIsPatient && (
                <Link
                  to={`/PatientDetails/${sel?.patientId?._id}`}
                  className="flex items-center justify-between rounded-xl bg-[#E6F9FA] px-4 py-3 text-sm font-semibold text-[#0B4BAA] transition hover:bg-[#d3f3f5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
                >
                  Open full patient record <Icon d={ICONS.chevron} className="h-4 w-4" />
                </Link>
              )}

              <Section title="Contact">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="Phone">{sel?.contactNumber}</Field>
                  <Field label="Email">
                    {sel?.email && (
                      <a href={`mailto:${sel.email}`} className="text-[#0B4BAA] hover:underline">{sel.email}</a>
                    )}
                  </Field>
                </dl>
              </Section>

              <Section title="Profile">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="Gender">{sel?.gender}</Field>
                  <Field label="Age">{sel?.age}</Field>
                  <Field label="Occupation">{sel?.occupation}</Field>
                  <Field label="Source">{sel?.source}</Field>
                </dl>
              </Section>

              <Section title="Enquiry">
                <dl className="space-y-4">
                  <Field label="Chief complaint">{sel?.chiefComplaint}</Field>
                  <div className="grid grid-cols-2 gap-x-4">
                    <Field label="Response">{sel?.response}</Field>
                    <Field label="Added">{fmtDate(sel?.createdAt)}</Field>
                  </div>
                </dl>
              </Section>

              {selIsPatient && (
                <Section title="Patient record">
                  <dl className="mb-4">
                    <Field label="Address">{pd?.address}</Field>
                  </dl>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["Visits", sel?.patientId?.attendance?.length || 0],
                      ["Bills", sel?.patientId?.billing?.length || 0],
                      ["Treatments", sel?.patientId?.treatment?.length || 0],
                    ].map(([label, n]) => (
                      <div key={label} className="rounded-xl bg-slate-50 px-3 py-3 text-center ring-1 ring-slate-200">
                        <p className="text-xl font-extrabold text-slate-900">{n}</p>
                        <p className="text-xs text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <Section title="Remark">
                {isAdmin ? (
                  <textarea
                    rows={4}
                    aria-label="Remark"
                    value={editData.remark}
                    onChange={(e) => setEditData((prev) => ({ ...prev, remark: e.target.value }))}
                    className={`${inputClass} w-full`}
                    placeholder="Add a note about this enquiry"
                  />
                ) : (
                  <p className={`text-sm font-medium ${sel?.remark ? "text-slate-800" : "text-slate-400"}`}>{sel?.remark || "No remark"}</p>
                )}
              </Section>

              {/* Follow-up schedule and notes */}
              <Section title="Follow-ups">
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3, 4].map((number) => {
                    const dateKey = `followUp${number}`;
                    const noteKey = `followUpNote${number}`;
                    const dateValue = isAdmin
                      ? editData[dateKey]
                      : toDateInputValue(sel?.[dateKey]);
                    const noteValue = isAdmin
                      ? editData[noteKey]
                      : (sel?.[noteKey] || "");

                    return (
                      <div
                        key={dateKey}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor={`enquiry-${dateKey}`}
                            className="text-sm font-semibold text-slate-700"
                          >
                            Follow-up {number}
                          </label>
                        </div>
                        <label
                          htmlFor={`enquiry-${dateKey}`}
                          className="mb-1 block text-xs font-medium text-slate-500"
                        >
                          Follow-up date
                        </label>
                        {isAdmin ? (
                          <input
                            id={`enquiry-${dateKey}`}
                            type="date"
                            value={dateValue || ""}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                [dateKey]: e.target.value,
                              }))
                            }
                            className={`${inputClass} w-full`}
                          />
                        ) : (
                          <p className="mb-3 text-sm font-medium text-slate-800">
                            {dateValue
                              ? fmtDate(dateValue)
                              : <span className="text-slate-400">Not scheduled</span>}
                          </p>
                        )}

                        <label
                          htmlFor={`enquiry-${noteKey}`}
                          className="mb-1 mt-3 block text-xs font-medium text-slate-500"
                        >
                          Follow-up note / outcome
                        </label>
                        {isAdmin ? (
                          <textarea
                            id={`enquiry-${noteKey}`}
                            rows={2}
                            value={noteValue}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                [noteKey]: e.target.value,
                              }))
                            }
                            className={`${inputClass} w-full resize-y`}
                            placeholder={`Add note for follow-up ${number}`}
                          />
                        ) : (
                          <p className={`whitespace-pre-wrap text-sm ${noteValue ? "text-slate-700" : "text-slate-400"}`}>
                            {noteValue || "No follow-up note"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Add a date and a note or outcome for each of the four follow-ups.
                </p>
              </Section>

              {isAdmin && selIsPatient && (
                <Section title="Patient status">
                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Patient status">
                    {[
                      ["true", "Active"],
                      ["false", "Inactive"],
                    ].map(([v, label]) => {
                      const on = editData.patientStatus === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setEditData((prev) => ({ ...prev, patientStatus: v }))}
                          className={`rounded-lg py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
                            on ? (v === "true" ? "bg-emerald-600 text-white shadow-sm" : "bg-rose-600 text-white shadow-sm") : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Section>
              )}
            </div>

            {/* Panel footer (admin actions) */}
            {isAdmin && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
                <button
                  onClick={() => setConfirm({ kind: "delete", data: sel?._id })}
                  disabled={deletingEnquiryId === sel?._id}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-60"
                >
                  {deletingEnquiryId === sel?._id ? <AiOutlineLoading3Quarters className="animate-spin" /> : <Icon d={ICONS.trash} className="h-4 w-4" />}
                  Delete
                </button>
                <div className="flex flex-wrap gap-3">
                  {sel?.enquiryStatus === "lead" && (
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setShowConvertToPatientForm(true);
                      }}
                      className="rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Convert to Patient
                    </button>
                  )}
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0B4BAA] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2 disabled:opacity-70"
                  >
                    {savingEdit && <AiOutlineLoading3Quarters className="animate-spin" />}
                    {savingEdit ? "Saving..." : "Update"}
                  </button>
                </div>
              </div>
            )}
          </aside>
        </>
      )}

      {showConvertToPatientForm && (
        <ConvertToPatientForm
          selectedEnquiry={selectedEnquiry}
          onClose={() => {
            setShowConvertToPatientForm(false);
            setShowEditModal(true);
          }}
          onSubmit={handleConvertToPatient}
        />
      )}

      {/* Confirm dialog */}
      {confirm && (
        <Modal onClose={() => !converting && !deletingEnquiryId && setConfirm(null)} label="Please confirm">
          <div className="p-6 text-center">
            <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${confirm.kind === "delete" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
              <Icon d={confirm.kind === "delete" ? ICONS.trash : ICONS.check} className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {confirm.kind === "delete" ? "Delete this enquiry?" : "Convert to patient?"}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              {confirm.kind === "delete" ? "This cannot be undone." : "A patient record will be created from this enquiry."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setConfirm(null)}
                disabled={converting || !!deletingEnquiryId}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => (confirm.kind === "delete" ? handleDeleteEnquiry(confirm.data) : doConvertToPatient(confirm.data))}
                disabled={converting || !!deletingEnquiryId}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-70 ${
                  confirm.kind === "delete" ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500" : "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                }`}
              >
                {(converting || deletingEnquiryId) && <AiOutlineLoading3Quarters className="animate-spin" />}
                {confirm.kind === "delete" ? "Delete" : "Convert"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${
            toast.type === "error" ? "bg-rose-600" : "bg-slate-900"
          }`}
        >
          <Icon d={toast.type === "error" ? ICONS.alert : ICONS.check} className="h-5 w-5" />
          {toast.text}
        </div>
      )}
    </div>
  );
};

export default AllEnquiry;
