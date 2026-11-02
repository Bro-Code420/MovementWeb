// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useEffect, useState, useRef } from "react";

// import BillReview from "./BillReview";
// import BillPdf from "../Component/pdf/BillPdf";
// import { PDFDownloadLink } from "@react-pdf/renderer";

// const CreateBill = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const patientDetail = location?.state?.patient?.personalDetails;
//   const patient_id = location?.state?.patient?._id;
//   const attendance = location?.state?.patient?.attendance;
//   const previousBill = location?.state?.previousBills || [];

//   // Wallet carries forward from the MOST RECENT bill (bills are pushed in
//   // creation order, so sort by createdAt and take the last one).
//   const sortedBills = [...previousBill].sort(
//     (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
//   );
//   const latestBill = sortedBills[sortedBills.length - 1];
//   const amountInWallet = latestBill?.amountInWallet || 0;

//   // Days already billed across all of this patient's previous bills.
//   // Prefer stored sessionsBilled; fall back to the session row (items[0].qty)
//   // so a bill saved without the field still counts.
//   const alreadyBilledSessions = previousBill.reduce(
//     (sum, b) => sum + (b.sessionsBilled || b?.items?.[0]?.qty || 0),
//     0,
//   );
//   // console.log("revious bill", previousBill);
//   // console.log("amount In Wallet", amountInWallet);

//   const [billNumber, setBillNumber] = useState("");
//   const [customer, setCustomer] = useState("");
//   const [date, setDate] = useState("");
//   const [billType, setBillType] = useState("Home");
//   const [status, setStatus] = useState("Cash");
//   const [items, setItems] = useState([{ name: "", qty: 1, price: 0 }]);
//   const [advancePayment, setAdvancePayment] = useState(0);
//   const [paymentStatus, setPaymentStatus] = useState("Unpaid");
//   const [discount, setDiscount] = useState(0);

//   const [billData, setBillData] = useState([]);
//   const [createBillLoading, setCreateBillLoading] = useState(false);

//   const [review, setReview] = useState(false);
//   const [reviewBill, setReviewBill] = useState(null);

//   // Ref for the bill content to be printed
//   const billContentRef = useRef();

//   useEffect(() => {
//     if (patientDetail && attendance) {
//       const presentCount = attendance.filter(
//         (item) => item?.status === "Present",
//       ).length;

//       // Only the days NOT yet billed should default onto a new bill.
//       const remaining = Math.max(0, presentCount - alreadyBilledSessions);

//       setCustomer(patientDetail?.name);

//       setItems([
//         {
//           name: "Physiotherapy Session", // default; editable. Bill schema requires a name.
//           qty: remaining, // ✅ remaining (un-billed) present days
//           price: 0,
//         },
//       ]);
//     }
//   }, [patientDetail, attendance, alreadyBilledSessions]);

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...items];
//     updatedItems[index][field] =
//       field === "qty" || field === "price" ? Number(value) : value;
//     setItems(updatedItems);
//   };

//   const addItem = () => {
//     setItems([...items, { name: "", qty: 1, price: 0 }]);
//   };

//   const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

//   const fetchBillData = async () => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/report/bill`,
//       );
//       const result = await response.json();
//       // console.log("Bill data:", result);
//       if (result.success && result.data.length > 0) {
//         setBillData(result.data);

//         // Get last bill number and increment
//         const lastBill = result.data[0];
//         const lastBillNumber = lastBill.billNumber;
//         const match = lastBillNumber.match(/(\D+)-(\d+)-(\d+)/);
//         if (match) {
//           const prefix = match[1];
//           const year = match[2];
//           const number = parseInt(match[3]) + 1;
//           const newBillNumber = `${prefix}-${year}-${number
//             .toString()
//             .padStart(3, "0")}`;
//           setBillNumber(newBillNumber);
//         } else {
//           setBillNumber("MOV-2025-001");
//         }
//       } else {
//         setBillNumber("MOV-2025-001");
//       }
//     } catch (error) {
//       console.error("Error fetching bill data:", error);
//       setBillNumber("MOV-2025-001");
//     }
//   };

//   useEffect(() => {
//     fetchBillData();
//   }, []);

