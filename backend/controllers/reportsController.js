import billModel from "../models/billReportModels.js";
import expensesModel from "../models/expensesReportModels.js";
import inventoryModel from "../models/inventoryReportModels.js";
import Patient from "../models/patientModel.js";
import rentModel from "../models/rentReportModels.js";
import salaryModel from "../models/salaryReportModels.js";
import {
  toNum,
  matchesPeriod,
  matchesPeriodString,
} from "../utils/reportFilters.js";

// Effective purchase date for an inventory item. Older records (created before
// the per-item `date` field existed) have no date; bucket those by the parent
// document's createdAt — a stable, correct proxy — instead of dropping them or
// letting them float to "now".
const itemDate = (item, doc) => item?.date || doc?.createdAt;
const createBill = async (req, res) => {
  try {
    const { patientId, formData } = req.body;
    console.log("patient id", patientId);
    console.log("formData", formData);

    if (!patientId || !formData) {
      return res.status(400).json({
        success: false,
        message: "patientId and formData are required",
      });
    }
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const paidAmount =
      Number(formData.advancePayment) + Number(formData.amountInWallet);

    const remainingBalance =
      paidAmount > Number(formData.total)
        ? paidAmount - Number(formData.total)
        : 0;
    // console.log("remainingBalance", remainingBalance);

    // Days this bill covers. Trust the value the client sends, but fall back to
    // the first item row (the session/days row) so an out-of-date client can
    // never silently save 0 — this is what keeps the "remaining days" count correct.
    const sessionsBilled =
      Number(formData.sessionsBilled ?? formData.items?.[0]?.qty) || 0;

    const newBill = await billModel.create({
      patientId,
      ...formData,
      sessionsBilled,
      amountInWallet: remainingBalance,
      advancePayment:
        Number(formData.advancePayment) + Number(formData.amountInWallet),
    });

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      {
        $push: {
          billing: newBill._id,
        },
      },
      { new: true },
    );
    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill: newBill,
      patient: updatedPatient,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to create bill",
      error: err.message,
    });
  }
};

const getBill = async (req, res) => {
  try {
    const month = toNum(req.query.month);
    const year = toNum(req.query.year);

    let bills = await billModel.find().sort({ date: -1, createdAt: -1 });
    if (month || year) {
      bills = bills.filter((b) => matchesPeriod(b.date, month, year));
    }

    res.status(200).json({
      success: true,
      message: "Bills retrieved successfully",
      data: bills,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to retrieve bills",
      error: err.message,
    });
  }
};

const updateBillPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    if (!["Paid", "Unpaid"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status (Only Paid / Unpaid allowed)",
      });
    }

    // ✅ Find bill
    const bill = await billModel.findById(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // ✅ Update ONLY paymentStatus (safe PUT)
    bill.paymentStatus = status;

    await bill.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      bill,
    });
  } catch (error) {
    console.log("PUT update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteBill = async (req, res) => {
  try {
    const id = req.params.id;
    const bill = await billModel.findByIdAndDelete(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Clean up reference in patient's billing array
    if (bill.patientId) {
      await Patient.findByIdAndUpdate(bill.patientId, {
        $pull: { billing: bill._id },
      });
    }
    await Patient.updateMany(
      { billing: id },
      { $pull: { billing: id } }
    );

    res.status(200).json({
      success: true,
      message: "Bill deleted successfully",
      data: bill,
    });
  } catch (err) {
    console.log("Delete bill error:", err);
    res.status(400).json({
      success: false,
      message: "Failed to delete bill",
      error: err.message,
    });
  }
};

const createExpenses = async (req, res) => {
  try {
    const { ...formData } = req.body;
    console.log(formData);
    const newExpenses = new expensesModel(formData);
    const savedExpenses = await newExpenses.save();
    res.status(201).json({
      success: true,
      message: "Expenses created successfully",
      data: savedExpenses,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to create expenses",
      error: err.message,
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const month = toNum(req.query.month);
    const year = toNum(req.query.year);

    let expenses = await expensesModel.find().sort({ date: -1, createdAt: -1 });
    if (month || year) {
      expenses = expenses.filter((e) => matchesPeriod(e.date, month, year));
    }

    res.status(200).json({
      success: true,
      message: "Expenses retrieved successfully",
      data: expenses,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to retrieve expenses",
      error: err.message,
    });
  }
};

const createInventory = async (req, res) => {
  try {
    const { ...formData } = req.body;
    console.log(formData);
    const newInventory = new inventoryModel(formData);
    const savedInventory = await newInventory.save();
    res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      data: savedInventory,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to create inventory",
      error: err.message,
    });
  }
};

const getInventory = async (req, res) => {
  try {
    const month = toNum(req.query.month);
    const year = toNum(req.query.year);

    let inventory = await inventoryModel.find().sort({ createdAt: -1 });
    if (month || year) {
      // Inventory has no top-level date — filter by each item's purchase date
      // and recompute the doc total from only the matching items.
      inventory = inventory
        .map((doc) => {
          const o = doc.toObject();
          const items = (o.items || []).filter((it) =>
            matchesPeriod(itemDate(it, o), month, year),
          );
          const total = items.reduce(
            (s, it) => s + (it.quantity || 1) * (it.unitPrice || 0),
            0,
          );
          return { ...o, items, total };
        })
        .filter((o) => o.items.length > 0);
    }

    res.status(200).json({
      success: true,
      message: "Inventory retrieved successfully",
      data: inventory,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to retrieve inventory",
      error: err.message,
    });
  }
};

const createRent = async (req, res) => {
  try {
    const { ...formData } = req.body;
    console.log(formData);
    const newRent = new rentModel(formData);
    const savedRent = await newRent.save();
    res.status(201).json({
      success: true,
      message: "Rent created successfully",
      data: savedRent,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to create rent",
      error: err.message,
    });
  }
};

const getRent = async (req, res) => {
  try {
    const month = toNum(req.query.month);
    const year = toNum(req.query.year);

    let rents = await rentModel.find().sort({ dueDate: -1, createdAt: -1 });
    if (month || year) {
      rents = rents.filter((r) => matchesPeriod(r.dueDate, month, year));
    }

    res.status(200).json({
      success: true,
      message: "Rents retrieved successfully",
      data: rents,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to retrieve rents",
      error: err.message,
    });
  }
};

// const updateRentStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const validStatus = ["Paid", "Unpaid", "Pending"];
//     if (!validStatus.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value",
//       });
//     }

//     console.log(id , status);

//     const updatedRent = await rentModel.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true },
//     );

//     if (!updatedRent) {
//       return res.status(404).json({
//         success: false,
//         message: "Rent record not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Status updated successfully",
//       data: updatedRent,
//     });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

const updateRentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["Paid", "Unpaid", "Pending"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    console.log(id , status);

    const updated = await rentModel.findByIdAndUpdate(
      id,
      { $set: { status } }, // ✅ safer
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Rent not found",
      });
    }

    res.json({
      success: true,
      message: "Status updated",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const createSalary = async (req, res) => {
  try {
    const { ...formData } = req.body;
    console.log(formData);
    const newSalary = new salaryModel(formData);
    const savedSalary = await newSalary.save();
    res.status(201).json({
      success: true,
      message: "Salary created successfully",
      data: savedSalary,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to create salary",
      error: err.message,
    });
  }
};

const getSalary = async (req, res) => {
  try {
    const month = toNum(req.query.month);
    const year = toNum(req.query.year);

    let salaries = await salaryModel.find().sort({ createdAt: -1 });
    if (month || year) {
      // Each employee row carries its own "YYYY-MM" pay month — keep only the
      // matching rows and recompute the entry's totalSalary from them.
      salaries = salaries
        .map((doc) => {
          const o = doc.toObject();
          const employees = (o.employees || []).filter((e) =>
            matchesPeriodString(e.month, month, year),
          );
          const totalSalary = employees.reduce(
            (s, e) => s + (e.salary || 0),
            0,
          );
          return { ...o, employees, totalSalary };
        })
        .filter((o) => o.employees.length > 0);
    }

    res.status(200).json({
      success: true,
      message: "Salaries retrieved successfully",
      data: salaries,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to retrieve salaries",
      error: err.message,
    });
  }
};

const updateSalaryPaidStatus = async (req, res) => {
  try {
    const { entryId, empId } = req.params;
    const { paid } = req.body;

    const salary = await salaryModel.findById(entryId);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary entry not found",
      });
    }

    const employee = salary.employees.id(empId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // ✅ update field
    employee.paid = paid;

    await salary.save();

    res.status(200).json({
      success: true,
      message: "Paid status updated successfully",
      data: salary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Canonical financial summary (P&L) for a period — one authoritative place so
// every screen agrees on what "received", "pending", and "spent" mean.
const getSummary = async (req, res) => {
  try {
    const month = toNum(req.query.month);
    const year = toNum(req.query.year);
    const hasPeriod = Boolean(month || year);

    const [bills, expensesDocs, inventoryDocs, rentDocs, salaryDocs] =
      await Promise.all([
        billModel.find(),
        expensesModel.find(),
        inventoryModel.find(),
        rentModel.find(),
        salaryModel.find(),
      ]);

    // Received = full total of Paid bills + capped advances on Unpaid bills.
    const receivedOfBill = (b) => {
      const total = b.total || 0;
      return b.paymentStatus === "Paid"
        ? total
        : Math.min(b.advancePayment || 0, total);
    };

    const periodBills = hasPeriod
      ? bills.filter((b) => matchesPeriod(b.date, month, year))
      : bills;
    const billed = periodBills.reduce((s, b) => s + (b.total || 0), 0);
    const received = periodBills.reduce((s, b) => s + receivedOfBill(b), 0);
    const pending = billed - received;
    const wallet = periodBills.reduce((s, b) => s + (b.amountInWallet || 0), 0);

    const expenses = expensesDocs
      .filter((e) => !hasPeriod || matchesPeriod(e.date, month, year))
      .reduce((s, e) => s + (e.total || 0), 0);

    const inventory = inventoryDocs.reduce((s, doc) => {
      const items = (doc.items || []).filter(
        (it) => !hasPeriod || matchesPeriod(itemDate(it, doc), month, year),
      );
      return (
        s +
        items.reduce((a, it) => a + (it.quantity || 1) * (it.unitPrice || 0), 0)
      );
    }, 0);

    const rent = rentDocs
      .filter((r) => !hasPeriod || matchesPeriod(r.dueDate, month, year))
      .reduce((s, r) => s + (r.amount || 0), 0);

    const salary = salaryDocs.reduce((s, doc) => {
      const emps = (doc.employees || []).filter(
        (e) => !hasPeriod || matchesPeriodString(e.month, month, year),
      );
      return s + emps.reduce((a, e) => a + (e.salary || 0), 0);
    }, 0);

    const totalOutgoing = expenses + inventory + rent + salary;
    const netBalance = received - totalOutgoing;

    // Month-by-month trend for the selected year (or current year) to power a
    // simple bar chart on the dashboard.
    const trendYear = year || new Date().getUTCFullYear();
    const trend = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const rcv = bills.reduce(
        (s, b) =>
          matchesPeriod(b.date, m, trendYear) ? s + receivedOfBill(b) : s,
        0,
      );
      const exp = expensesDocs
        .filter((e) => matchesPeriod(e.date, m, trendYear))
        .reduce((a, e) => a + (e.total || 0), 0);
      const inv = inventoryDocs.reduce(
        (a, doc) =>
          a +
          (doc.items || [])
            .filter((it) => matchesPeriod(itemDate(it, doc), m, trendYear))
            .reduce((x, it) => x + (it.quantity || 1) * (it.unitPrice || 0), 0),
        0,
      );
      const rnt = rentDocs
        .filter((r) => matchesPeriod(r.dueDate, m, trendYear))
        .reduce((a, r) => a + (r.amount || 0), 0);
      const sal = salaryDocs.reduce(
        (a, doc) =>
          a +
          (doc.employees || [])
            .filter((e) => matchesPeriodString(e.month, m, trendYear))
            .reduce((x, e) => x + (e.salary || 0), 0),
        0,
      );
      const spent = exp + inv + rnt + sal;
      return { month: m, received: rcv, spent, net: rcv - spent };
    });

    res.status(200).json({
      success: true,
      message: "Summary computed successfully",
      data: {
        period: { month, year },
        income: { billed, received, pending, wallet },
        outgoing: { expenses, inventory, rent, salary },
        totalOutgoing,
        netBalance,
        trendYear,
        trend,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Failed to compute summary",
      error: err.message,
    });
  }
};

export {
  createBill,
  getBill,
  deleteBill,
  getSummary,
  updateBillPaymentStatus,
  createExpenses,
  getExpenses,
  createInventory,
  getInventory,
  createRent,
  getRent,
  updateRentStatus,
  createSalary,
  getSalary,
  updateSalaryPaidStatus,
};
