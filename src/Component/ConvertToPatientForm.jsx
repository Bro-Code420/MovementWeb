// import React, { useEffect, useState } from "react";

// const ConvertToPatientForm = ({ selectedEnquiry, onClose, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     age: "",
//     gender: "",
//     contactNumber: "",
//     address: "",
//     chiefComplaint: "",
//     enquiryStatus: "patient",
//     remark: "",
//     response: "",
//     source: "",
//   });

//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (selectedEnquiry) {
//       setFormData({
//         name: selectedEnquiry.patientName || "",
//         age: selectedEnquiry.age || "",
//         gender: selectedEnquiry.gender || "",
//         contactNumber: selectedEnquiry.contactNumber || "",
//         address: "",
//         chiefComplaint: selectedEnquiry.chiefComplaint || "",
//         enquiryStatus: "patient",
//         remark: selectedEnquiry?.remark || "",
//       });
//     }
//   }, [selectedEnquiry]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     const {
//       name,
//       age,
//       gender,
//       contactNumber,
//       address,
//       chiefComplaint,
//       enquiryStatus,
//       remark,
//       response,
//       source,
//     } = formData;

//     if (
//       !name ||
//       !gender ||
//       !age ||
//       !contactNumber ||
//       !chiefComplaint ||
//       !address ||
//       !enquiryStatus ||
//       !remark ||
//       !response ||
//       !source
//     ) {
//       alert("Please fill all required fields");
//       return false;
//     }

//     if (age <= 0 || age > 120) {
//       alert("Invalid age");
//       return false;
//     }