//   const handleSubmit = async () => {
//     // Validate before hitting the API — the Bill schema requires a date and a
//     // name on every item, so catch blanks here with a clear message.
//     if (!date) {
//       alert("Please select a date.");
//       return;
//     }
//     const invalidItem = items.find((it) => !it.name?.trim());
//     if (invalidItem) {
//       alert("Please enter a Service Name for every item.");
//       return;
//     }

//     const formData = {
//       billNumber,
//       billType,
//       customer,
//       date,
//       status,
//       paymentStatus,
//       items,
//       total: total - discount,
//       advancePayment,
//       amountInWallet,
//       // First item row is the session/days row — record how many days this
//       // bill covers so the next bill can subtract it.
//       sessionsBilled: Number(items[0]?.qty) || 0,
//     };

//     const payLoad = {
//       patientId: patient_id,
//       formData,
//     };

//     console.log("inside handleSubmit", formData);

//     setCreateBillLoading(true);

//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/report/bill`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payLoad),
//         },
//       );

//       const result = await response.json();
//       console.log("Bill saved:", result);
//       if (result?.success) {
//         alert(result.message);
//         fetchBillData(); // Refresh after saving
//         setCustomer("");
//         setDate("");
//         setStatus("Cash");
//         setPaymentStatus("Unpaid");
//         setBillType("Home");
//         setItems([{ name: "", qty: 1, price: 0 }]);
//         setAdvancePayment(0);
//         navigate(`/PatientDetails/${patient_id}`);
//       } else {
//         alert(result?.message || "Failed to submit bill");
//       }
//     } catch (error) {
//       console.error("Error submitting bill:", error);
//       alert("Failed to submit bill");
//     } finally {
//       setCreateBillLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="min-h-screen bg-gray-100 px-4 md:px-6 py-6">
//         <div className="flex space-x-4 items-center justify-center mb-2">
//           <button
//             onClick={() => setBillType("Home")}
//             className={`${
//               billType === "Home" ? "bg-blue-500" : "bg-gray-500"
//             } text-white px-4 py-2 rounded-lg`}
//           >
//             Home Service
//           </button>
//           <button
//             onClick={() => setBillType("Clinic")}
//             className={`${
//               billType === "Clinic" ? "bg-blue-500" : "bg-gray-500"
//             } text-white px-4 py-2 rounded-lg`}
//           >
//             Clinic Service
//           </button>
//         </div>

//         {/* Main Content */}
//         <div className=" px-6 pb-10">
//           <div
//             ref={billContentRef}
//             className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md"
//           >
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-800">Create Bill</h2>
//               <div className="flex items-center gap-2 flex-wrap">
//                 <select
//                   className="px-4 py-1 cursor-pointer rounded-full text-sm bg-gray-100 border border-gray-300"
//                   value={status}
//                   onChange={(e) => setStatus(e.target.value)}
//                 >
//                   <option value="Cash">Cash</option>
//                   <option value="Online">Online</option>
//                 </select>
//               </div>
//             </div>

//             {/* Bill Info Inputs */}
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div>
//                 <label className="text-gray-500 block">Bill Number</label>
//                 <input
//                   type="text"
//                   value={billNumber}
//                   readOnly
//                   onChange={(e) => setBillNumber(e.target.value)}
//                   className="w-full border border-gray-300 p-2 rounded"
//                   placeholder="e.g. INV-2025-001"
//                 />
//               </div>
//               <div>
//                 <label className="text-gray-500 block">Date</label>
//                 <input
//                   type="date"
//                   value={date}
//                   onChange={(e) => setDate(e.target.value)}
//                   className="w-full border border-gray-300 p-2 rounded"
//                 />
//               </div>
//               <div>
//                 <label className="text-gray-500 block">Customer</label>
//                 <input
//                   type="text"
//                   value={customer}
//                   readOnly={patientDetail !== undefined}
//                   onChange={(e) => setCustomer(e.target.value)}
//                   className="w-full border border-gray-300 p-2 rounded"
//                   placeholder="e.g. John Doe"
//                 />
//               </div>
//               <div>
//                 <label className="text-gray-500 block">Payment Status</label>
//                 <select
//                   className="px-4 py-1 mt-2 cursor-pointer rounded-full text-sm bg-gray-100 border border-gray-300"
//                   value={paymentStatus}
//                   onChange={(e) => setPaymentStatus(e.target.value)}
//                 >
//                   <option value="Paid">Paid</option>
//                   <option value="Unpaid">Unpaid</option>
//                 </select>
//               </div>
//             </div>

