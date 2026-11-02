// import React from "react";

// const BillReview = ({ bill, onClose, onConfirm }) => {
//   if (
//     !bill?.billNumber ||
//     !bill?.billType ||
//     !bill?.customer ||
//     !bill?.date ||
//     !bill?.status ||
//     !bill?.paymentStatus ||
//     !bill?.items ||
//     !bill?.total
//   ) {
//     onClose();
//     alert("Please fill in all the required fields.");
//     return null;
//   }

//   const discount = bill?.discount || 0;

//   console.log(bill);
//   const totalAdvance =
//     Number(bill?.advancePayment) + Number(bill?.amountInWallet) || 0;

//   const remainingBalance =
//     (bill?.total - discount) > totalAdvance ? bill?.total - discount - totalAdvance : 0;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="bg-white w-full max-w-md rounded-xl p-5 shadow-lg">
//         {/* Header */}
//         <div className="mb-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-blue-600">
//               {bill?.billNumber}
//             </h2>
//             <span className="text-sm font-medium text-gray-600">
//               {bill?.billType}
//             </span>
//           </div>

//           <p className="text-sm text-gray-600">Customer: {bill?.customer}</p>
//           <p className="text-sm text-gray-600">
//             Date: {new Date(bill?.date).toLocaleDateString("en-GB")}
//           </p>

//           <p
//             className={`text-sm font-medium ${
//               bill?.status === "Cash" ? "text-red-500" : "text-green-600"
//             }`}
//           >
//             Status: {bill?.status}
//           </p>
//           <p
//             className={`text-sm font-medium ${
//               bill?.paymentStatus === "Unpaid" ? "text-red-500" : "text-green-600"
//             }`}
//           >
//             Payment Status: {bill?.paymentStatus}
//           </p>
//         </div>

//         {/* Items */}
//         <div className="mb-4">
//           <h3 className="font-semibold text-gray-800 mb-1">Items</h3>
//           <ul className="list-disc pl-5 space-y-1">
//             {bill?.items?.map((item, idx) => (
//               <li key={item._id || idx} className="text-sm text-gray-700">
//                 {item.name} — {item.qty.toLocaleString()} × ₹
//                 {item.price.toLocaleString()} = ₹
//                 {(item.qty * item.price).toLocaleString("en-IN", {
//                   minimumFractionDigits: 2,
//                   maximumFractionDigits: 2,
//                 })}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Amount Summary */}
//         <div className="space-y-3 border-t pt-3">
//           <div className="flex justify-between text-sm">
//             <span>Total Amount</span>
//             <span>{bill?.total} - {discount} = </span>
//             <span className="font-semibold">
//               ₹
//               {(bill?.total - discount).toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </span>
//           </div>

//           <div className="flex justify-between text-sm">
//             <span>Total Advance (In Violet + Advance Payment)</span>
//             <span className="font-semibold">
//               <span className="text-red-500 font-bold text-xl"> - </span>₹
//               {(totalAdvance || 0).toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </span>
//           </div>

//           <div className="flex justify-between text-base font-bold">
//             <span>Balance Remaining</span>
//             <span>
//               ₹
//               {remainingBalance.toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </span>
//           </div>
//           <div className="flex justify-between text-sm">
//             <span>Remaining Balance In Wallet </span>
//             <span className="font-semibold">
//               ₹
//               {bill?.total - discount - totalAdvance > 0
//                 ? 0
//                 : (totalAdvance - (bill?.total - discount)).toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//             </span>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-3 mt-5">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 rounded-lg bg-green-500 text-white"
//           >
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillReview;