//     if (!/^[0-9]{10}$/.test(contactNumber)) {
//       alert("Invalid contact number");
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (!validateForm()) {
//       setLoading(false);
//       return;
//     };

//     onSubmit(formData);
//     setLoading(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 h-[600px] overflow-y-auto">
//         <h2 className="text-xl font-semibold mb-4">Convert Lead to Patient</h2>

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div className="grid grid-cols-2 gap-6">
//             <Input
//               label="Name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//             />
//             <Input
//               label="Age"
//               name="age"
//               value={formData.age}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-6">
//             <Select
//               label="Gender"
//               value={formData.gender}
//               name="gender"
//               onChange={handleChange}
//               options={["Male", "Female", "Other"]}
//             />
//             <Input
//               label="Phone Number"
//               name="contactNumber"
//               value={formData.contactNumber}
//               onChange={handleChange}
//               maxLength={10}
//             />
//           </div>

//           {/* ONLY EDITABLE FIELD */}
//           <Textarea
//             label="Address"
//             name="address"
//             value={formData.address}
//             onChange={handleChange}
//           />

//           <Textarea
//             label="Chief Complaint"
//             name="chiefComplaint"
//             value={formData.chiefComplaint}
//             onChange={handleChange}
//           />

//           <Input label="Status" value="Patient" readOnly />

//           <Textarea
//             label="Remark"
//             name="remark"
//             value={formData.remark}
//             onChange={handleChange}
//           />
//           <div className="flex items-center justify-between gap-3">
//             <FormField
//               label="Response"
//               name="response"
//               type="select"
//               options={["Pending", "Done", "Deny"]}
//               value={formData.response}
//               onChange={handleChange}
//               required={true}
//             />
//             <FormField
//               label="Source"
//               name="source"
//               type="select"
//               options={["Walk-in", "Phone", "Referral", "Online"]}
//               value={formData.source}
//               onChange={handleChange}
//               required={true}
//             />
//           </div>

//           <div className="flex justify-end gap-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-300 rounded"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 bg-green-600 text-white rounded"
//             >
//               {loading ? "Converting..." : "Convert to Patient"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// /* -------------------- INPUT COMPONENTS -------------------- */

// const Input = ({ label, maxLength, readOnly, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium mb-1">
//       {label} <span className="text-red-500">*</span>
//     </label>
//     <input
//       {...props}
//       readOnly={readOnly}
//       maxLength={maxLength}
//       className={`w-full border rounded-md p-2 ${
//         readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"
//       }`}
//     />
//   </div>
// );

// const Select = ({ label, options, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium mb-1">
//       {label} <span className="text-red-500">*</span>
//     </label>
//     <select {...props} className="w-full border rounded-md p-2 bg-white">
//       <option value="">Select</option>
//       {options.map((opt) => (
//         <option key={opt} value={opt}>
//           {opt}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// const Textarea = ({ label, readOnly, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium mb-1">
//       {label} <span className="text-red-500">*</span>
//     </label>
//     <textarea
//       {...props}
//       readOnly={readOnly}
//       rows="1"
//       className={`w-full border rounded-md p-2 ${
//         readOnly ? "bg-gray-100 cursor-not-allowed" : ""
//       }`}
//     />
//   </div>
// );

// const FormField = ({
//   label,
//   required,
//   name,
//   value,
//   onChange,
//   type = "text",
//   options = [],
//   maxLength,
//   min,
// }) => (
//   <div className="w-full">
//     <label className="block mb-1 flex gap-2 items-center">
//       {label}
//       {required && <p className="text-red-600">*</p>}
//     </label>
//     {type === "select" ? (
//       <select
//         name={name}
//         value={value}
//         onChange={onChange}
//         className="w-full border p-2 rounded"
//       >
//         <option value="">Select</option>
//         {options.map((o) => (
//           <option key={o}>{o}</option>
//         ))}
//       </select>
//     ) : (
//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         className="w-full border p-2 rounded"
//         maxLength={maxLength}
//         min={min}
//       />
//     )}
//   </div>
// );

// export default ConvertToPatientForm;



// import React, { useEffect, useState } from "react";
// import {
//   FaTimes,
//   FaSpinner,
//   FaGlobe,
//   FaWhatsapp,
//   FaInstagram,
//   FaUserFriends,
// } from "react-icons/fa";

// /* ------------------------------------------------------------------ */
// /* Options                                                             */
// /* ------------------------------------------------------------------ */
// const GENDERS = ["Male", "Female", "Other"];
// const SOURCES = ["Walk-in", "Phone", "Referral", "Online"];

// const RESPONSES = [
//   {
//     value: "Pending",
//     active: "border-amber-300 bg-amber-50 text-amber-800",
//   },
//   {
//     value: "Done",
//     active: "border-emerald-300 bg-emerald-50 text-emerald-800",
//   },
//   {
//     value: "Deny",
//     active: "border-rose-300 bg-rose-50 text-rose-800",
//   },
// ];

// // "Person" means someone referred the patient; the admin types that name.
// const REFERRED_BY = [
//   { value: "Online", icon: <FaGlobe /> },
//   { value: "WhatsApp", icon: <FaWhatsapp /> },
//   { value: "Instagram", icon: <FaInstagram /> },
//   { value: "Person", icon: <FaUserFriends /> },
// ];

// const EMPTY_FORM = {
//   name: "",
//   age: "",
//   gender: "",
//   contactNumber: "",
//   address: "",
//   chiefComplaint: "",
//   enquiryStatus: "patient",
//   remark: "",
//   response: "",
//   source: "",
//   referredBy: "",
//   referredByName: "",
// };

// /* ------------------------------------------------------------------ */
// /* Design tokens (shared look with the report pages)                   */
// /* ------------------------------------------------------------------ */
// const FIELD =
//   "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-4 read-only:bg-slate-50";
// const FIELD_OK =
//   "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10";
// const FIELD_ERR =
//   "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10";
// const BTN_PRIMARY =
//   "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60";
// const BTN_OUTLINE =
//   "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20";

// /* ------------------------------------------------------------------ */
// /* Form                                                                */
// /* ------------------------------------------------------------------ */
// const ConvertToPatientForm = ({ selectedEnquiry, onClose, onSubmit }) => {
//   const [formData, setFormData] = useState(EMPTY_FORM);
//   const [errors, setErrors] = useState({});
//   const [submitError, setSubmitError] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (selectedEnquiry) {
//       setFormData({
//         ...EMPTY_FORM,
//         name: selectedEnquiry.patientName || "",
//         age: selectedEnquiry.age || "",
//         gender: selectedEnquiry.gender || "",
//         contactNumber: selectedEnquiry.contactNumber || "",
//         address: selectedEnquiry.address || "",
//         chiefComplaint: selectedEnquiry.chiefComplaint || "",
//         remark: selectedEnquiry?.remark || "",
//         response: RESPONSES.some((r) => r.value === selectedEnquiry.response)
//           ? selectedEnquiry.response
//           : "",
//         source: SOURCES.includes(selectedEnquiry.source)
//           ? selectedEnquiry.source
//           : "",
//         referredBy: REFERRED_BY.some((r) => r.value === selectedEnquiry.referredBy)
//           ? selectedEnquiry.referredBy
//           : "",
//         referredByName: selectedEnquiry.referredByName || "",
//       });
//       setErrors({});
//       setSubmitError("");
//     }
//   }, [selectedEnquiry]);

//   // Close on Escape and stop the page behind the modal from scrolling.
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === "Escape" && !loading) onClose?.();
//     };
//     document.addEventListener("keydown", onKey);
//     const previous = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.removeEventListener("keydown", onKey);
//       document.body.style.overflow = previous;
//     };
//   }, [onClose, loading]);