//             {/* Items Table */}
//             <table className="w-full text-left mb-6">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="p-2">Service Name</th>
//                   <th className="p-2">Number of Session</th>
//                   <th className="p-2">Price</th>
//                   <th className="p-2">Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((item, idx) => (
//                   <tr key={idx} className="border-b">
//                     <td className="p-2">
//                       <input
//                         type="text"
//                         value={item.name}
//                         onChange={(e) =>
//                           handleItemChange(idx, "name", e.target.value)
//                         }
//                         className="w-full border border-gray-300 p-1 rounded"
//                         placeholder="Service name"
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="number"
//                         min="1"
//                         // readOnly={patientDetail !== undefined}
//                         value={item.qty}
//                         onChange={(e) =>
//                           handleItemChange(idx, "qty", e.target.value)
//                         }
//                         className="w-full border border-gray-300 p-1 rounded"
//                       />
//                     </td>
//                     <td className="p-2">
//                       <input
//                         type="number"
//                         min="0"
//                         value={item.price}
//                         onChange={(e) =>
//                           handleItemChange(idx, "price", e.target.value)
//                         }
//                         className="w-full border border-gray-300 p-1 rounded"
//                       />
//                     </td>
//                     <td className="p-2 text-gray-800">
//                       ₹
//                       {(item.qty * item.price).toLocaleString("en-IN", {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2,
//                       })}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Add Item Button */}
//             <button
//               onClick={addItem}
//               className="mb-4 bg-blue-100 text-blue-700 px-3 py-1 rounded"
//             >
//               + Add Item
//             </button>

//             {/* Total */}
//             <div className="space-y-4">
//               {/* Amount in Wallet  */}
//               <div className="flex items-center justify-between text-sm text-gray-600">
//                 {/* <span>Amount in Wallet </span> */}
//                 <span>Wallet Adjustment:</span>
//                 <span className="text-lg font-semibold text-gray-900">
//                   ₹
//                   {amountInWallet.toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </span>
//               </div>

//               {/* Actual Bill Amount */}
//               <div className="flex items-center justify-between text-md text-green-600">
//                 <span>Actual Bill Amount</span>
//                 <span className="text-lg font-semibold text-green-500">
//                   ₹
//                   {total.toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between text-md text-red-600">
//                 <span>Discount Amount</span>
//                 <input
//                   type="number"
//                   placeholder="Enter discount"
//                   min={0}
//                   max={total}
//                   value={discount}
//                   onChange={(e) => {
//                     if (e.target.value > total) return;
//                     // Number(setDiscount(e.target.value));
//                     setDiscount(e.target.value);
//                   }}
//                   className="rounded border border-gray-300 px-3 py-1 text-md focus:border-black focus:outline-none"
//                 />
//                 <span className="text-lg font-semibold text-red-500">
//                   - ₹
//                   {(discount || 0).toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between text-sm text-gray-600">
//                 <span>Total Amount</span>
//                 <span className="text-lg font-semibold text-gray-900">
//                   ₹
//                   {(total - discount).toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </span>
//               </div>

//               {/* Advance Payment */}
//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-600">
//                   Advance Paid
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   value={advancePayment}
//                   onChange={(e) => {
//                     // if (e.target.value > total) return;
//                     Number(setAdvancePayment(e.target.value));
//                   }}
//                   className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
//                   placeholder="Enter advance amount"
//                 />
//               </div>

//               <div className="flex items-center justify-between border-t pt-4">
//                 <span className="text-base text-gray-700">
//                   Total Advance (Including Wallet + Advance Payment)
//                 </span>
//                 <span className="text-md text-black">
//                   ₹
//                   {(Number(advancePayment) + amountInWallet).toLocaleString(
//                     "en-IN",
//                     {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     },
//                   )}
//                 </span>
//               </div>

