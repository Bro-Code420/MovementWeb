// import { Text, View, StyleSheet } from "@react-pdf/renderer";
// import PdfTemplate from "./PdfTemplate";
// import { useEffect } from "react";

// const styles = StyleSheet.create({
//   section: {
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 14,
//     marginBottom: 8,
//     fontWeight: "bold",
//   },

//   /* ===== Patient Grid ===== */
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   col: {
//     width: "50%",
//     marginBottom: 4,
//   },
//   row: {
//     fontSize: 11,
//     marginBottom: 3,
//   },
//   label: {
//     fontWeight: "bold",
//   },

//   /* ===== Table ===== */
//   table: {
//     borderWidth: 1,
//     borderColor: "#000",
//   },
//   tableRow: {
//     flexDirection: "row",
//   },
//   th: {
//     flex: 1,
//     padding: 6,
//     fontWeight: "bold",
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//   },
//   td: {
//     flex: 1,
//     padding: 6,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//   },
// });

// const BillPdf = ({ bill, patient }) => {
//   useEffect(() => {
//     if (!bill || !patient) return;
//   }, [bill, patient]);

//   const dueAmount = Math.max(0, bill.total - bill.advancePayment);

//   return (
//     <PdfTemplate
//       showHeader={true}
//       showRightHeaderContent={false}
//       showSignature={false}
//       showFooter={true}
//     >
//       {/* ===== Patient Details ===== */}
//       <View style={styles.section}>
//         <Text style={styles.title}>Patient Details</Text>

//         <View style={styles.grid}>
//           <View style={styles.col}>
//             <Text style={styles.row}>
//               <Text style={styles.label}>Patient ID:</Text> {patient.patientId}
//             </Text>
//           </View>

//           <View style={styles.col}>
//             <Text style={styles.row}>
//               <Text style={styles.label}>Name:</Text> {patient.name}
//             </Text>
//           </View>

//           <View style={styles.col}>
//             <Text style={styles.row}>
//               <Text style={styles.label}>Age:</Text> {patient.age}
//             </Text>
//           </View>

//           <View style={styles.col}>
//             <Text style={styles.row}>
//               <Text style={styles.label}>Gender:</Text> {patient.gender}
//             </Text>
//           </View>

//           <View style={styles.col}>
//             <Text style={styles.row}>
//               <Text style={styles.label}>Contact:</Text> {patient.contactNumber}
//             </Text>
//           </View>

//           <View style={styles.col}>
//             <Text style={styles.row}>
//               <Text style={styles.label}>Address:</Text> {patient.address}
//             </Text>
//           </View>

//           <View style={{ width: "100%" }}>
//             <Text style={styles.row}>
//               <Text style={styles.label}>Chief Complaint:</Text>{" "}
//               {patient.chiefComplaint}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* ===== Billing Details ===== */}
//       <View style={styles.section}>
//         <Text style={styles.title}>Billing Details</Text>

//         <Text style={styles.row}>
//           <Text style={styles.label}>Bill No:</Text> {bill.billNumber}
//         </Text>

//         <Text style={styles.row}>
//           <Text style={styles.label}>Bill Type:</Text> {bill.billType}
//         </Text>

//         <Text style={styles.row}>
//           <Text style={styles.label}>Date:</Text>{" "}
//           {new Date(bill.date).toLocaleDateString("en-GB")}
//         </Text>

//         <Text style={styles.row}>
//           <Text style={styles.label}>Payment Mode:</Text> {bill.status}
//         </Text>
//         <Text style={styles.row}>
//           <Text style={styles.label}>Payment Status:</Text>{" "}
//           {bill?.paymentStatus}
//         </Text>
//       </View>

//       {/* ===== Items Table ===== */}
//       <View style={[styles.section, styles.table]}>
//         <View style={styles.tableRow}>
//           <Text style={styles.th}>Service Name</Text>
//           <Text style={styles.th}>Number Of Service</Text>
//           <Text style={styles.th}>Rate</Text>
//           <Text style={styles.th}>Amount</Text>
//         </View>

//         {bill.items.map((item, i) => (
//           <View key={i} style={styles.tableRow}>
//             <Text style={styles.td}>{item.name}</Text>
//             <Text style={styles.td}>{item.qty}</Text>
//             <Text style={styles.td}>Rs. {item.price}</Text>
//             <Text style={styles.td}>Rs. {item.qty * item.price}</Text>
//           </View>
//         ))}
//       </View>

//       {/* ===== Payment Summary ===== */}
//       <View style={styles.section}>
//         <Text style={styles.row}>
//           <Text style={styles.label}>Total Amount:</Text> Rs. {bill.total}
//         </Text>

//         <Text style={styles.row}>
//           <Text style={styles.label}>Total Advance Amount:</Text> Rs.{" "}
//           {bill.advancePayment + bill.amountInWallet}
//         </Text>

//         {/* <Text style={styles.row}>
//           <Text style={styles.label}>Wallet Balance:</Text> Rs.{" "}
//           {bill.amountInWallet}
//         </Text> */}

//         <Text style={styles.row}>
//           <Text style={styles.label}>Remaining Balance</Text>{" "}
//           Rs. {dueAmount}
//         </Text>

//         {bill.amountInWallet > 0 && (
//           <Text style={{ fontSize: 10, marginTop: 6 }}>
//             * Rs. {bill.amountInWallet} has been added to wallet for future
//             bills.
//           </Text>
//         )}
//       </View>
//     </PdfTemplate>
//   );
// };

// export default BillPdf;



import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import PdfTemplate from "./PdfTemplate";

const styles = StyleSheet.create({
  pageContent: {
    paddingHorizontal: 5,
    paddingTop: 2,
    paddingBottom: 5,
  },

  invoiceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003A80",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1,
  },

  section: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 10,
    marginBottom: 7,
    fontWeight: "bold",
    color: "#003A80",
    textTransform: "uppercase",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  col: {
    width: "50%",
    marginBottom: 6,
    paddingRight: 8,
  },

  row: {
    fontSize: 9,
    marginBottom: 5,
    color: "#334155",
  },

  label: {
    fontWeight: "bold",
    color: "#1e293b",
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#dbe3ec",
    marginVertical: 7,
  },

  table: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginTop: 3,
  },

  tableRow: {
    flexDirection: "row",
  },

  th: {
    flex: 1,
    padding: 7,
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#003A80",
    textAlign: "left",
  },

  td: {
    flex: 1,
    padding: 7,
    fontSize: 8,
    color: "#334155",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  paymentSection: {
    marginTop: 10,
    marginLeft: "auto",
    width: "55%",
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  paymentLabel: {
    fontSize: 8,
    color: "#64748b",
  },

  paymentValue: {
    fontSize: 8,
    color: "#1e293b",
  },

  totalRow: {
    borderTopWidth: 1.5,
    borderTopColor: "#003A80",
    paddingTop: 8,
    marginTop: 4,
  },

  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#003A80",
  },

  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#003A80",
  },

  walletNote: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 6,
  },
});