//   const setField = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "contactNumber") {
//       if (!/^\d*$/.test(value) || value.length > 10) return;
//     }
//     if (name === "age") {
//       if (!/^\d*$/.test(value) || value.length > 3) return;
//     }
//     setField(name, value);
//   };

//   const validateForm = () => {
//     const f = formData;
//     const e = {};
//     const need = (key, message) => {
//       if (!String(f[key] ?? "").trim()) e[key] = message;
//     };

//     need("name", "Enter the patient's name.");
//     need("age", "Enter the age.");
//     need("gender", "Select a gender.");
//     need("contactNumber", "Enter the phone number.");
//     need("address", "Enter the address.");
//     need("chiefComplaint", "Enter the chief complaint.");
//     need("remark", "Add a remark.");
//     need("response", "Select a response.");
//     need("source", "Select a source.");

//     if (!e.age && (Number(f.age) <= 0 || Number(f.age) > 120))
//       e.age = "Age must be between 1 and 120.";

//     if (!e.contactNumber && !/^[0-9]{10}$/.test(f.contactNumber))
//       e.contactNumber = "Phone number must be exactly 10 digits.";

//     if (f.referredBy === "Person" && String(f.referredByName).trim().length < 2)
//       e.referredByName = "Enter the name of the person who referred this patient.";

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitError("");
//     if (!validateForm()) return;

//     const payload = {
//       ...formData,
//       name: formData.name.trim(),
//       address: formData.address.trim(),
//       chiefComplaint: formData.chiefComplaint.trim(),
//       remark: formData.remark.trim(),
//       // The person's name only applies when "Person" is the referral.
//       referredByName:
//         formData.referredBy === "Person" ? formData.referredByName.trim() : "",
//     };

//     setLoading(true);
//     try {
//       await onSubmit(payload);
//     } catch (err) {
//       console.error(err);
//       setSubmitError(err?.message || "Could not convert this lead. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const errorCount = Object.values(errors).filter(Boolean).length;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
//       role="presentation"
//     >
//       <div
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="convert-title"
//         className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10"
//       >
//         {/* ================= HEADER ================= */}
//         <header className="flex items-start justify-between gap-4 bg-gradient-to-br from-[#17458f] via-[#102f6b] to-[#0a1f4d] px-6 py-5 text-white">
//           <div>
//             <h2
//               id="convert-title"
//               className="text-xl font-semibold tracking-tight"
//             >
//               Convert lead to patient
//             </h2>
//             <p className="mt-1 text-sm text-blue-100/80">
//               Review the lead details and complete the patient record.
//             </p>
//             <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-300/30">
//               <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
//               Will be registered as Patient
//             </span>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={loading}
//             aria-label="Close"
//             className="rounded-lg p-2 text-blue-100/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30 disabled:opacity-50"
//           >
//             <FaTimes />
//           </button>
//         </header>