//               <div className="flex items-center justify-between border-t pt-4">
//                 <span className="text-base font-medium text-gray-700">
//                   Balance Remaining
//                 </span>
//                 <span className="text-xl font-bold text-black">
//                   ₹
//                   {total -
//                     discount -
//                     (Number(advancePayment) + amountInWallet) <
//                   0
//                     ? 0
//                     : (
//                         total -
//                         discount -
//                         (Number(advancePayment) + amountInWallet)
//                       ).toLocaleString("en-IN", {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2,
//                       })}
//                 </span>
//               </div>

//               {/* Remaining Balance */}
//               <div className="flex items-center justify-between border-t pt-4">
//                 <span className="text-base text-gray-700">
//                   Remaining Balance In Wallet
//                 </span>
//                 <span className="text-md text-black">
//                   ₹
//                   {total -
//                     discount -
//                     (Number(advancePayment) + amountInWallet) >
//                   0
//                     ? 0
//                     : (
//                         Number(advancePayment) +
//                         amountInWallet -
//                         (total - discount)
//                       ).toLocaleString("en-IN", {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2,
//                       })}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           {!review && (
//             <div className="flex justify-end mt-6 max-w-3xl mx-auto">
//               <button
//                 onClick={() => {
//                   setReviewBill({
//                     billNumber,
//                     billType,
//                     customer,
//                     date,
//                     status,
//                     paymentStatus,
//                     items,
//                     total,
//                     discount,
//                     advancePayment,
//                     amountInWallet,
//                   });
//                 }}
//                 className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
//               >
//                 Review
//               </button>
//             </div>
//           )}
//           {review && (
//             <div className="max-w-3xl mx-auto flex justify-end space-x-4 mt-6">
//               <button
//                 onClick={handleSubmit}
//                 disabled={createBillLoading}
//                 className="bg-blue-500 text-white px-4 py-2 rounded-lg"
//               >
//                 {createBillLoading ? "Saving..." : "Save"}
//               </button>

//               <PDFDownloadLink
//                 document={
//                   <BillPdf
//                     bill={{
//                       billNumber,
//                       billType,
//                       customer,
//                       date,
//                       status,
//                       paymentStatus,
//                       items,
//                       total: total - discount,
//                       advancePayment,
//                       amountInWallet,
//                     }}
//                     patient={patientDetail}
//                   />
//                 }
//                 fileName={`Bill-${billNumber}.pdf`}
//               >
//                 {({ loading }) => (
//                   <button className="bg-purple-500 text-white px-4 py-2 rounded-lg">
//                     {loading ? "Generating PDF..." : "Download PDF"}
//                   </button>
//                 )}
//               </PDFDownloadLink>
//             </div>
//           )}
//         </div>
//       </div>

//       {reviewBill && (
//         <BillReview
//           bill={reviewBill}
//           onClose={() => setReviewBill(null)}
//           onConfirm={() => {
//             setReview(true);
//             setReviewBill(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default CreateBill;


import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  FileText,
  User,
  Calendar,
  CreditCard,
  Wallet,
  Plus,
  Trash2,
  Download,
  MessageCircle,
  CheckCircle2,
  ArrowLeft,
  Receipt,
  IndianRupee,
  Percent,
} from "lucide-react";

import BillReview from "./BillReview";
import BillPdf from "../Component/pdf/BillPdf";

