import Employee from "../models/employeeModels.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sanitizeEmployee from "../utils/sanitizeEmployee.js";
import { archiveForRecycleBin } from "../utils/archiveForRecycleBin.js";
import { encryptPassword, decryptPassword } from "../utils/cryptoUtils.js";

const addEmployee = async (req, res) => {
  const { name, role } = req.body;
  console.log("req.body add", req.body);
  try {
    // Check if employee with same name (case-insensitive) already exists
    const existingEmployee = await Employee.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ success: false, message: "Employee already exists" });
    }

    // Create and save new employee
    const newEmployee = new Employee({ name, role });
    await newEmployee.save();

    return res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: newEmployee,
    });
  } catch (err) {
    console.error("Error in addEmployee:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const getAllEmployee = async (req, res) => {
  try {
    const employees = await Employee.find()
      .select("-personalDetails.password -totp.secret -totp.lastCounter")
      .sort({ createdAt: -1 });
    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAttendance = async (req, res) => {
  const { empId, date, status } = req.body;
  const month = date.slice(0, 7);

  console.log("req.bosy attendenace", req?.body);

  try {
    const employee = await Employee.findById(empId);
    if (!employee)
      return res.json({ success: false, message: "Employee not found" });

    if (!employee?.attendance) employee.attendance = {};
    if (!employee?.attendance[month]) employee.attendance[month] = {};
    employee.attendance[month][date] = status;

    await employee.save();
    console.log("employee", employee?.attendance[month][date]);

    res.json({ success: true, message: "Attendance updated", data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      qualification,
      registrationNo,
      experience,
      contactNumber,
      email,
      password,
      workingBranch,
      status,
      employeeType,
      employeePost,
      joiningDate,
      exitDate,
    } = req.body;

    const loginEmployeeId = req.id;

    console.log("loginEmployeeId", loginEmployeeId);
    const loginEmployee = await Employee.findById(loginEmployeeId);

    if (!loginEmployee) {
      return res.status(401).json({
        success: false,
        message: "Employee not found",
      });
    }
    console.log("employee", loginEmployee);
    // ✅ Check admin using personalDetails.email
    if (loginEmployee.personalDetails.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: "Only admin can perform this action",
      });
    }

    console.log("login employee, , ,  , , ,", loginEmployee);

    console.log("create employee", req.body);

    if (
      !fullName ||
      !qualification ||
      experience === undefined ||
      experience === null ||
      !contactNumber ||
      !email ||
      !password ||
      !employeeType ||
      !workingBranch ||
      !status ||
      !joiningDate ||
      !employeeId
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (!/^[0-9]{10}$/.test(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact number",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedPassword = encryptPassword(password);

    const employee = await Employee.create({
      personalDetails: {
        employeeId,
        fullName,
        qualification,
        registrationNo,
        experience,
        contactNumber,
        email,
        password: hashedPassword,
        encryptedPassword,
        workingBranch,
        status,
        employeeType,
        employeePost,
        joiningDate,
        exitDate,
      },
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: sanitizeEmployee(employee),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select("-personalDetails.password -totp.secret -totp.lastCounter")
      .populate("patientLook.patientId")
      .populate({
        path:"attendance",
        options: { sort: { createdAt: -1 } },
      });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      employee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching patient",
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      qualification,
      registrationNo,
      experience,
      contactNumber,
      email,
      password,
      employeeType,
      employeePost,
      joiningDate,
      workingBranch,
      status,
      exitDate,
    } = req.body;

    const employeeExist = await Employee.findById(req.params.id).select(
      "+personalDetails.password +personalDetails.encryptedPassword",
    );
    if (!employeeExist) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // This update replaces personalDetails wholesale, so an omitted password
    // would wipe the stored credential. Keep the existing hash instead, and
    // only re-hash when the caller actually sends a new password.
    const nextPassword = password
      ? await bcrypt.hash(password, 10)
      : employeeExist.personalDetails.password;

    const nextEncryptedPassword = password
      ? encryptPassword(password)
      : employeeExist.personalDetails.encryptedPassword;

    const employee = await Employee.findByIdAndUpdate(req.params.id, {
      personalDetails: {
        employeeId,
        fullName,
        qualification,
        registrationNo,
        experience,
        contactNumber,
        email,
        password: nextPassword,
        encryptedPassword: nextEncryptedPassword,
        workingBranch,
        status,
        employeeType,
        employeePost,
        joiningDate,
        exitDate,
      },
    });
    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: sanitizeEmployee(employee),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching patient",
    });
  }
};

const deleteEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await archiveForRecycleBin({ label: `Employee: ${employee.personalDetails.fullName}`, records: [{ model: Employee, document: employee }], deletedBy: req.id });
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Employee moved to the recycle bin",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error delete patient",
    });
  }
};

