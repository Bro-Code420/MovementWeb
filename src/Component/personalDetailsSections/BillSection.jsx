// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import BillPdf from "../pdf/BillPdf";
// import { MdEdit, MdClose } from "react-icons/md";

// const BillSection = ({ fetchData, billing, patientDetail, attendance }) => {
//   const navigate = useNavigate();
//   // console.log("patient", patientDetail);
//   console.log("billing", billing);

//   const [editId, setEditId] = useState(null);
//   const [updateStatus, setUpdateStatus] = useState(null);

//   // --- Session/day billing summary ---
//   const totalPresent = (attendance || []).filter(
//     (a) => a?.status === "Present",
//   ).length;
//   // Days billed per bill. Prefer the stored sessionsBilled; fall back to the
//   // session row (items[0].qty) so a bill saved without the field still counts.
//   const alreadyBilled = (billing || []).reduce(
//     (s, b) => s + (b?.sessionsBilled || b?.items?.[0]?.qty || 0),
//     0,
//   );
//   const remainingSessions = Math.max(0, totalPresent - alreadyBilled);

//   const goTo = (path) => {
//     navigate(path, {
//       state: {
//         patient: patientDetail,
//         attendance,
//         previousBills: billing,
//         remainingSessions,
//       },
//     });
//   };

//   const handleStatusUpdate = async (id, newStatus) => {
//     console.log(id, newStatus);
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/report/bill/${id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ status: newStatus }),
//         },
//       );

//       const result = await response.json();

//       console.log("result", result);

//       if (result.success) {
//         fetchData(); // refresh
//         setEditId(null);
//         setUpdateStatus(null);
//       } else {
//         alert(result.message);
//         setEditId(null);
//         setUpdateStatus(null);
//       }
//     } catch (error) {
//       console.error("Update failed", error);
//     }
//   };
//   return (
//     <section className="border rounded-lg p-4">
//       <h2 className="font-semibold text-lg mb-3">Billing</h2>

//       {/* Session/day billing summary */}
//       <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
//         <span className="text-gray-600">
//           Present days: <b className="text-gray-900">{totalPresent}</b>
//         </span>
//         <span className="text-gray-600">
//           Billed: <b className="text-gray-900">{alreadyBilled}</b>
//         </span>
//         <span className="text-gray-600">
//           Remaining to bill:{" "}
//           <b className={remainingSessions > 0 ? "text-blue-600" : "text-green-600"}>
//             {remainingSessions}
//           </b>
//         </span>
//       </div>

//       <button
//         onClick={() => goTo("/createBill")}
//         disabled={remainingSessions === 0}
//         className={`px-3 py-1 mb-2 text-sm border rounded ${
//           remainingSessions === 0
//             ? "opacity-50 cursor-not-allowed"
//             : "hover:bg-gray-100"
//         }`}
//       >
//         Generate Bill
//       </button>
//       {remainingSessions === 0 && (
//         <p className="text-xs text-gray-500 mb-2">
//           All present days have been billed.
//         </p>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//         {billing?.length === 0 ? (
//           <div className="col-span-full text-center text-gray-500 text-lg font-medium">
//             No bills found for the selected filters.
//           </div>
//         ) : (
//           billing?.map((bill) => (
//             <div
//               key={bill?._id}
//               className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
//             >
//               <div className="mb-2">
//                 <div className="flex items-center gap-2 justify-between">
//                   <h2 className="text-xl font-semibold text-blue-600">
//                     {bill?.billNumber}
//                   </h2>
//                   <h4 className="text-md font-semibold text-gray-600">
//                     {bill?.billType}
//                   </h4>
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   Customer: {bill?.customer}
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Customer ID: {patientDetail?.personalDetails?.patientId}
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Date: {new Date(bill?.date).toLocaleDateString("en-GB")}
//                 </p>
//                 <p
//                   className={`text-md font-medium ${
//                     bill.status === "Cash" ? "text-red-500" : "text-green-500"
//                   }`}
//                 >
//                   Status: {bill.status}
//                 </p>
//                 {/* <p
//                   className={`text-md font-medium ${
//                     bill?.paymentStatus === "Unpaid"
//                       ? "text-red-500"
//                       : "text-green-500"
//                   }`}
//                 >
//                   Payment Status: {bill?.paymentStatus}
//                 </p> */}
//                 <div className="flex flex-wrap items-center justify-between">
//                   {editId === bill._id ? (
//                     <div className="text-md font-medium">
//                       Payment Status:
//                       <select
//                         value={updateStatus}
//                         onChange={(e) => setUpdateStatus(e.target.value)}
//                         className="ml-2 border px-2 py-1 rounded"
//                       >
//                         <option value="Paid">Paid</option>
//                         <option value="Unpaid">Unpaid</option>
//                       </select>
//                       <button
//                         disabled={updateStatus === bill?.paymentStatus}
//                         onClick={() =>
//                           handleStatusUpdate(bill._id, updateStatus)
//                         }
//                         className={`px-2 py-1 rounded text-xs ml-2 ${
//                           updateStatus === bill?.paymentStatus
//                             ? "bg-gray-300 cursor-not-allowed"
//                             : "bg-green-600 text-white"
//                         }`}
//                       >
//                         OK
//                       </button>
//                     </div>
//                   ) : (
//                     <p
//                       className={`text-md font-medium ${
//                         bill?.paymentStatus === "Unpaid"
//                           ? "text-red-500"
//                           : "text-green-500"
//                       }`}
//                     >
//                       Payment Status: {bill?.paymentStatus}
//                     </p>
//                   )}