//         <form
//           onSubmit={handleSubmit}
//           noValidate
//           className="flex min-h-0 flex-1 flex-col"
//         >
//           {/* ================= BODY ================= */}
//           <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
//             {(errorCount > 0 || submitError) && (
//               <div
//                 role="alert"
//                 className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
//               >
//                 {submitError ||
//                   `Please fix ${errorCount} highlighted ${
//                     errorCount === 1 ? "field" : "fields"
//                   } below.`}
//               </div>
//             )}

//             {/* ---- Patient details ---- */}
//             <Section title="Patient details">
//               <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
//                 <Input
//                   label="Name"
//                   name="name"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   error={errors.name}
//                   autoComplete="off"
//                 />
//                 <Input
//                   label="Age"
//                   name="age"
//                   required
//                   inputMode="numeric"
//                   value={formData.age}
//                   onChange={handleChange}
//                   error={errors.age}
//                   placeholder="Years"
//                 />
//                 <Select
//                   label="Gender"
//                   name="gender"
//                   required
//                   value={formData.gender}
//                   onChange={handleChange}
//                   options={GENDERS}
//                   error={errors.gender}
//                 />
//                 <Input
//                   label="Phone number"
//                   name="contactNumber"
//                   required
//                   inputMode="numeric"
//                   maxLength={10}
//                   value={formData.contactNumber}
//                   onChange={handleChange}
//                   error={errors.contactNumber}
//                   placeholder="10-digit mobile number"
//                 />
//                 <div className="sm:col-span-2">
//                   <Textarea
//                     label="Address"
//                     name="address"
//                     required
//                     rows={2}
//                     value={formData.address}
//                     onChange={handleChange}
//                     error={errors.address}
//                   />
//                 </div>
//               </div>
//             </Section>

//             {/* ---- Clinical notes ---- */}
//             <Section title="Clinical notes">
//               <div className="grid grid-cols-1 gap-5">
//                 <Textarea
//                   label="Chief complaint"
//                   name="chiefComplaint"
//                   required
//                   rows={2}
//                   value={formData.chiefComplaint}
//                   onChange={handleChange}
//                   error={errors.chiefComplaint}
//                 />
//                 <Textarea
//                   label="Remark"
//                   name="remark"
//                   required
//                   rows={2}
//                   value={formData.remark}
//                   onChange={handleChange}
//                   error={errors.remark}
//                 />
//               </div>
//             </Section>

//             {/* ---- Lead tracking ---- */}
//             <Section title="Lead tracking">
//               <div className="space-y-5">
//                 <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
//                   <ChoiceGroup
//                     label="Response"
//                     required
//                     value={formData.response}
//                     onChange={(v) => setField("response", v)}
//                     options={RESPONSES}
//                     error={errors.response}
//                   />
//                   <Select
//                     label="Source"
//                     name="source"
//                     required
//                     value={formData.source}
//                     onChange={handleChange}
//                     options={SOURCES}
//                     error={errors.source}
//                   />
//                 </div>

//                 <ChoiceGroup
//                   label="Referred by"
//                   value={formData.referredBy}
//                   onChange={(v) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       referredBy: v,
//                       referredByName: v === "Person" ? prev.referredByName : "",
//                     }))
//                   }
//                   options={REFERRED_BY}
//                   allowClear
//                   hint="Where did this patient hear about the clinic? Choose Person to type a name."
//                 />

//                 {formData.referredBy === "Person" && (
//                   <Input
//                     label="Referred by (person's name)"
//                     name="referredByName"
//                     required
//                     value={formData.referredByName}
//                     onChange={handleChange}
//                     error={errors.referredByName}
//                     placeholder="e.g. Dr. Sharma, an existing patient or a friend"
//                     maxLength={80}
//                     autoComplete="off"
//                     autoFocus
//                   />
//                 )}
//               </div>
//             </Section>
//           </div>

//           {/* ================= FOOTER ================= */}
//           <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={loading}
//               className={BTN_OUTLINE}
//             >
//               Cancel
//             </button>
//             <button type="submit" disabled={loading} className={BTN_PRIMARY}>
//               {loading ? (
//                 <>
//                   <FaSpinner className="animate-spin" />
//                   Converting...
//                 </>
//               ) : (
//                 "Convert to patient"
//               )}
//             </button>
//           </footer>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ConvertToPatientForm;