const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const employee = await Employee.findOne({
      "personalDetails.email": email,
    }).select("+personalDetails.password +personalDetails.encryptedPassword");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const stored = employee.personalDetails.password;
    const isHashed = /^\$2[aby]\$/.test(stored);

    let valid;
    if (isHashed) {
      valid = await bcrypt.compare(password, stored);
    } else {
      // Legacy row still holding a plaintext password. Accept it once, then
      // upgrade it in place so the next login goes through bcrypt. Remove this
      // branch once scripts/hashEmployeePasswords.js has run everywhere.
      valid = stored === password;
      if (valid) {
        // updateOne, not save(): save() revalidates the whole document, so a
        // row with pre-existing invalid data could never log in again.
        await Employee.updateOne(
          { _id: employee._id },
          { $set: { "personalDetails.password": await bcrypt.hash(password, 10) } },
        );
        console.warn(
          `Upgraded plaintext password to bcrypt for ${employee.personalDetails.employeeId}`,
        );
      }
    }

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Populate encryptedPassword if missing, so admin can securely view it
    if (!employee.personalDetails?.encryptedPassword) {
      const enc = encryptPassword(password);
      if (enc) {
        await Employee.updateOne(
          { _id: employee._id },
          { $set: { "personalDetails.encryptedPassword": enc } },
        );
      }
    }

    const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      employee: sanitizeEmployee(employee),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching employee",
    });
  }
};

/**
 * Double-Lock password reveal: Admin confirms their own admin password
 * before decrypting and viewing the employee's credentials.
 */
const revealEmployeePassword = async (req, res) => {
  try {
    const { adminPassword } = req.body;
    if (!adminPassword) {
      return res.status(400).json({
        success: false,
        message: "Admin password is required to reveal this credential",
      });
    }

    // 1. Verify caller is the admin and check admin password
    const admin = await Employee.findById(req.id).select("+personalDetails.password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }

    const storedAdminPass = admin.personalDetails?.password;
    const isHashed = /^\$2[aby]\$/.test(storedAdminPass);
    const validAdmin = isHashed
      ? await bcrypt.compare(adminPassword, storedAdminPass)
      : storedAdminPass === adminPassword;

    if (!validAdmin) {
      return res.status(401).json({
        success: false,
        message: "Incorrect admin password. Verification failed.",
      });
    }

    // 2. Fetch the target employee's encrypted password
    const targetEmployee = await Employee.findById(req.params.id).select(
      "+personalDetails.password +personalDetails.encryptedPassword",
    );

    if (!targetEmployee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Check if reversible encrypted copy exists
    if (targetEmployee.personalDetails?.encryptedPassword) {
      const decrypted = decryptPassword(targetEmployee.personalDetails.encryptedPassword);
      if (decrypted) {
        return res.status(200).json({
          success: true,
          password: decrypted,
        });
      }
    }

    // Check if legacy plaintext password exists
    const stored = targetEmployee.personalDetails?.password;
    if (stored && !/^\$2[aby]\$/.test(stored)) {
      return res.status(200).json({
        success: true,
        password: stored,
      });
    }

    // If only one-way bcrypt hash is present
    return res.status(200).json({
      success: true,
      isHashedOnly: true,
      message:
        "This employee password was created with a legacy one-way hash and cannot be decoded. You can set a new password by clicking 'Edit details'.",
    });
  } catch (error) {
    console.error("Error in revealEmployeePassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  createEmployee,
  addEmployee,
  getAllEmployee,
  updateAttendance,
  getEmployeeById,
  updateEmployee,
  deleteEmployeeById,
  loginEmployee,
  revealEmployeePassword,
};
