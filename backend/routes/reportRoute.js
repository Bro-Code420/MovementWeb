import express from 'express';
import {
  createBill,
  getBill,
  deleteBill,
  createExpenses,
  createInventory,
  createRent,
  createSalary,
  getExpenses,
  getInventory,
  getRent,
  getSalary,
  getSummary,
  updateBillPaymentStatus,
  updateRentStatus,
  updateSalaryPaidStatus,
} from '../controllers/reportsController.js';

import employeeAuth from '../middleware/employeeAuth.js';
import adminOnly from '../middleware/adminOnly.js';

const reportRouter = express.Router();

reportRouter.post("/bill", employeeAuth, createBill);
reportRouter.post("/expenses", employeeAuth, adminOnly, createExpenses);
reportRouter.post("/inventory", employeeAuth, adminOnly, createInventory);
reportRouter.post("/rent", employeeAuth, adminOnly, createRent);
reportRouter.post("/salary", employeeAuth, adminOnly, createSalary);

reportRouter.get("/bill", employeeAuth, adminOnly, getBill);
reportRouter.get("/expenses", employeeAuth, adminOnly, getExpenses);    
reportRouter.get("/inventory", employeeAuth, adminOnly, getInventory);
reportRouter.get("/rent", employeeAuth, adminOnly, getRent);
reportRouter.get("/salary", employeeAuth, adminOnly, getSalary);
reportRouter.get("/summary", employeeAuth, adminOnly, getSummary);

reportRouter.put("/rent/:id", employeeAuth, adminOnly, updateRentStatus);
reportRouter.put("/salary/:entryId/:empId", employeeAuth, adminOnly, updateSalaryPaidStatus);
reportRouter.put("/bill/:id", employeeAuth, updateBillPaymentStatus);
reportRouter.delete("/bill/:id", employeeAuth, deleteBill);

export default reportRouter;