// /* ------------------------------------------------------------------ */
// /* Building blocks                                                     */
// /* ------------------------------------------------------------------ */
// const Section = ({ title, children }) => (
//   <section>
//     <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold text-slate-700">
//       {title}
//     </h3>
//     {children}
//   </section>
// );

// const Label = ({ htmlFor, required, children }) => (
//   <label
//     htmlFor={htmlFor}
//     className="mb-1.5 block text-sm font-medium text-slate-700"
//   >
//     {children}
//     {required ? (
//       <span className="ml-0.5 text-rose-500" aria-hidden="true">
//         *
//       </span>
//     ) : (
//       <span className="ml-1.5 text-xs font-normal text-slate-400">Optional</span>
//     )}
//   </label>
// );

// const ErrorText = ({ id, children }) =>
//   children ? (
//     <p id={id} className="mt-1.5 text-xs text-rose-600">
//       {children}
//     </p>
//   ) : null;

// const Input = ({ label, name, required, error, ...props }) => (
//   <div>
//     <Label htmlFor={`convert-${name}`} required={required}>
//       {label}
//     </Label>
//     <input
//       id={`convert-${name}`}
//       name={name}
//       aria-required={required || undefined}
//       aria-invalid={error ? true : undefined}
//       aria-describedby={error ? `convert-${name}-error` : undefined}
//       className={`${FIELD} ${error ? FIELD_ERR : FIELD_OK}`}
//       {...props}
//     />
//     <ErrorText id={`convert-${name}-error`}>{error}</ErrorText>
//   </div>
// );

// const Select = ({ label, name, required, options, error, ...props }) => (
//   <div>
//     <Label htmlFor={`convert-${name}`} required={required}>
//       {label}
//     </Label>
//     <select
//       id={`convert-${name}`}
//       name={name}
//       aria-required={required || undefined}
//       aria-invalid={error ? true : undefined}
//       aria-describedby={error ? `convert-${name}-error` : undefined}
//       className={`${FIELD} ${error ? FIELD_ERR : FIELD_OK}`}
//       {...props}
//     >
//       <option value="">Select</option>
//       {options.map((opt) => (
//         <option key={opt} value={opt}>
//           {opt}
//         </option>
//       ))}
//     </select>
//     <ErrorText id={`convert-${name}-error`}>{error}</ErrorText>
//   </div>
// );

// const Textarea = ({ label, name, required, error, rows = 2, ...props }) => (
//   <div>
//     <Label htmlFor={`convert-${name}`} required={required}>
//       {label}
//     </Label>
//     <textarea
//       id={`convert-${name}`}
//       name={name}
//       rows={rows}
//       aria-required={required || undefined}
//       aria-invalid={error ? true : undefined}
//       aria-describedby={error ? `convert-${name}-error` : undefined}
//       className={`${FIELD} resize-y ${error ? FIELD_ERR : FIELD_OK}`}
//       {...props}
//     />
//     <ErrorText id={`convert-${name}-error`}>{error}</ErrorText>
//   </div>
// );

// // A row of choice buttons (radio behaviour). Used for Response and Referred by.
// const ChoiceGroup = ({
//   label,
//   required,
//   value,
//   onChange,
//   options,
//   error,
//   hint,
//   allowClear,
// }) => {
//   const labelId = `choice-${label.replace(/\s+/g, "-").toLowerCase()}`;
//   return (
//     <div>
//       <span id={labelId} className="mb-1.5 block text-sm font-medium text-slate-700">
//         {label}
//         {required ? (
//           <span className="ml-0.5 text-rose-500" aria-hidden="true">
//             *
//           </span>
//         ) : (
//           <span className="ml-1.5 text-xs font-normal text-slate-400">
//             Optional
//           </span>
//         )}
//       </span>
//       <div
//         role="radiogroup"
//         aria-labelledby={labelId}
//         className="flex flex-wrap gap-2"
//       >
//         {options.map((opt) => {
//           const selected = value === opt.value;
//           return (
//             <button
//               key={opt.value}
//               type="button"
//               role="radio"
//               aria-checked={selected}
//               onClick={() => onChange(selected && allowClear ? "" : opt.value)}
//               className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 ${
//                 selected
//                   ? opt.active || "border-blue-800 bg-blue-50 text-blue-900"
//                   : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
//               }`}
//             >
//               {opt.icon && (
//                 <span className={selected ? "" : "text-slate-400"}>{opt.icon}</span>
//               )}
//               {opt.value}
//             </button>
//           );
//         })}
//       </div>
//       {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
//       <ErrorText>{error}</ErrorText>
//     </div>
//   );
// };