//                   <button
//                     onClick={() => {
//                       setEditId(editId === bill._id ? null : bill._id);
//                       setUpdateStatus(bill?.paymentStatus);
//                     }}
//                     className="p-1 rounded hover:bg-gray-100"
//                   >
//                     {editId === bill._id ? (
//                       <MdClose size={18} className="text-red-500" />
//                     ) : (
//                       <MdEdit size={18} className="text-blue-500" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div className="mb-2">
//                 <h3 className="font-semibold text-gray-800">Items:</h3>
//                 <ul className="list-disc pl-5">
//                   {bill.items.map((item) => (
//                     <li key={item?._id} className="text-sm text-gray-700">
//                       {item?.name} - Session: {item?.qty?.toLocaleString()} × ₹
//                       {item?.price.toLocaleString()} = ₹
//                       {(item?.qty * item?.price).toLocaleString("en-IN", {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2,
//                       })}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               {/* <div className="text-right font-bold text-green-700">
//                 Total: ₹{bill?.total.toFixed(2)}
//               </div> */}
//               <div className="">
//                 {/* Total Amount */}
//                 <div className="flex items-center justify-between text-sm text-gray-600">
//                   <span>Total Amount</span>
//                   <span className="text-lg font-semibold text-gray-900">
//                     ₹
//                     {bill?.total.toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm text-gray-600">
//                   <span> Advance Paid</span>
//                   <span className="text-lg font-semibold text-gray-900">
//                     <span className="text-red-600 font-semibold text-xl">
//                       -{" "}
//                     </span>{" "}
//                     ₹
//                     {bill?.advancePayment.toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     }) || 0}
//                   </span>
//                 </div>

//                 {/* Remaining Balance */}
//                 <div className="flex items-center justify-between border-t pt-4 mt-4">
//                   <span className="text-base font-medium text-gray-700">
//                     Remaining Balance
//                   </span>
//                   <span className={`text-right font-bold ${bill?.paymentStatus === "Unpaid" ? "text-red-700": "text-green-700"} `}>
//                     ₹
//                     {bill?.total -
//                       (Number(bill?.advancePayment) + bill?.amountInWallet) <
//                     0
//                       ? 0
//                       : (
//                           bill?.total -
//                           (Number(bill?.advancePayment) + bill?.amountInWallet)
//                         ).toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         })}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between border-t pt-4 mt-4">
//                   <span className="text-base font-medium text-gray-700">
//                     Remaining Balance In Wallet
//                   </span>
//                   <span className="text-right font-bold text-green-700">
//                     ₹
//                     {bill?.amountInWallet.toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </span>
//                 </div>
//               </div>
//               <PDFDownloadLink
//                 document={
//                   <BillPdf
//                     bill={bill}
//                     patient={patientDetail?.personalDetails}
//                   />
//                 }
//                 fileName={`Bill-${bill.billNumber}.pdf`}
//               >
//                 {({ loading }) => (
//                   <button className="mt-3 w-full bg-blue-600 text-white py-1 rounded-md text-sm hover:bg-blue-700">
//                     {loading ? "Generating PDF..." : "Download PDF"}
//                   </button>
//                 )}
//               </PDFDownloadLink>
//             </div>
//           ))
//         )}
//       </div>
//     </section>
//   );
// };

