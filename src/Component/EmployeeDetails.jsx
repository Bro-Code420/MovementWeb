// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   FaTrash,
//   FaEdit,
//   FaTimes,
//   FaSpinner,
//   FaEye,
//   FaEyeSlash,
// } from "react-icons/fa";
// import AttendanceSection from "./employeePersonalDetails/AttendanceSection";

// const EmployeeDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [role, setRole] = useState("employee");

//   const [employeeDetail, setEmployeeDetail] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [isEditingPersonal, setIsEditingPersonal] = useState(false);
//   const [personalForm, setPersonalForm] = useState({});
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     const employee = localStorage.getItem("loginEmployeeData");
//     const data = JSON.parse(employee);
//     if (data?.personalDetails?.email === import.meta.env.VITE_ADMIN_EMAIL) {
//       setRole("admin");
//     }
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${
//           import.meta.env.VITE_BACKEND_URL
//         }/api/employee/getEmployeeById/${id}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             token: localStorage.getItem("token"),
//           },
//         },
//       );

//       const result = await response.json();
//       if (result?.success) {
//         setEmployeeDetail(result?.employee);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (id) fetchData();
//   }, [id]);

//   // console.log("employee", employeeDetail);

//   const personal = employeeDetail?.personalDetails;
//   const patients = employeeDetail?.patientLook?.patientId || [];
//   const attendance = employeeDetail?.attendance || [];
//   const personalDetails = employeeDetail?.personalDetails;

//   useEffect(() => {
//     if (personal) {
//       setPersonalForm({
//         employeeId: personal.employeeId,
//         fullName: personal.fullName,
//         registrationNo: personal.registrationNo || "No Registration No.",
//         qualification: personal.qualification,
//         experience: personal.experience || 0,
//         contactNumber: personal.contactNumber,
//         email: personal.email,
//         password: personal.password,
//         workingBranch: personal.workingBranch,
//         status: personal.status,
//         employeeType: (personal.employeeType || personal?.employmentType) || "",
//         employeePost: personal.employeePost ||"No Post",
//         joiningDate: personal.joiningDate?.slice(0, 10),
//         exitDate: personal.exitDate?.slice(0, 10),
//       });
//     }
//   }, [personal]);

//   const validateEmployee = () => {
//     const {
//       fullName,
//       qualification,
//       registrationNo,
//       experience,
//       contactNumber,
//       email,
//       password,
//       workingBranch,
//       status,
//       employeeType,
//       joiningDate,
//       exitDate,
//     } = personalForm;

//     if (
//       !fullName ||
//       !qualification ||
//       !registrationNo ||
//       !employeeType ||
//       !contactNumber ||
//       !email ||
//       !password ||
//       !workingBranch ||
//       !status ||
//       !joiningDate
//     ) {
//       alert("Please fill all required fields");
//       return false;
//     }

//     if (experience <= 0) {
//       alert("Experience cannot be negative");
//       return false;
//     }

//     if (!/^\d{10}$/.test(contactNumber)) {
//       alert("Contact number must be exactly 10 digits");
//       return false;
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       alert("Invalid email format");
//       return false;
//     }

//     if (
//       new Date(joiningDate).toISOString().slice(0, 10) >
//       new Date(exitDate).toISOString().slice(0, 10)
//     ) {
//       alert("Joining date cannot greater then exit date");
//       return false;
//     }

//     return true;
//   };

//   const handlePersonalChange = (e) => {
//     const { name, value } = e.target;

//     // Experience cannot be negative
//     if (name === "experience" && value <= 0) return;

//     // Contact number: only digits & max 10
//     if (name === "contactNumber") {
//       if (!/^\d*$/.test(value)) return;
//       if (value.length > 10) return;
//     }
//     if (name === "joiningDate") {
//       if (
//         new Date(value).toISOString().slice(0, 10) >
//         new Date(personalForm.exitDate).toISOString().slice(0, 10)
//       ) {
//         return;
//       }
//     }

//     setPersonalForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const savePersonalDetails = async () => {
//     setLoading(true);
//     if (!validateEmployee()) return;
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/employee/updateEmployee/${id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             token: localStorage.getItem("token"),
//           },
//           body: JSON.stringify(personalForm),
//         },
//       );

//       const result = await res.json();
//       if (result?.success) {
//         setEmployeeDetail(result?.employee);
//         setIsEditingPersonal(false);
//         setShowPassword(false);
//         fetchData();
//       }
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelEdit = () => {
//     if (personal) {
//       setPersonalForm({
//         employeeId: personal.employeeId,
//         fullName: personal.fullName,
//         registrationNo: personal.registrationNo,
//         qualification: personal.qualification,
//         experience: personal.experience || 0,
//         contactNumber: personal.contactNumber,
//         email: personal.email,
//         password: personal.password,
//         workingBranch: personal.workingBranch,
//         status: personal.status,
//         employeeType: personal.employeeType,
//         employeePost: personal.employeePost,
//         joiningDate: personal.joiningDate?.slice(0, 10),
//         exitDate: personal.exitDate?.slice(0, 10),
//       });
//       setShowPassword(false);
//     }
//     setIsEditingPersonal(false);
//   };

//   const handleDeleteEmployee = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/employee/deleteEmployee/${id}`,
//         {
//           method: "DELETE",
//           headers: {
//             "Content-Type": "application/json",
//             token: localStorage.getItem("webapptoken"),
//           },
//         },
//       );
//       const result = await response.json();
//       if (result?.success) {
//         alert(result?.message);
//         navigate("/");
//       } else alert(result.message);
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//   if (role !== "admin")
//     return (
//       <div className="p-4">You are not authorized to access this page</div>
//     );
//   if (!employeeDetail && loading) return <div className="p-4">Loading...</div>;
//   if (!employeeDetail && !loading)
//     return <div className="p-4">No employee Found</div>;
//   return (
//     <div className="p-6">
//       {/* ================= HEADER ================= */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-semibold text-gray-800">
//           Employee Details
//         </h1>

//         <button
//           onClick={handleDeleteEmployee}
//           className="flex items-center gap-2 text-red-600 hover:text-red-700"
//         >
//           {loading ? (
//             <div className="flex items-center justify-center">
//               <FaSpinner className="animate-spin mr-2" />
//             </div>
//           ) : (
//             <FaTrash />
//           )}

//           {/* <span className="text-sm font-medium">Delete Employee</span> */}
//         </button>
//       </div>

//       {/* ================= PERSONAL DETAILS ================= */}
//       <div className="bg-white border rounded-lg p-5 shadow-sm">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-700">
//             Personal Details
//           </h2>

//           {!isEditingPersonal ? (
//             <button
//               onClick={() => setIsEditingPersonal(true)}
//               className="text-blue-600 hover:underline flex items-center gap-1"
//             >
//               <FaEdit />
//             </button>
//           ) : (
//             <div className="flex gap-2">
//               <button
//                 onClick={handleCancelEdit}
//                 type="button"
//                 className="text-sm border px-3 py-1 rounded"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={savePersonalDetails}
//                 className="text-sm bg-green-600 text-white px-3 py-1 rounded"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     <span className="ml-2">Saving...</span>
//                   </div>
//                 ) : (
//                   "Save Employee"
//                 )}
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//           <Field label="Employee ID" value={personalForm.employeeId} disabled />
//           <Field label="Full Name" value={personalForm.fullName}  />
//           <Field
//             label="Registration No"
//             value={personalForm.registrationNo}
            
//           />
//           <Field
//             label="Qualification"
//             name="qualification"
//             value={personalForm.qualification}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//           />
//           <Field
//             label="Experience"
//             name="experience"
//             type="number"
//             value={personalForm.experience}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//             min={0}
//           />
//           <Field
//             label="Contact Number"
//             name="contactNumber"
//             value={personalForm.contactNumber}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//           />
//           <Field label="Email" value={personalForm.email}  />
//           <Field
//             label="Password"
//             name="password"
//             value={personalForm.password}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//             showPassword={showPassword}
//             setShowPassword={setShowPassword}
//           />

//           <Field
//             label="Working Branch"
//             name="workingBranch"
//             value={personalForm.workingBranch}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//           />
//           <SelectField
//             label="Status"
//             name="status"
//             value={personalForm.status}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//             options={["Active", "Inactive"]}
//           />
//           <SelectField
//             label="Employee Type"
//             name="employeeType"
//             value={personalForm.employeeType || personalForm.employmentType}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//             options={[
//               "Full Time",
//               "Part Time",
//               "Visiting Consultant",
//               "Home Visit Therapist",
//               "Intern / Trainee",
//             ]}
//           />
//           <SelectField
//             label="Employee Post"
//             name="employeePost"
//             value={personalForm.employeePost}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//             options={[
//               "Full Time",
//               "Part Time",
//               "Visiting Consultant",
//               "Home Visit Therapist",
//               "Intern / Trainee",
//             ]}
//           />
//           <Field
//             label="Joining Date"
//             name="joiningDate"
//             type="date"
//             value={personalForm.joiningDate}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//           />
//           <Field
//             label="Exit Date"
//             name="exitDate"
//             type="date"
//             value={personalForm.exitDate}
//             onChange={handlePersonalChange}
//             editable={isEditingPersonal}
//           />
//         </div>
//       </div>

//       {/* ================= PATIENT LOOK ================= */}
//       <div className="bg-white border rounded-lg p-5 shadow-sm mt-6">
//         <h2 className="text-lg font-semibold text-gray-700 mb-4">
//           Patient Look
//         </h2>

//         {patients.length === 0 ? (
//           <p className="text-sm text-gray-500">No patients assigned</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {patients.map((patient) => {
//               const p = patient.personalDetails;

//               return (
//                 <div
//                   key={patient._id}
//                   className="border rounded-lg p-4 flex flex-col justify-between hover:shadow transition"
//                 >
//                   {/* Patient Info */}
//                   <div className="space-y-1 text-sm">
//                     <p className="font-semibold text-gray-800">{p.name}</p>
//                     <p className="text-gray-600">
//                       {p.age} yrs • {p.gender}
//                     </p>
//                     <p className="text-gray-600">
//                       Patient ID:{" "}
//                       <span className="font-medium">{p.patientId}</span>
//                     </p>
//                     <p className="text-gray-500 truncate">
//                       Complaint: {p.chiefComplaint || "-"}
//                     </p>
//                   </div>

//                   {/* Action */}
//                   <button
//                     onClick={() => navigate(`/PatientDetails/${patient._id}`)}
//                     className="mt-3 text-sm text-blue-600 hover:underline self-start"
//                   >
//                     View Details →
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* ================= Attendance ================= */}
//       <AttendanceSection attendance={attendance} personalDetails={personalDetails} id={id} />
//     </div>
//   );
// };

// export default EmployeeDetails;

// const Field = ({
//   label,
//   value,
//   name,
//   editable,
//   disabled,
//   onChange,
//   type = "text",
//   min,
//   showPassword,
//   setShowPassword,
// }) => {
//   const formatDate = (date) => {
//     if (!date) return "DD/MM/YYYY";
//     return new Date(date).toLocaleDateString("en-GB");
//   };

//   const isPassword = label === "Password";

//   return (
//     <div className="flex flex-col relative">
//       <span className="text-xs text-gray-500">{label}</span>

//       {/* ================= EDIT MODE ================= */}
//       {editable && !disabled ? (
//         <div className="relative">
//           <input
//             type={isPassword ? (showPassword ? "text" : "password") : type}
//             name={name}
//             value={value ?? ""}
//             onChange={onChange}
//             min={min}
//             onWheel={(e) => e.target.blur()}
//             className="border rounded px-3 py-2 text-sm w-full pr-10"
//           />

//           {/* Eye Icon for password */}
//           {isPassword && (
//             <span
//               onClick={() => setShowPassword((prev) => !prev)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
//             >
//               {showPassword ? <FaEyeSlash /> : <FaEye />}
//             </span>
//           )}
//         </div>
//       ) : (
//         /* ================= VIEW MODE ================= */
//         <span className="font-medium text-gray-800 flex items-center gap-2">
//           {isPassword
//             ? showPassword
//               ? value ?? "-"
//               : "********"
//             : label === "Joining Date" || label === "Exit Date"
//               ? formatDate(value)
//               : value ?? "-"}

//           {label === "Experience" && " Years"}

//           {isPassword && (
//             <span
//               onClick={() => setShowPassword((prev) => !prev)}
//               className="cursor-pointer text-gray-500"
//             >
//               {showPassword ? <FaEyeSlash /> : <FaEye />}
//             </span>
//           )}
//         </span>
//       )}
//     </div>
//   );
// };

// const SelectField = ({ label, name, value, options, editable, onChange }) => (
//   <div className="flex flex-col">
//     <span className="text-xs text-gray-500">{label}</span>

//     {editable ? (
//       <select
//         name={name}
//         value={value}
//         onChange={onChange}
//         className="border rounded px-3 py-2 text-sm"
//       >
//         {options.map((opt) => (
//           <option key={opt} value={opt}>
//             {opt}
//           </option>
//         ))}
//       </select>
//     ) : (
//       <span className="font-medium text-gray-800">{value || "-"}</span>
//     )}
//   </div>
// );


import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaTrash,
  FaEdit,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaCamera,
  FaCopy,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import AttendanceSection from "./employeePersonalDetails/AttendanceSection";

/* ------------------------------------------------------------------ */
/* Access control                                                      */
/*                                                                     */
/* - The page itself is still admin-only (unchanged).                  */
/* - The "Confidential details" block (photo, father's name, DOB,      */
/*   gender, addresses, alternate contact, government ID, bank         */
/*   details, duty schedule, salary) is shown only to the people       */
/*   listed in VITE_SENSITIVE_ACCESS_EMAILS (comma-separated).         */
/*   If that variable is not set, only VITE_ADMIN_EMAIL can see it.    */
/*                                                                     */
/* IMPORTANT: this only hides the data in the UI. The backend must     */
/* also leave these fields out of the API response for everyone else.  */
/* ------------------------------------------------------------------ */
const getAccess = () => {
  try {
    const data = JSON.parse(localStorage.getItem("loginEmployeeData"));
    const email = data?.personalDetails?.email?.trim().toLowerCase();
    const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();
    const allowed = (
      import.meta.env.VITE_SENSITIVE_ACCESS_EMAILS ||
      import.meta.env.VITE_ADMIN_EMAIL ||
      ""
    )
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    return {
      role: email && email === adminEmail ? "admin" : "employee",
      canViewSensitive: !!email && allowed.includes(email),
    };
  } catch {
    return { role: "employee", canViewSensitive: false };
  }
};

/* ------------------------------------------------------------------ */
/* Constants and helpers                                               */
/* ------------------------------------------------------------------ */
const GENDERS = ["Male", "Female", "Other"];
const ID_TYPES = ["Aadhaar", "PAN", "Voter ID", "Driving Licence", "Passport"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_PHOTO_PX = 400;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const FIELD =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 disabled:bg-slate-50";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-GB") : "-";

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${
    h >= 12 ? "PM" : "AM"
  }`;
};

const formatMoney = (v) =>
  v === "" || v === null || v === undefined
    ? "-"
    : `₹${Number(v).toLocaleString("en-IN")}`;

const maskTail = (v) =>
  String(v).length > 4 ? `•••• ${String(v).slice(-4)}` : "••••";

const buildForm = (p, canView) => ({
  employeeId: p.employeeId,
  fullName: p.fullName,
  registrationNo: p.registrationNo || "No Registration No.",
  qualification: p.qualification,
  experience: p.experience || 0,
  contactNumber: p.contactNumber,
  email: p.email,
  password: p.password,
  workingBranch: p.workingBranch,
  status: p.status,
  employeeType: p.employeeType || p.employmentType || "",
  employeePost:
    p.employeePost && p.employeePost !== "No Post" ? p.employeePost : "",
  joiningDate: p.joiningDate?.slice(0, 10),
  exitDate: p.exitDate?.slice(0, 10),
  // Confidential fields are only loaded into state for permitted viewers.
  ...(canView
    ? {
        photo: p.photo || "",
        fatherName: p.fatherName || "",
        dateOfBirth: p.dateOfBirth?.slice(0, 10) || "",
        gender: p.gender || "",
        alternateContactNumber: p.alternateContactNumber || "",
        permanentAddress: p.permanentAddress || "",
        temporaryAddress: p.temporaryAddress || "",
        governmentIdType: p.governmentIdType || "Aadhaar",
        governmentIdNumber: p.governmentIdNumber || "",
        bankName: p.bankName || "",
        accountNumber: p.accountNumber || "",
        ifscCode: p.ifscCode || "",
        payeeName: p.payeeName || "",
        dutyStartTime: p.dutyStartTime || "",
        dutyEndTime: p.dutyEndTime || "",
        dutyDays: Array.isArray(p.dutyDays) ? p.dutyDays : [],
        salary:
          p.salary === undefined || p.salary === null ? "" : String(p.salary),
      }
    : {}),
});

// Resize to max 400px and re-encode as JPEG so the JSON body stays small.
const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("This is not a valid image."));
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_PX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [{ role, canViewSensitive }] = useState(getAccess);

  const [employeeDetail, setEmployeeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({});
  const [toast, setToast] = useState(null); // { type: "success" | "error", text }

  // Double-Lock Password Reveal States
  const [revealedPassword, setRevealedPassword] = useState(null);
  const [showDoubleLockModal, setShowDoubleLockModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [showAdminPasswordInput, setShowAdminPasswordInput] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Auto-hide countdown timer for revealed password (30s)
  useEffect(() => {
    if (!revealedPassword || countdown <= 0) return undefined;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRevealedPassword(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [revealedPassword, countdown]);

  const handleCopyPassword = () => {
    if (!revealedPassword) return;
    navigator.clipboard.writeText(revealedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevealSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!adminPasswordInput.trim()) {
      setAdminPasswordError("Please enter your admin password.");
      return;
    }

    setVerifyingPassword(true);
    setAdminPasswordError("");

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("webapptoken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/revealPassword/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token,
          },
          body: JSON.stringify({ adminPassword: adminPasswordInput }),
        },
      );

      const data = await res.json();
      if (res.ok && data?.success) {
        if (data.isHashedOnly) {
          setShowDoubleLockModal(false);
          setAdminPasswordInput("");
          setToast({
            type: "error",
            text:
              data.message ||
              "Password is an older one-way hash and cannot be decoded. Please click 'Edit details' to set a new password.",
          });
        } else {
          setRevealedPassword(data.password);
          setCountdown(30);
          setShowDoubleLockModal(false);
          setAdminPasswordInput("");
          setToast({
            type: "success",
            text: "Password revealed. It will automatically hide in 30 seconds.",
          });
        }
      } else {
        setAdminPasswordError(data?.message || "Incorrect admin password.");
      }
    } catch (err) {
      console.error("Error revealing password:", err);
      setAdminPasswordError("Network or server error. Please try again.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/employee/getEmployeeById/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            token:
              localStorage.getItem("token") ||
              localStorage.getItem("webapptoken"),
          },
        },
      );

      const result = await response.json();
      if (result?.success) {
        setEmployeeDetail(result?.employee);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const personal = employeeDetail?.personalDetails;
  const patients = employeeDetail?.patientLook?.patientId || [];
  const attendance = employeeDetail?.attendance || [];
  const personalDetails = employeeDetail?.personalDetails;

  useEffect(() => {
    if (personal) setPersonalForm(buildForm(personal, canViewSensitive));
  }, [personal, canViewSensitive]);

  /* ---------------- Validation ---------------- */
  // Returns an error message, or "" when everything is valid.
  const validateEmployee = () => {
    const f = personalForm;

    if (
      !f.fullName ||
      !f.qualification ||
      !f.registrationNo ||
      !f.employeeType ||
      !f.contactNumber ||
      !f.email ||
      !f.workingBranch ||
      !f.status ||
      !f.joiningDate
    ) {
      return "Please fill all required fields.";
    }

    if (Number(f.experience) < 0) return "Experience cannot be negative.";

    if (!/^\d{10}$/.test(f.contactNumber))
      return "Contact number must be exactly 10 digits.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      return "Invalid email format.";

    if (f.exitDate && f.joiningDate > f.exitDate)
      return "Joining date cannot be later than the exit date.";

    if (!canViewSensitive) return "";

    const today = new Date().toISOString().slice(0, 10);
    if (f.dateOfBirth && f.dateOfBirth > today)
      return "Date of birth cannot be in the future.";

    if (f.alternateContactNumber && !/^\d{10}$/.test(f.alternateContactNumber))
      return "Alternate contact number must be exactly 10 digits.";

    if (f.governmentIdNumber) {
      const n = f.governmentIdNumber;
      if (f.governmentIdType === "Aadhaar" && !/^\d{12}$/.test(n))
        return "Aadhaar number must be exactly 12 digits.";
      if (f.governmentIdType === "PAN" && !/^[A-Z]{5}\d{4}[A-Z]$/.test(n))
        return "PAN must look like ABCDE1234F.";
      if (
        f.governmentIdType !== "Aadhaar" &&
        f.governmentIdType !== "PAN" &&
        n.length < 5
      )
        return "Government ID number looks too short.";
    }

    const bankFields = [f.bankName, f.accountNumber, f.ifscCode, f.payeeName];
    if (bankFields.some(Boolean) && !bankFields.every(Boolean))
      return "Complete all four bank details, or leave them all empty.";
    if (f.accountNumber && !/^\d{9,18}$/.test(f.accountNumber))
      return "Account number must be 9 to 18 digits.";
    if (f.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(f.ifscCode))
      return "IFSC code must look like SBIN0001234.";

    if (Boolean(f.dutyStartTime) !== Boolean(f.dutyEndTime))
      return "Enter both the duty start time and end time.";

    if (f.salary !== "" && Number(f.salary) < 0)
      return "Salary cannot be negative.";

    return "";
  };

  /* ---------------- Handlers ---------------- */
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    let next = value;

    if (name === "experience" && Number(value) < 0) return;

    if (name === "contactNumber" || name === "alternateContactNumber") {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }

    if (name === "joiningDate" && personalForm.exitDate && value > personalForm.exitDate) {
      return;
    }

    if (name === "governmentIdNumber") {
      if (personalForm.governmentIdType === "Aadhaar") {
        next = value.replace(/\D/g, "").slice(0, 12);
      } else if (personalForm.governmentIdType === "PAN") {
        next = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
      } else {
        next = value.toUpperCase().slice(0, 20);
      }
    }

    if (name === "accountNumber") next = value.replace(/\D/g, "").slice(0, 18);

    if (name === "ifscCode")
      next = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 11);

    if (name === "salary" && !/^\d*\.?\d{0,2}$/.test(value)) return;

    setPersonalForm((prev) => ({ ...prev, [name]: next }));
  };

  const toggleDutyDay = (day) =>
    setPersonalForm((prev) => {
      const days = prev.dutyDays || [];
      return {
        ...prev,
        dutyDays: days.includes(day)
          ? days.filter((d) => d !== day)
          : DAYS.filter((d) => d === day || days.includes(d)),
      };
    });

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setToast({ type: "error", text: "Please choose an image file." });
    if (file.size > MAX_PHOTO_BYTES)
      return setToast({ type: "error", text: "Photo must be smaller than 5 MB." });
    try {
      const dataUrl = await resizeImage(file);
      setPersonalForm((prev) => ({ ...prev, photo: dataUrl }));
    } catch (err) {
      setToast({ type: "error", text: err.message });
    }
  };

  const savePersonalDetails = async () => {
    const problem = validateEmployee();
    if (problem) return setToast({ type: "error", text: problem });

    setSaving(true);
    try {
      const payload = {
        ...personalForm,
        employeePost: (personalForm.employeePost || "").trim() || "No Post",
      };
      if (canViewSensitive) {
        payload.salary =
          personalForm.salary === "" ? undefined : Number(personalForm.salary);
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/updateEmployee/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token:
              localStorage.getItem("token") ||
              localStorage.getItem("webapptoken"),
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await res.json();
      if (result?.success) {
        setEmployeeDetail(result?.employee);
        setIsEditingPersonal(false);
        if (personalForm.password) {
          setRevealedPassword(personalForm.password);
          setCountdown(30);
        }
        setToast({ type: "success", text: "Employee details saved." });
        fetchData();
      } else {
        setToast({
          type: "error",
          text: result?.message || "Could not save the employee.",
        });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", text: err.message || "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (personal) setPersonalForm(buildForm(personal, canViewSensitive));
    setIsEditingPersonal(false);
  };

  const handleDeleteEmployee = async () => {
    if (!window.confirm("Move this employee to the recycle bin? The owner can restore or permanently delete it."))
      return;
    setDeleting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/deleteEmployee/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("webapptoken"),
          },
        },
      );
      const result = await response.json();
      if (result?.success) {
        alert(result?.message);
        navigate("/");
      } else alert(result.message);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- Guards ---------------- */
  if (role !== "admin")
    return (
      <div className="p-6 text-sm text-slate-600">
        You are not authorized to access this page.
      </div>
    );
  if (!employeeDetail && loading)
    return <div className="p-6 text-sm text-slate-500">Loading...</div>;
  if (!employeeDetail && !loading)
    return <div className="p-6 text-sm text-slate-500">No employee found.</div>;

  const editing = isEditingPersonal;
  const f = personalForm;
  const initial = (f.fullName || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-6 p-6">
      {/* ================= TOAST ================= */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-6 top-6 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {canViewSensitive && f.photo ? (
            <img
              src={f.photo}
              alt={`${f.fullName || "Employee"} photo`}
              className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-cyan-50 text-2xl font-semibold text-cyan-800 ring-1 ring-cyan-100">
              {initial}
            </span>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {f.fullName || "Employee details"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {f.employeeId}
              {f.employeePost && f.employeePost !== "No Post"
                ? `, ${f.employeePost}`
                : ""}
              <span
                className={`ml-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  f.status === "Active"
                    ? "bg-emerald-50 text-emerald-800 ring-emerald-600/15"
                    : "bg-slate-100 text-slate-600 ring-slate-500/20"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    f.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {f.status || "-"}
              </span>
            </p>
            {editing && canViewSensitive && (
              <div className="mt-2 flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-within:ring-4 focus-within:ring-blue-600/20">
                  <FaCamera />
                  {f.photo ? "Change photo" : "Add photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>
                {f.photo && (
                  <button
                    type="button"
                    onClick={() => setPersonalForm((p) => ({ ...p, photo: "" }))}
                    className="text-xs font-medium text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button onClick={() => setIsEditingPersonal(true)} className={BTN_OUTLINE}>
                <FaEdit />
                Edit details
              </button>
              <button
                onClick={handleDeleteEmployee}
                disabled={deleting}
                aria-label="Delete employee"
                title="Delete employee"
                className="rounded-lg border border-slate-200 bg-white p-2.5 text-rose-600 shadow-sm transition hover:bg-rose-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20 disabled:opacity-60"
              >
                {deleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleCancelEdit} className={BTN_OUTLINE}>
                Cancel
              </button>
              <button onClick={savePersonalDetails} disabled={saving} className={BTN_PRIMARY}>
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= PERSONAL DETAILS ================= */}
      <Card title="Personal details">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Employee ID" value={f.employeeId} disabled />
          <Field label="Full name" value={f.fullName} />
          <Field label="Registration no." value={f.registrationNo} />
          <Field
            label="Qualification"
            name="qualification"
            value={f.qualification}
            onChange={handlePersonalChange}
            editable={editing}
          />
          <Field
            label="Experience"
            name="experience"
            type="number"
            min={0}
            value={f.experience}
            display={`${f.experience ?? 0} years`}
            onChange={handlePersonalChange}
            editable={editing}
          />
          <Field
            label="Contact number"
            name="contactNumber"
            value={f.contactNumber}
            onChange={handlePersonalChange}
            editable={editing}
          />
          <Field label="Email" value={f.email} />

          {/* Password (Confidential Double-Lock Reveal in View Mode / Protected Input in Edit Mode) */}
          <div className="flex flex-col">
            <span className="mb-1 text-xs text-slate-500">Password</span>
            {editing ? (
              <div className="relative">
                <input
                  type={showEditPassword ? "text" : "password"}
                  name="password"
                  value={f.password ?? ""}
                  onChange={handlePersonalChange}
                  placeholder="Leave blank to keep current"
                  autoComplete="new-password"
                  className={`${FIELD} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword((prev) => !prev)}
                  aria-label={showEditPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showEditPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {revealedPassword ? (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50/90 px-3 py-1.5 text-emerald-950 shadow-xs">
                    <span className="font-mono text-sm font-bold tracking-wider">
                      {revealedPassword}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1 text-slate-500 hover:text-blue-700 transition rounded"
                      title="Copy password"
                    >
                      {copied ? (
                        <FaCheck className="text-emerald-600 text-xs" />
                      ) : (
                        <FaCopy className="text-xs" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevealedPassword(null)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                      title="Hide password"
                    >
                      <FaEyeSlash className="text-xs" />
                    </button>
                    {countdown > 0 && (
                      <span className="border-l border-emerald-200 pl-2 text-[10px] font-mono font-medium text-emerald-700">
                        {countdown}s
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2.5">
                    <span className="text-sm font-extrabold tracking-widest text-slate-400 select-none">
                      ••••••••
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminPasswordInput("");
                        setAdminPasswordError("");
                        setShowDoubleLockModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-100 hover:border-blue-300 transition active:scale-95"
                      title="Requires Admin Password Verification"
                    >
                      <FaLock className="text-[10px]" />
                      <span>Reveal</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <Field
            label="Working branch"
            name="workingBranch"
            value={f.workingBranch}
            onChange={handlePersonalChange}
            editable={editing}
          />
          <SelectField
            label="Status"
            name="status"
            value={f.status}
            onChange={handlePersonalChange}
            editable={editing}
            options={["Active", "Inactive"]}
          />
          <SelectField
            label="Employee type"
            name="employeeType"
            value={f.employeeType || f.employmentType}
            onChange={handlePersonalChange}
            editable={editing}
            options={[
              "Full Time",
              "Part Time",
              "Visiting Consultant",
              "Home Visit Therapist",
              "Intern / Trainee",
            ]}
          />
          <Field
            label="Employee post"
            name="employeePost"
            value={f.employeePost}
            onChange={handlePersonalChange}
            editable={editing}
            placeholder="e.g. Senior Physiotherapist"
            maxLength={60}
          />
          <Field
            label="Joining date"
            name="joiningDate"
            type="date"
            value={f.joiningDate}
            display={formatDate(f.joiningDate)}
            onChange={handlePersonalChange}
            editable={editing}
          />
          <Field
            label="Exit date"
            name="exitDate"
            type="date"
            value={f.exitDate}
            display={formatDate(f.exitDate)}
            onChange={handlePersonalChange}
            editable={editing}
          />
        </div>
      </Card>

      {/* ================= CONFIDENTIAL DETAILS ================= */}
      {canViewSensitive ? (
        <Card
          title="Confidential details"
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
              <FaLock size={10} />
              Restricted access
            </span>
          }
          description="Only you and other selected people can see this section."
        >
          <div className="space-y-8">
            {/* ---- Personal and contact ---- */}
            <Group title="Personal and contact">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field
                  label="Father's name"
                  name="fatherName"
                  value={f.fatherName}
                  onChange={handlePersonalChange}
                  editable={editing}
                />
                <Field
                  label="Date of birth"
                  name="dateOfBirth"
                  type="date"
                  value={f.dateOfBirth}
                  display={formatDate(f.dateOfBirth)}
                  onChange={handlePersonalChange}
                  editable={editing}
                />
                <SelectField
                  label="Gender"
                  name="gender"
                  value={f.gender}
                  onChange={handlePersonalChange}
                  editable={editing}
                  options={GENDERS}
                  placeholder="Select gender"
                />
                <Field
                  label="Alternate contact number"
                  name="alternateContactNumber"
                  value={f.alternateContactNumber}
                  onChange={handlePersonalChange}
                  editable={editing}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <TextAreaField
                  label="Permanent address"
                  name="permanentAddress"
                  value={f.permanentAddress}
                  onChange={handlePersonalChange}
                  editable={editing}
                />
                <TextAreaField
                  label="Temporary address"
                  name="temporaryAddress"
                  value={f.temporaryAddress}
                  onChange={handlePersonalChange}
                  editable={editing}
                  action={
                    editing && (
                      <button
                        type="button"
                        onClick={() =>
                          setPersonalForm((p) => ({
                            ...p,
                            temporaryAddress: p.permanentAddress,
                          }))
                        }
                        className="text-xs font-medium text-blue-800 hover:underline"
                      >
                        Same as permanent
                      </button>
                    )
                  }
                />
              </div>
            </Group>

            {/* ---- Government ID ---- */}
            <Group title="Government ID">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  label="ID type"
                  name="governmentIdType"
                  value={f.governmentIdType}
                  onChange={handlePersonalChange}
                  editable={editing}
                  options={ID_TYPES}
                />
                <Field
                  label="ID number"
                  name="governmentIdNumber"
                  value={f.governmentIdNumber}
                  onChange={handlePersonalChange}
                  editable={editing}
                  secret
                  maskValue={maskTail}
                />
              </div>
            </Group>

            {/* ---- Bank details ---- */}
            <Group title="Bank details">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Bank name"
                  name="bankName"
                  value={f.bankName}
                  onChange={handlePersonalChange}
                  editable={editing}
                />
                <Field
                  label="Account number"
                  name="accountNumber"
                  value={f.accountNumber}
                  onChange={handlePersonalChange}
                  editable={editing}
                  secret
                  maskValue={maskTail}
                />
                <Field
                  label="IFSC code"
                  name="ifscCode"
                  value={f.ifscCode}
                  onChange={handlePersonalChange}
                  editable={editing}
                  placeholder="SBIN0001234"
                />
                <Field
                  label="Payee name"
                  name="payeeName"
                  value={f.payeeName}
                  onChange={handlePersonalChange}
                  editable={editing}
                />
              </div>
            </Group>

            {/* ---- Duty schedule ---- */}
            <Group title="Duty schedule">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Duty start time"
                  name="dutyStartTime"
                  type="time"
                  value={f.dutyStartTime}
                  display={formatTime(f.dutyStartTime) || "-"}
                  onChange={handlePersonalChange}
                  editable={editing}
                />
                <Field
                  label="Duty end time"
                  name="dutyEndTime"
                  type="time"
                  value={f.dutyEndTime}
                  display={formatTime(f.dutyEndTime) || "-"}
                  onChange={handlePersonalChange}
                  editable={editing}
                />
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-500">Duty days</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {editing ? (
                      DAYS.map((day) => {
                        const on = (f.dutyDays || []).includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggleDutyDay(day)}
                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 ${
                              on
                                ? "border-blue-800 bg-blue-800 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })
                    ) : (f.dutyDays || []).length === 0 ? (
                      <span className="text-sm font-medium text-slate-900">-</span>
                    ) : (
                      (f.dutyDays || []).map((day) => (
                        <span
                          key={day}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 ring-1 ring-inset ring-blue-100"
                        >
                          {day}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Group>

            {/* ---- Salary ---- */}
            <Group title="Salary">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Monthly salary (₹)"
                  name="salary"
                  value={f.salary}
                  display={formatMoney(f.salary)}
                  onChange={handlePersonalChange}
                  editable={editing}
                  inputMode="decimal"
                  placeholder="0"
                />
              </div>
            </Group>
          </div>
        </Card>
      ) : (
        <section className="flex items-start gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
            <FaLock />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Confidential details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Photo, personal and contact details, government ID, bank details,
              duty schedule and salary are restricted to selected people.
            </p>
          </div>
        </section>
      )}

      {/* ================= PATIENT LOOK ================= */}
      <Card title="Patient look">
        {patients.length === 0 ? (
          <p className="text-sm text-slate-500">No patients assigned.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => {
              const p = patient.personalDetails;

              return (
                <div
                  key={patient._id}
                  className="flex flex-col justify-between rounded-lg border border-slate-200 p-4 transition hover:shadow-sm"
                >
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <p className="text-slate-600">
                      {p.age} yrs, {p.gender}
                    </p>
                    <p className="text-slate-600">
                      Patient ID:{" "}
                      <span className="font-medium">{p.patientId}</span>
                    </p>
                    <p className="truncate text-slate-500">
                      Complaint: {p.chiefComplaint || "-"}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/PatientDetails/${patient._id}`)}
                    className="mt-3 self-start text-sm font-medium text-blue-800 hover:underline"
                  >
                    View details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ================= ATTENDANCE ================= */}
      <AttendanceSection
        attendance={attendance}
        personalDetails={personalDetails}
        id={id}
      />

      {/* ================= DOUBLE-LOCK ADMIN PASSWORD MODAL ================= */}
      {showDoubleLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
                  <FaLock />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Admin Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Confidential Credential Access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDoubleLockModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRevealSubmit} className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                To view the password for{" "}
                <strong className="text-slate-900 font-semibold">
                  {f.fullName || "this employee"}
                </strong>
                , please enter your Admin password to confirm authorization.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPasswordInput ? "text" : "password"}
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminPasswordError("");
                    }}
                    placeholder="Enter your admin password"
                    autoFocus
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowAdminPasswordInput(!showAdminPasswordInput)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-sm"
                  >
                    {showAdminPasswordInput ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {adminPasswordError && (
                  <p className="mt-2 text-xs text-rose-600 font-medium">
                    {adminPasswordError}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDoubleLockModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  disabled={verifyingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingPassword || !adminPasswordInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition disabled:opacity-50"
                >
                  {verifyingPassword ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <FaLock className="text-xs" />
                      <span>Verify & Reveal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;

/* ------------------------------------------------------------------ */
/* Presentational pieces                                               */
/* ------------------------------------------------------------------ */
const Card = ({ title, description, badge, children }) => (
  <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {badge}
    </header>
    <div className="px-6 py-5">{children}</div>
  </section>
);

const Group = ({ title, children }) => (
  <div>
    <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold text-slate-700">
      {title}
    </h3>
    {children}
  </div>
);

const Field = ({
  label,
  value,
  name,
  editable,
  disabled,
  onChange,
  type = "text",
  min,
  placeholder,
  inputMode,
  maxLength,
  display, // text shown in view mode instead of the raw value
  secret, // masked in view mode, with an eye icon to reveal
  hideWhileEditing, // also hide the characters in the input (passwords)
  maskValue, // custom mask, e.g. show the last 4 characters only
}) => {
  const [reveal, setReveal] = useState(false);
  const empty = value === undefined || value === null || value === "";

  const eye = secret && !empty && (
    <button
      type="button"
      onClick={() => setReveal((r) => !r)}
      aria-label={reveal ? `Hide ${label}` : `Show ${label}`}
      className="text-slate-400 transition hover:text-slate-700"
    >
      {reveal ? <FaEyeSlash /> : <FaEye />}
    </button>
  );

  let shown;
  if (empty) shown = display && !secret ? display : "-";
  else if (secret && !reveal) shown = maskValue ? maskValue(value) : "••••••••";
  else shown = display ?? value;

  return (
    <div className="flex flex-col">
      <span className="mb-1 text-xs text-slate-500">{label}</span>

      {editable && !disabled ? (
        <div className="relative">
          <input
            type={secret && hideWhileEditing && !reveal ? "password" : type}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            min={min}
            placeholder={placeholder}
            inputMode={inputMode}
            maxLength={maxLength}
            autoComplete="off"
            onWheel={(e) => e.target.blur()}
            className={`${FIELD} ${secret ? "pr-10" : ""}`}
          />
          {secret && hideWhileEditing && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                aria-label={reveal ? `Hide ${label}` : `Show ${label}`}
                className="text-slate-400 transition hover:text-slate-700"
              >
                {reveal ? <FaEyeSlash /> : <FaEye />}
              </button>
            </span>
          )}
        </div>
      ) : (
        <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <span className="break-words tabular-nums">{shown}</span>
          {eye}
        </span>
      )}
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  options,
  editable,
  onChange,
  placeholder,
}) => (
  <div className="flex flex-col">
    <span className="mb-1 text-xs text-slate-500">{label}</span>

    {editable ? (
      <select name={name} value={value ?? ""} onChange={onChange} className={FIELD}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <span className="text-sm font-medium text-slate-900">{value || "-"}</span>
    )}
  </div>
);

const TextAreaField = ({ label, name, value, editable, onChange, action }) => (
  <div className="flex flex-col">
    <div className="mb-1 flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      {action}
    </div>

    {editable ? (
      <textarea
        name={name}
        rows={3}
        value={value ?? ""}
        onChange={onChange}
        className={FIELD}
      />
    ) : (
      <span className="whitespace-pre-line break-words text-sm font-medium text-slate-900">
        {value || "-"}
      </span>
    )}
  </div>
);