import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaSpinner,
  FaGlobe,
  FaWhatsapp,
  FaInstagram,
  FaUserFriends,
} from "react-icons/fa";

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */
const GENDERS = ["Male", "Female", "Other"];
const SOURCES = ["Walk-in", "Phone", "Referral", "Online"];

const RESPONSES = [
  {
    value: "Pending",
    active: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    value: "Done",
    active: "border-emerald-300 bg-emerald-50 text-emerald-800",
  },
  {
    value: "Deny",
    active: "border-rose-300 bg-rose-50 text-rose-800",
  },
];

// "Person" means someone referred the patient; the admin types that name.
const REFERRED_BY = [
  { value: "Online", icon: <FaGlobe /> },
  { value: "WhatsApp", icon: <FaWhatsapp /> },
  { value: "Instagram", icon: <FaInstagram /> },
  { value: "Person", icon: <FaUserFriends /> },
];

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "",
  contactNumber: "",
  address: "",
  chiefComplaint: "",
  enquiryStatus: "patient",
  remark: "",
  response: "",
  source: "",
  referredBy: "",
  referredByName: "",
  visitType: "Clinic Visit",
};

/* ------------------------------------------------------------------ */
/* Design tokens (shared look with the report pages)                   */
/* ------------------------------------------------------------------ */
const FIELD =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-4 read-only:bg-slate-50";
const FIELD_OK =
  "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10";
