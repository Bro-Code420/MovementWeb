import express from "express";
import {
  createEmployee,
  addEmployee,
  getAllEmployee,
  updateAttendance,
  getEmployeeById,
  updateEmployee,
  deleteEmployeeById,
  loginEmployee,
  revealEmployeePassword,
} from "../controllers/employeeController.js";
import employeeAuth from "../middleware/employeeAuth.js";
import adminOnly from "../middleware/adminOnly.js";
const router = express.Router();

// Add employee
router.post("/addEmployee", employeeAuth, adminOnly, addEmployee);

// Update attendance
// Superseded by POST /api/attendance/markEmployee, which is admin-gated and
// writes proper Attendance records. Kept reachable for any old client, but
// no longer open to the world.
router.post("/update-attendance", employeeAuth, adminOnly, updateAttendance);

// create employee
router.post("/createEmployee", employeeAuth, adminOnly, createEmployee);

// Get all employees
router.get("/getAllEmployee", employeeAuth, adminOnly, getAllEmployee);

// get employee by ID
router.get("/getEmployeeById/:id", employeeAuth, adminOnly, getEmployeeById);

// update by id
router.put("/updateEmployee/:id", employeeAuth, adminOnly, updateEmployee);

// reveal employee password (double-lock: requires admin password verification)
router.post("/revealPassword/:id", employeeAuth, adminOnly, revealEmployeePassword);

// delete employee
router.delete("/deleteEmployee/:id", employeeAuth, adminOnly, deleteEmployeeById);

// for login employee
router.post("/loginEmployee" , loginEmployee);


export default router;