const formatCurrency = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const BillPdf = ({ bill = {}, patient = {} }) => {
  const items = Array.isArray(bill.items) ? bill.items : [];

  const actualTotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.qty || 0) * Number(item.price || 0),
    0
  );

  // bill.total is already after discount in CreateBill.jsx.
  const finalTotal = Math.max(
    0,
    Number(bill.total ?? actualTotal) || 0
  );

  const discount =
    bill.discount !== undefined
      ? Math.max(0, Number(bill.discount) || 0)
      : Math.max(0, actualTotal - finalTotal);

  const advancePayment = Math.max(
    0,
    Number(bill.advancePayment || 0)
  );

  const wallet = Math.max(
    0,
    Number(bill.amountInWallet || 0)
  );

  const isPaid =
    String(bill.paymentStatus || "")
      .trim()
      .toLowerCase() === "paid";

  const totalPaid = isPaid
    ? finalTotal
    : Math.min(finalTotal, advancePayment + wallet);

  const dueAmount = isPaid
    ? 0
    : Math.max(0, finalTotal - totalPaid);

  const date = bill.date
    ? new Date(bill.date).toLocaleDateString("en-GB")
    : "N/A";

  return (
    <PdfTemplate
      showHeader={true}
      showRightHeaderContent={false}
      showSignature={false}
      showFooter={true}
    >
      <View style={styles.pageContent} wrap={false}>

        {/* INVOICE TITLE */}
        <Text style={styles.invoiceTitle}>
          INVOICE
        </Text>

        {/* PATIENT DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Patient Details
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Patient ID: </Text>
                {patient?.patientId || "N/A"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Name: </Text>
                {patient?.name || bill.customer || "N/A"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Age: </Text>
                {patient?.age || "N/A"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Gender: </Text>
                {patient?.gender || "N/A"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Contact: </Text>
                {patient?.contactNumber || "N/A"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Address: </Text>
                {patient?.address || "N/A"}
              </Text>
            </View>

            <View style={{ width: "100%" }}>
              <Text style={styles.row}>
                <Text style={styles.label}>
                  Chief Complaint:{" "}
                </Text>
                {patient?.chiefComplaint || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* BILLING DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Billing Details
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Bill No: </Text>
                {bill.billNumber || "N/A"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Bill Type: </Text>
                {bill.billType || "N/A"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Date: </Text>
                {date}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>Payment Mode: </Text>
                {bill.status || "N/A"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.row}>
                <Text style={styles.label}>
                  Payment Status:{" "}
                </Text>
                {isPaid ? "Paid" : "Unpaid"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ITEMS TABLE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Billing Items
          </Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.th}>Service Name</Text>
              <Text style={styles.th}>Sessions</Text>
              <Text style={styles.th}>Rate</Text>
              <Text style={styles.th}>Amount</Text>
            </View>

            {items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.td}>
                  {item.name || "Service"}
                </Text>

                <Text style={styles.td}>
                  {Number(item.qty || 0)}
                </Text>

                <Text style={styles.td}>
                  {formatCurrency(item.price)}
                </Text>

                <Text style={styles.td}>
                  {formatCurrency(
                    Number(item.qty || 0) *
                    Number(item.price || 0)
                  )}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* PAYMENT SUMMARY */}
        <View style={styles.paymentSection}>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Actual Bill Amount
            </Text>
            <Text style={styles.paymentValue}>
              {formatCurrency(actualTotal)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Discount
            </Text>
            <Text style={styles.paymentValue}>
              - {formatCurrency(discount)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Wallet Adjustment
            </Text>
            <Text style={styles.paymentValue}>
              {formatCurrency(wallet)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Advance Payment
            </Text>
            <Text style={styles.paymentValue}>
              {formatCurrency(advancePayment)}
            </Text>
          </View>

          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>
              Total Amount
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrency(finalTotal)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Amount Paid
            </Text>
            <Text style={styles.paymentValue}>
              {formatCurrency(totalPaid)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Remaining Balance
            </Text>
            <Text style={styles.paymentValue}>
              {formatCurrency(dueAmount)}
            </Text>
          </View>
        </View>

        {wallet > 0 && (
          <Text style={styles.walletNote}>
            * Wallet adjustment: {formatCurrency(wallet)}
          </Text>
        )}

      </View>
    </PdfTemplate>
  );
};

export default BillPdf;