const FIELD_ERR =
  "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20";

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */
const ConvertToPatientForm = ({ selectedEnquiry, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedEnquiry) {
      setFormData({
        ...EMPTY_FORM,
        name: selectedEnquiry.patientName || "",
        age: selectedEnquiry.age || "",
        gender: selectedEnquiry.gender || "",
        contactNumber: selectedEnquiry.contactNumber || "",
        address: selectedEnquiry.address || "",
        chiefComplaint: selectedEnquiry.chiefComplaint || "",
        remark: selectedEnquiry?.remark || "",
        response: RESPONSES.some((r) => r.value === selectedEnquiry.response)
          ? selectedEnquiry.response
          : "",
        source: SOURCES.includes(selectedEnquiry.source)
          ? selectedEnquiry.source
          : "",
        referredBy: REFERRED_BY.some((r) => r.value === selectedEnquiry.referredBy)
          ? selectedEnquiry.referredBy
          : "",
        referredByName: selectedEnquiry.referredByName || "",
        visitType: ["Clinic Visit", "Home Visit"].includes(selectedEnquiry.visitType)
          ? selectedEnquiry.visitType
          : "Clinic Visit",
      });
      setErrors({});
      setSubmitError("");
    }
  }, [selectedEnquiry]);

  // Close on Escape and stop the page behind the modal from scrolling.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, loading]);

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber") {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }
    if (name === "age") {
      if (!/^\d*$/.test(value) || value.length > 3) return;
    }
    setField(name, value);
  };

  const validateForm = () => {
    const f = formData;
    const e = {};
    const need = (key, message) => {
      if (!String(f[key] ?? "").trim()) e[key] = message;
    };

    need("name", "Enter the patient's name.");
    need("age", "Enter the age.");
    need("gender", "Select a gender.");
    need("contactNumber", "Enter the phone number.");
    need("address", "Enter the address.");
    need("chiefComplaint", "Enter the chief complaint.");
    need("remark", "Add a remark.");
    need("response", "Select a response.");
    need("source", "Select a source.");
    need("visitType", "Select a visit type.");

    if (!e.age && (Number(f.age) <= 0 || Number(f.age) > 120))
      e.age = "Age must be between 1 and 120.";

    if (!e.contactNumber && !/^[0-9]{10}$/.test(f.contactNumber))
      e.contactNumber = "Phone number must be exactly 10 digits.";

    if (f.referredBy === "Person" && String(f.referredByName).trim().length < 2)
      e.referredByName = "Enter the name of the person who referred this patient.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateForm()) return;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      address: formData.address.trim(),
      chiefComplaint: formData.chiefComplaint.trim(),
      remark: formData.remark.trim(),
      // The person's name only applies when "Person" is the referral.
      referredByName:
        formData.referredBy === "Person" ? formData.referredByName.trim() : "",
    };

    setLoading(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      console.error(err);
      setSubmitError(err?.message || "Could not convert this lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10"
      >
        {/* ================= HEADER ================= */}
        <header className="flex items-start justify-between gap-4 bg-gradient-to-br from-[#17458f] via-[#102f6b] to-[#0a1f4d] px-6 py-5 text-white">
          <div>
            <h2
              id="convert-title"
              className="text-xl font-semibold tracking-tight"
            >
              Convert lead to patient
            </h2>
            <p className="mt-1 text-sm text-blue-100/80">
              Review the lead details and complete the patient record.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-300/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Will be registered as Patient
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="rounded-lg p-2 text-blue-100/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30 disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* ================= BODY ================= */}
          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            {(errorCount > 0 || submitError) && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
              >
                {submitError ||
                  `Please fix ${errorCount} highlighted ${
                    errorCount === 1 ? "field" : "fields"
                  } below.`}
              </div>
            )}

            {/* ---- Patient details ---- */}
            <Section title="Patient details">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <Input
                  label="Name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  autoComplete="off"
                />
                <Input
                  label="Age"
                  name="age"
                  required
                  inputMode="numeric"
                  value={formData.age}
                  onChange={handleChange}
                  error={errors.age}
                  placeholder="Years"
                />
                <Select
                  label="Gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  options={GENDERS}
                  error={errors.gender}
                />
                <Input
                  label="Phone number"
                  name="contactNumber"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.contactNumber}
                  onChange={handleChange}
                  error={errors.contactNumber}
                  placeholder="10-digit mobile number"
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="Address"
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                  />
                </div>
              </div>
            </Section>

            {/* ---- Visit type ---- */}
            <Section title="Visit type">
              <ChoiceGroup
                label="Treatment location"
                required
                value={formData.visitType}
                onChange={(v) => setField("visitType", v)}
                options={[
                  {
                    value: "Clinic Visit",
                    icon: "🏥",
                    active: "border-blue-300 bg-blue-50 text-blue-800",
                  },
                  {
                    value: "Home Visit",
                    icon: "🏠",
                    active: "border-emerald-300 bg-emerald-50 text-emerald-800",
                  },
                ]}
                error={errors.visitType}
                hint="Choose where the patient will receive treatment."
              />
            </Section>

            {/* ---- Clinical notes ---- */}
            <Section title="Clinical notes">
              <div className="grid grid-cols-1 gap-5">
                <Textarea
                  label="Chief complaint"
                  name="chiefComplaint"
                  required
                  rows={2}
                  value={formData.chiefComplaint}
                  onChange={handleChange}
                  error={errors.chiefComplaint}
                />
                <Textarea
                  label="Remark"
                  name="remark"
                  required
                  rows={2}
                  value={formData.remark}
                  onChange={handleChange}
                  error={errors.remark}
                />
              </div>
            </Section>

            {/* ---- Lead tracking ---- */}
            <Section title="Lead tracking">
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  <ChoiceGroup
                    label="Response"
                    required
                    value={formData.response}
                    onChange={(v) => setField("response", v)}
                    options={RESPONSES}
                    error={errors.response}
                  />
                  <Select
                    label="Source"
                    name="source"
                    required
                    value={formData.source}
                    onChange={handleChange}
                    options={SOURCES}
                    error={errors.source}
                  />
                </div>

                <ChoiceGroup
                  label="Referred by"
                  value={formData.referredBy}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      referredBy: v,
                      referredByName: v === "Person" ? prev.referredByName : "",
                    }))
                  }
                  options={REFERRED_BY}
                  allowClear
                  hint="Where did this patient hear about the clinic? Choose Person to type a name."
                />

                {formData.referredBy === "Person" && (
                  <Input
                    label="Referred by (person's name)"
                    name="referredByName"
                    required
                    value={formData.referredByName}
                    onChange={handleChange}
                    error={errors.referredByName}
                    placeholder="e.g. Dr. Sharma, an existing patient or a friend"
                    maxLength={80}
                    autoComplete="off"
                    autoFocus
                  />
                )}
              </div>
            </Section>
          </div>

          {/* ================= FOOTER ================= */}
          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={BTN_OUTLINE}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className={BTN_PRIMARY}>
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert to patient"
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ConvertToPatientForm;

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */
const Section = ({ title, children }) => (
  <section>
    <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold text-slate-700">
      {title}
    </h3>
    {children}
  </section>
);