const CreateBill = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const patient = location?.state?.patient;
  const patientDetail = patient?.personalDetails;
  const patient_id = patient?._id;
  const attendance = patient?.attendance || [];
  const previousBill = location?.state?.previousBills || [];
  const editBill = location?.state?.editBill;
  const isEditMode = Boolean(editBill?._id);
  const sortedBills = [...previousBill].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const latestBill = sortedBills[sortedBills.length - 1];

  const amountInWallet = Math.max(
    0,
    Number(latestBill?.amountInWallet || 0)
  );

  const alreadyBilledSessions = previousBill.reduce(
    (sum, bill) =>
      sum +
      (Number(bill.sessionsBilled) ||
        Number(bill?.items?.[0]?.qty) ||
        0),
    0
  );

  const [billNumber, setBillNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState("");
  const [billType, setBillType] = useState("Home");
  const [status, setStatus] = useState("Cash");

  const [items, setItems] = useState([
    { name: "", qty: 1, price: 0 },
  ]);

  const [advancePayment, setAdvancePayment] = useState("0");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [discount, setDiscount] = useState("0");

  const [createBillLoading, setCreateBillLoading] = useState(false);
  const [review, setReview] = useState(false);
  const [reviewBill, setReviewBill] = useState(null);

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Initialize patient information
  useEffect(() => {
    if (patientDetail) {
      setCustomer(patientDetail.name || "");
    }

    if (attendance.length > 0) {
      const presentCount = attendance.filter(
        (item) => item?.status === "Present"
      ).length;

      const remaining = Math.max(
        0,
        presentCount - alreadyBilledSessions
      );

      setItems([
        {
          name: "Physiotherapy Session",
          qty: remaining,
          price: 0,
        },
      ]);
    }
  }, [patientDetail, attendance, alreadyBilledSessions]);

  // Item calculations
  const handleItemChange = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "qty" || field === "price"
                  ? value
                  : value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      { name: "", qty: 1, price: 0 },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    setItems((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Bill calculations
  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Math.max(0, Number(item.qty) || 0) *
            Math.max(0, Number(item.price) || 0),
        0
      ),
    [items]
  );

  const discountAmount = Math.min(
    total,
    Math.max(0, Number(discount) || 0)
  );

  const finalTotal = Math.max(0, total - discountAmount);

  const actualAdvance = Math.max(
    0,
    Number(advancePayment) || 0
  );

  const totalAvailablePayment = actualAdvance + amountInWallet;

  // Paid means the entire bill is paid.
  // Unpaid means only actual advance and wallet count as paid.
  const effectivePaidAmount =
    paymentStatus === "Paid"
      ? finalTotal
      : Math.min(finalTotal, totalAvailablePayment);

  const balanceRemaining = Math.max(
    0,
    finalTotal - effectivePaidAmount
  );

  const remainingWallet = Math.max(
    0,
    totalAvailablePayment - finalTotal
  );

  // Fetch bill number
  const fetchBillData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/bill`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bills");
      }

      const result = await response.json();

      if (result.success && result.data?.length > 0) {
        const lastBill = result.data[0];
        const match = lastBill.billNumber?.match(
          /(\D+)-(\d+)-(\d+)/
        );

        if (match) {
          const nextNumber = Number(match[3]) + 1;

          setBillNumber(
            `${match[1]}-${match[2]}-${String(nextNumber).padStart(3, "0")}`
          );
        } else {
          setBillNumber("MOV-2025-001");
        }
      } else {
        setBillNumber("MOV-2025-001");
      }
    } catch (error) {
      console.error("Bill number error:", error);
      setBillNumber("MOV-2025-001");
    }
  };

  useEffect(() => {
    fetchBillData();
  }, []);

  // Shared bill data
  const currentBillData = {
    billNumber,
    billType,
    customer,
    date,
    status,
    paymentStatus,
    items,
    total: finalTotal,
    actualTotal: total,
    discount: discountAmount,
    advancePayment: actualAdvance,
    amountInWallet,
    paidAmount: effectivePaidAmount,
    balanceRemaining,
    remainingWallet,
  };

  // WhatsApp sharing
  const handleWhatsAppShare = () => {
    if (!customer || !billNumber) {
      alert("Please enter customer details first.");
      return;
    }

    const message = `
*MOVEMENT REHAB*
*BILL PAYMENT SUMMARY*

Hello ${customer},

Your bill details are as follows:

*Bill Number:* ${billNumber}
*Bill Date:* ${date || "Not selected"}
*Service Type:* ${billType}

-------------------------
*BILL DETAILS*
-------------------------

*Total Amount:* ₹${formatAmount(total)}
*Discount:* ₹${formatAmount(discountAmount)}
*Final Bill Amount:* ₹${formatAmount(finalTotal)}

*Payment Status:* ${paymentStatus}
*Total Paid:* ₹${formatAmount(effectivePaidAmount)}
*Balance Remaining:* ₹${formatAmount(balanceRemaining)}

-------------------------

${
  paymentStatus === "Paid"
    ? "Thank you! Your payment is fully completed."
    : balanceRemaining > 0
      ? `Outstanding payment: ₹${formatAmount(balanceRemaining)}. Please clear the remaining balance.`
      : "Your bill is fully settled."
}

Thank you for choosing Movement Rehab.
    `.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // Save bill
  const handleSubmit = async () => {
    if (!date) {
      alert("Please select a bill date.");
      return;
    }

    if (!customer.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (items.some((item) => !item.name.trim())) {
      alert("Please enter a service name for every item.");
      return;
    }

    if (
      items.some(
        (item) =>
          Number(item.qty) < 0 ||
          Number(item.price) < 0
      )
    ) {
      alert("Quantity and price cannot be negative.");
      return;
    }

    if (actualAdvance < 0) {
      alert("Advance payment cannot be negative.");
      return;
    }

    if (actualAdvance > finalTotal + amountInWallet) {
      alert("Advance payment exceeds the available bill amount.");
      return;
    }

    const formData = {
      billNumber,
      billType,
      customer,
      date,
      status,
      paymentStatus,
      items,

      total: finalTotal,
      discount: discountAmount,

      // Preserve actual advance entered
      advancePayment: actualAdvance,

      amountInWallet,

      // Effective paid amount, including full amount when Paid
      paidAmount: effectivePaidAmount,
      balanceRemaining,
      remainingWallet,

      sessionsBilled: Number(items[0]?.qty) || 0,
    };

    const payLoad = {
      patientId: patient_id,
      formData,
    };

    setCreateBillLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/bill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payLoad),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Failed to save bill"
        );
      }

      alert("Bill created successfully!");

      navigate(
        patient_id
          ? `/PatientDetails/${patient_id}`
          : -1
      );
    } catch (error) {
      console.error("Submit bill error:", error);
      alert(error.message || "Failed to submit bill.");
    } finally {
      setCreateBillLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const cardClass =
    "rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 pb-12">

      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Create Invoice
              </h1>
              <p className="text-xs text-slate-500">
                Movement Rehab · Billing Management
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Receipt size={16} />
            New Invoice
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 md:px-8">

        {/* Page heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              BILLING / NEW INVOICE
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Create New Bill
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create, review and share your patient's invoice.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              Invoice: <strong>{billNumber || "Loading..."}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">

          {/* Left content */}
          <div className="space-y-6 xl:col-span-2">

            {/* Patient and bill information */}
            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <User size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Patient Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter patient and invoice details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Invoice Number
                  </label>

                  <input
                    value={billNumber}
                    readOnly
                    className={`${inputClass} bg-slate-50`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Invoice Date
                  </label>

                  <div className="relative">
                    <Calendar
                      size={17}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />

                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Patient Name
                  </label>

                  <input
                    value={customer}
                    readOnly={!!patientDetail}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Enter patient name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Service Type
                  </label>

                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Home">Home Service</option>
                    <option value="Clinic">Clinic Service</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Services */}
            <section className={cardClass}>
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <FileText size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Services & Charges
                    </h3>
                    <p className="text-xs text-slate-500">
                      Add treatment sessions and service charges
                    </p>
                  </div>
                </div>

                <button
                  onClick={addItem}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Add Service
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Service {index + 1}
                      </span>

                      <button
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Remove service"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">

                      <div className="sm:col-span-5">
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Service Name
                        </label>

                        <input
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Physiotherapy Session"
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Sessions / Qty
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "qty",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Price (₹)
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Subtotal
                        </label>

                        <div className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-900">
                          ₹{formatAmount(
                            Number(item.qty || 0) *
                              Number(item.price || 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    Total Service Charges
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    ₹{formatAmount(total)}
                  </p>
                </div>
              </div>
            </section>

            {/* Payment details */}
            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <CreditCard size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Payment Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure payment and advance information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Payment Method
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Payment Status
                  </label>

                  <select
                    value={paymentStatus}
                    onChange={(e) =>
                      setPaymentStatus(e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Advance Paid (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={advancePayment}
                    onChange={(e) =>
                      setAdvancePayment(e.target.value)
                    }
                    className={inputClass}
                    placeholder="Enter advance"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Discount (₹)
                  </label>

                  <div className="relative">
                    <Percent
                      size={17}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />

                    <input
                      type="number"
                      min="0"
                      max={total}
                      value={discount}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (Number(value) >= 0 && Number(value) <= total) {
                          setDiscount(value);
                        } else if (value === "") {
                          setDiscount("");
                        }
                      }}
                      className={`${inputClass} pl-10`}
                      placeholder="Enter discount"
                    />
                  </div>
                </div>
              </div>

              {/* Wallet */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2 text-blue-600">
                    <Wallet size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Available Wallet Balance
                    </p>
                    <p className="text-xs text-slate-500">
                      Carried forward from previous bill
                    </p>
                  </div>
                </div>

                <p className="text-lg font-bold text-blue-700">
                  ₹{formatAmount(amountInWallet)}
                </p>
              </div>
            </section>
          </div>

          {/* Right summary */}
          <aside className="space-y-6 xl:sticky xl:top-24">

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="bg-slate-900 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">
                      Invoice Summary
                    </p>
                    <h3 className="mt-1 text-xl font-bold">
                      Payment Overview
                    </h3>
                  </div>

                  <div className="rounded-xl bg-white/10 p-3">
                    <Receipt size={23} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Service Amount
                  </span>
                  <span className="font-semibold text-slate-800">
                    ₹{formatAmount(total)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Discount
                  </span>
                  <span className="font-semibold text-red-500">
                    - ₹{formatAmount(discountAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Wallet Adjustment
                  </span>
                  <span className="font-semibold text-slate-800">
                    ₹{formatAmount(amountInWallet)}
                  </span>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">
                      Final Bill Amount
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      ₹{formatAmount(finalTotal)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-medium text-emerald-700">
                    TOTAL PAID AMOUNT
                  </p>

                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    ₹{formatAmount(effectivePaidAmount)}
                  </p>

                  <p className="mt-1 text-xs text-emerald-700">
                    {paymentStatus === "Paid"
                      ? "Full invoice amount considered paid"
                      : "Advance payment + wallet adjustment"}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-xs font-medium text-red-600">
                    OUTSTANDING BALANCE
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-600">
                    ₹{formatAmount(balanceRemaining)}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                  <span className="text-sm text-slate-500">
                    Remaining Wallet
                  </span>

                  <span className="font-bold text-slate-800">
                    ₹{formatAmount(remainingWallet)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm font-medium text-slate-600">
                    Payment Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      paymentStatus === "Paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {paymentStatus === "Paid" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        PAID
                      </span>
                    ) : (
                      "UNPAID"
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* Actions */}
            <section className={cardClass}>
              <h3 className="mb-4 font-bold text-slate-900">
                Invoice Actions
              </h3>

              <div className="space-y-3">

                <button
                  onClick={() =>
                    setReviewBill(currentBillData)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <FileText size={17} />
                  Review Invoice
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1da851]"
                >
                  <MessageCircle size={19} />
                  Share via WhatsApp
                </button>

                <PDFDownloadLink
                  document={
                    <BillPdf
                      bill={currentBillData}
                      patient={patientDetail}
                    />
                  }
                  fileName={`Bill-${billNumber}.pdf`}
                >
                  {({ loading }) => (
                    <button
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                    >
                      <Download size={18} />
                      {loading
                        ? "Generating PDF..."
                        : "Download PDF"}
                    </button>
                  )}
                </PDFDownloadLink>

                <button
                  onClick={handleSubmit}
                  disabled={createBillLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createBillLoading ? (
                    "Saving Bill..."
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Save Invoice
                    </>
                  )}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">
                Please verify all bill details before saving.
              </p>
            </section>
          </aside>
        </div>
      </main>

      {/* Review modal */}
      {reviewBill && (
        <BillReview
          bill={reviewBill}
          onClose={() => setReviewBill(null)}
          onConfirm={() => {
            setReview(true);
            setReviewBill(null);
          }}
        />
      )}
    </div>
  );
};

export default CreateBill;