// export default BillSection;



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BillPdf from "../pdf/BillPdf";
import { MdEdit, MdClose, MdDelete, MdOutlineEdit } from "react-icons/md";

const API = import.meta.env.VITE_BACKEND_URL;

const BillSection = ({ fetchData, billing, patientDetail, attendance }) => {
  const navigate = useNavigate();

  const [editId, setEditId] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const totalPresent = (attendance || []).filter(
    (a) => a?.status === "Present"
  ).length;

  const alreadyBilled = (billing || []).reduce(
    (sum, bill) =>
      sum + Number(bill?.sessionsBilled || bill?.items?.[0]?.qty || 0),
    0
  );

  const remainingSessions = Math.max(0, totalPresent - alreadyBilled);

  const goTo = (path) => {
    navigate(path, {
      state: {
        patient: patientDetail,
        attendance,
        previousBills: billing,
        remainingSessions,
      },
    });
  };

  const handleEditInvoice = (bill) => {
    navigate("/createBill", {
      state: {
        patient: patientDetail,
        attendance,
        previousBills: billing,
        remainingSessions,
        editBill: bill,
      },
    });
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("webapptoken");

      const response = await fetch(`${API}/api/report/bill/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { token, Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update payment status");
      }

      await fetchData();
      setEditId(null);
      setUpdateStatus("");
    } catch (error) {
      console.error("Payment status update failed:", error);
      alert(error.message);
    }
  };

  const handleDeleteInvoice = async (bill) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice ${bill.billNumber}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(bill._id);

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("webapptoken");

      const response = await fetch(`${API}/api/report/bill/${bill._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { token, Authorization: `Bearer ${token}` } : {}),
        },
      });

      let result;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to delete invoice");
      }

      alert("Invoice deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Invoice deletion failed:", error);
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const money = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const isBillPaid = (bill) =>
    String(bill?.paymentStatus || "").trim().toLowerCase() === "paid";

  const getPaidAmount = (bill) => {
    const total = Number(bill?.total || 0);

    if (isBillPaid(bill)) return total;

    return Math.min(
      total,
      Number(bill?.advancePayment || 0) +
        Number(bill?.amountInWallet || 0)
    );
  };

  const getBalance = (bill) =>
    Math.max(0, Number(bill?.total || 0) - getPaidAmount(bill));

  return (
    <section className="border rounded-lg p-4">
      <h2 className="font-semibold text-lg mb-3">Billing</h2>

      <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
        <span className="text-gray-600">
          Present days: <b className="text-gray-900">{totalPresent}</b>
        </span>

        <span className="text-gray-600">
          Billed: <b className="text-gray-900">{alreadyBilled}</b>
        </span>

        <span className="text-gray-600">
          Remaining to bill:{" "}
          <b className={remainingSessions > 0 ? "text-blue-600" : "text-green-600"}>
            {remainingSessions}
          </b>
        </span>
      </div>

      <button
        onClick={() => goTo("/createBill")}
        disabled={remainingSessions === 0}
        className={`px-3 py-1 mb-2 text-sm border rounded ${
          remainingSessions === 0
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
      >
        Generate Bill
      </button>

      {remainingSessions === 0 && (
        <p className="text-xs text-gray-500 mb-2">
          All present days have been billed.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {!billing || billing.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 text-lg font-medium">
            No bills found for the selected filters.
          </div>
        ) : (
          billing.map((bill) => {
            const paid = isBillPaid(bill);
            const paidAmount = getPaidAmount(bill);
            const balance = getBalance(bill);

            return (
              <div
                key={bill?._id}
                className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold text-blue-600">
                      {bill?.billNumber}
                    </h2>
                    <span className="text-sm font-semibold text-gray-600">
                      {bill?.billType}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    Customer: {bill?.customer}
                  </p>

                  <p className="text-sm text-gray-600">
                    Customer ID: {patientDetail?.personalDetails?.patientId}
                  </p>

                  <p className="text-sm text-gray-600">
                    Date:{" "}
                    {bill?.date
                      ? new Date(bill.date).toLocaleDateString("en-GB")
                      : "-"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Payment Method: {bill?.status}
                  </p>

                  <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                    {editId === bill._id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          Payment Status:
                        </span>

                        <select
                          value={updateStatus}
                          onChange={(e) => setUpdateStatus(e.target.value)}
                          className="border px-2 py-1 rounded text-sm"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                        </select>

                        <button
                          disabled={updateStatus === bill?.paymentStatus}
                          onClick={() =>
                            handleStatusUpdate(bill._id, updateStatus)
                          }
                          className="px-2 py-1 rounded text-xs bg-green-600 text-white disabled:bg-gray-300"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p
                        className={`text-sm font-medium ${
                          paid ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        Payment Status: {bill?.paymentStatus || "Unpaid"}
                      </p>
                    )}

                    <button
                      title="Edit payment status"
                      onClick={() => {
                        setEditId(editId === bill._id ? null : bill._id);
                        setUpdateStatus(bill?.paymentStatus || "Unpaid");
                      }}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      {editId === bill._id ? (
                        <MdClose size={18} className="text-red-500" />
                      ) : (
                        <MdEdit size={18} className="text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800">Items:</h3>

                  <ul className="list-disc pl-5">
                    {(bill?.items || []).map((item, index) => (
                      <li key={item?._id || index} className="text-sm text-gray-700">
                        {item?.name} - Session: {item?.qty} × ₹
                        {money(item?.price)} = ₹
                        {money(Number(item?.qty || 0) * Number(item?.price || 0))}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Amount</span>
                    <b className="text-gray-900">₹{money(bill?.total)}</b>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Advance Paid</span>
                    <b className="text-gray-900">
                      ₹{money(bill?.advancePayment)}
                    </b>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Wallet Adjustment</span>
                    <b className="text-gray-900">
                      ₹{money(bill?.amountInWallet)}
                    </b>
                  </div>

                  <div className="flex justify-between border-t pt-3">
                    <span className="font-medium text-gray-700">
                      Amount Paid
                    </span>
                    <b className="text-green-700">₹{money(paidAmount)}</b>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      Remaining Balance
                    </span>
                    <b className={balance > 0 ? "text-red-700" : "text-green-700"}>
                      ₹{money(balance)}
                    </b>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleEditInvoice(bill)}
                    className="flex items-center justify-center gap-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white py-2 text-sm"
                  >
                    <MdOutlineEdit size={17} />
                    Edit Invoice
                  </button>

                  <button
                    onClick={() => handleDeleteInvoice(bill)}
                    disabled={deletingId === bill._id}
                    className="flex items-center justify-center gap-1 rounded-md bg-red-600 hover:bg-red-700 text-white py-2 text-sm disabled:opacity-50"
                  >
                    <MdDelete size={17} />
                    {deletingId === bill._id ? "Deleting..." : "Delete"}
                  </button>
                </div>

                <PDFDownloadLink
                  document={
                    <BillPdf
                      bill={{
                        ...bill,
                        paidAmount,
                        balanceRemaining: balance,
                      }}
                      patient={patientDetail?.personalDetails || {}}
                    />
                  }
                  fileName={`Bill-${bill?.billNumber}.pdf`}
                >
                  {({ loading }) => (
                    <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700">
                      {loading ? "Generating PDF..." : "Download PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default BillSection;