import React from "react";
import {
  X,
  FileText,
  User,
  Calendar,
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

const BillReview = ({ bill, onClose, onConfirm }) => {
  if (!bill) return null;

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Bill calculations - same logic as CreateBill.jsx
  const actualTotal = Number(
    bill.actualTotal ?? bill.total ?? 0
  );

  const discount = Number(bill.discount || 0);

  const finalTotal = Math.max(
    0,
    Number(bill.total ?? actualTotal - discount)
  );

  const advancePayment = Number(bill.advancePayment || 0);
  const amountInWallet = Number(bill.amountInWallet || 0);

  const totalAvailablePayment =
    advancePayment + amountInWallet;

  // PAID = Full bill amount paid
  // UNPAID = Only advance + wallet considered paid
  const paidAmount =
    bill.paymentStatus === "Paid"
      ? finalTotal
      : Math.min(finalTotal, totalAvailablePayment);

  const balanceRemaining = Math.max(
    0,
    finalTotal - paidAmount
  );

  const remainingWallet = Math.max(
    0,
    totalAvailablePayment - finalTotal
  );

  // Validation
  const isValid =
    Boolean(bill.billNumber) &&
    Boolean(bill.billType) &&
    Boolean(bill.customer) &&
    Boolean(bill.date) &&
    Boolean(bill.status) &&
    Boolean(bill.paymentStatus) &&
    Array.isArray(bill.items) &&
    bill.items.length > 0 &&
    bill.items.every(
      (item) =>
        item.name?.trim() &&
        Number(item.qty) >= 0 &&
        Number(item.price) >= 0
    );

  const handleConfirm = () => {
    if (!isValid) {
      alert("Please fill in all required fields.");
      return;
    }

    onConfirm();
  };

  const isPaid = bill.paymentStatus === "Paid";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 md:px-7">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Review Invoice
              </h2>
              <p className="text-xs text-slate-500">
                Verify invoice details before confirmation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={21} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 md:p-7">

          {/* Invoice details */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Invoice Number
                </p>

                <h3 className="mt-1 text-xl font-bold text-blue-700">
                  {bill.billNumber}
                </h3>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                {bill.billType} Service
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="flex items-center gap-3">
                <User size={18} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Patient</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {bill.customer}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Invoice Date</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(
                      `${bill.date}T00:00:00`
                    ).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Payment Method</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {bill.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isPaid ? (
                  <CheckCircle2
                    size={18}
                    className="text-emerald-600"
                  />
                ) : (
                  <AlertCircle
                    size={18}
                    className="text-amber-600"
                  />
                )}

                <div>
                  <p className="text-xs text-slate-500">
                    Payment Status
                  </p>

                  <span
                    className={`text-sm font-bold ${
                      isPaid
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {bill.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mt-6">
            <h3 className="mb-3 font-bold text-slate-900">
              Service Details
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[440px] text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      Service
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {bill.items.map((item, index) => (
                    <tr key={item._id || index}>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {item.name}
                      </td>

                      <td className="px-4 py-3 text-center text-slate-600">
                        {Number(item.qty).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3 text-right text-slate-600">
                        ₹{formatAmount(item.price)}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        ₹
                        {formatAmount(
                          Number(item.qty) * Number(item.price)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-6 rounded-xl border border-slate-200 p-4 md:p-5">

            <h3 className="mb-4 font-bold text-slate-900">
              Payment Summary
            </h3>

            <div className="space-y-3">

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Service Amount
                </span>
                <span className="font-semibold text-slate-800">
                  ₹{formatAmount(actualTotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Discount
                </span>
                <span className="font-semibold text-red-500">
                  - ₹{formatAmount(discount)}
                </span>
              </div>

              <div className="flex justify-between border-t border-dashed border-slate-200 pt-3">
                <span className="font-bold text-slate-800">
                  Final Bill Amount
                </span>

                <span className="text-lg font-bold text-slate-900">
                  ₹{formatAmount(finalTotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-500">
                  <Wallet size={16} />
                  Wallet Adjustment
                </span>

                <span className="font-semibold text-slate-800">
                  ₹{formatAmount(amountInWallet)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Advance Entered
                </span>

                <span className="font-semibold text-slate-800">
                  ₹{formatAmount(advancePayment)}
                </span>
              </div>

              {/* Paid Amount */}
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">
                  TOTAL PAID AMOUNT
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  ₹{formatAmount(paidAmount)}
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  {isPaid
                    ? "Full bill amount considered paid"
                    : "Advance payment + wallet adjustment"}
                </p>
              </div>

              {/* Outstanding Balance */}
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs font-semibold text-red-600">
                  OUTSTANDING BALANCE
                </p>

                <p className="mt-1 text-2xl font-bold text-red-600">
                  ₹{formatAmount(balanceRemaining)}
                </p>
              </div>

              {/* Remaining wallet */}
              <div className="flex justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">
                  Remaining Wallet Balance
                </span>

                <span className="font-bold text-slate-800">
                  ₹{formatAmount(remainingWallet)}
                </span>
              </div>

            </div>
          </div>

          {/* Confirmation message */}
          <div
            className={`mt-5 flex items-start gap-3 rounded-xl p-4 ${
              isPaid
                ? "bg-emerald-50"
                : "bg-amber-50"
            }`}
          >
            {isPaid ? (
              <CheckCircle2
                size={20}
                className="shrink-0 text-emerald-600"
              />
            ) : (
              <AlertCircle
                size={20}
                className="shrink-0 text-amber-600"
              />
            )}

            <div>
              <p
                className={`text-sm font-bold ${
                  isPaid
                    ? "text-emerald-800"
                    : "text-amber-800"
                }`}
              >
                {isPaid
                  ? "Full payment confirmed"
                  : "Payment pending"}
              </p>

              <p
                className={`mt-1 text-xs ${
                  isPaid
                    ? "text-emerald-700"
                    : "text-amber-700"
                }`}
              >
                {isPaid
                  ? "The complete invoice amount will be recorded as paid."
                  : `₹${formatAmount(balanceRemaining)} remains outstanding after advance and wallet adjustment.`}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end md:px-7">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={17} />
            Confirm Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillReview;