const Label = ({ htmlFor, required, children }) => (
  <label
    htmlFor={htmlFor}
    className="mb-1.5 block text-sm font-medium text-slate-700"
  >
    {children}
    {required ? (
      <span className="ml-0.5 text-rose-500" aria-hidden="true">
        *
      </span>
    ) : (
      <span className="ml-1.5 text-xs font-normal text-slate-400">Optional</span>
    )}
  </label>
);

const ErrorText = ({ id, children }) =>
  children ? (
    <p id={id} className="mt-1.5 text-xs text-rose-600">
      {children}
    </p>
  ) : null;

const Input = ({ label, name, required, error, ...props }) => (
  <div>
    <Label htmlFor={`convert-${name}`} required={required}>
      {label}
    </Label>
    <input
      id={`convert-${name}`}
      name={name}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `convert-${name}-error` : undefined}
      className={`${FIELD} ${error ? FIELD_ERR : FIELD_OK}`}
      {...props}
    />
    <ErrorText id={`convert-${name}-error`}>{error}</ErrorText>
  </div>
);

const Select = ({ label, name, required, options, error, ...props }) => (
  <div>
    <Label htmlFor={`convert-${name}`} required={required}>
      {label}
    </Label>
    <select
      id={`convert-${name}`}
      name={name}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `convert-${name}-error` : undefined}
      className={`${FIELD} ${error ? FIELD_ERR : FIELD_OK}`}
      {...props}
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <ErrorText id={`convert-${name}-error`}>{error}</ErrorText>
  </div>
);

const Textarea = ({ label, name, required, error, rows = 2, ...props }) => (
  <div>
    <Label htmlFor={`convert-${name}`} required={required}>
      {label}
    </Label>
    <textarea
      id={`convert-${name}`}
      name={name}
      rows={rows}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `convert-${name}-error` : undefined}
      className={`${FIELD} resize-y ${error ? FIELD_ERR : FIELD_OK}`}
      {...props}
    />
    <ErrorText id={`convert-${name}-error`}>{error}</ErrorText>
  </div>
);

// A row of choice buttons (radio behaviour). Used for Response and Referred by.
const ChoiceGroup = ({
  label,
  required,
  value,
  onChange,
  options,
  error,
  hint,
  allowClear,
}) => {
  const labelId = `choice-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <span id={labelId} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required ? (
          <span className="ml-0.5 text-rose-500" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-slate-400">
            Optional
          </span>
        )}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex flex-wrap gap-2"
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(selected && allowClear ? "" : opt.value)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 ${
                selected
                  ? opt.active || "border-blue-800 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.icon && (
                <span className={selected ? "" : "text-slate-400"}>{opt.icon}</span>
              )}
              {opt.value}
            </button>
          );
        })}
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      <ErrorText>{error}</ErrorText>
    </div>
  );
};
