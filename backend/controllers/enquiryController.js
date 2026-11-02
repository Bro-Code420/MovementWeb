// import enquiryModel from "../models/enquiryModels.js";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";
// import Patient from "../models/patientModel.js";
// import TreatmentPlan from "../models/treatmentPlanModels.js";
// import Attendance from "../models/attendanceModel.js";
// import Bill from "../models/billReportModels.js";
// import NeurologicalForm from "../models/neurologicalAssessmentModels.js";
// import MusculoskeletalForm from "../models/musculoskeletalAssessmentModels.js";
// import ObesityForm from "../models/obesityAssessmentModels.js";
// import PilatesPhysioForm from "../models/pilatesAssessmentModels.js";
// import { archiveForRecycleBin } from "../utils/archiveForRecycleBin.js";

// // Create token based on contactNumber
// const createToken = (contactNumber) => {
//   return jwt.sign({ contactNumber }, process.env.JWT_SECRET);
// };

// // Route for creating an enquiry
// const createEnquiry = async (req, res) => {
//   console.log("response inside backend", req.body);
//   try {
//     const {
//       patientName,
//       gender,
//       age,
//       occupation,
//       contactNumber,
//       email,
//     } = req.body;

//     // Check if contact number already exists
//     const existing = await enquiryModel.findOne({ contactNumber });
//     if (existing) {
//       return res
//         .status(400)
//         .json({ message: "Contact number already exists." });
//     }

//     // Create a new enquiry document
//     const newEnquiry = new enquiryModel({
//       patientName,
//       gender,
//       age,
//       occupation,
//       contactNumber,
//       email,
//     });

//     // Save the enquiry to the database
//     await newEnquiry.save();

//     // Generate JWT token based on contact number
//     const token = createToken(contactNumber);

//     // Respond with success message and the generated token
//     res.status(201).json({
//       success: true,
//       message: "Enquiry submitted successfully!",
//       data: newEnquiry,
//       token: token, // Return the token to the client
//     });
//   } catch (error) {
//     console.error("Error in createEnquiry:", error);
//     res.status(500).json({ success: false, message: "Server error", error });
//   }
// };

// // const getEnquiry = async (req, res)=>{
// //   try{
// //     const enquiries = await enquiryModel.find().populate("patientId");
// //     res.status(200).json({ enquiries });
// //   }catch(err){
// //     console.log(err);
// //   }
// // }

// const getEnquiry = async (req, res) => {
//   try {
//     const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
//     const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 100);

//     const activeStatus = req.query.activeStatus || "all";
//     const patientStatus = req.query.patientStatus || "all";
//     const search = req.query.search?.trim() || "";
//     const sortBy = req.query.sortBy === "oldest" ? "oldest" : "newest";

//     const query = {};

//     if (activeStatus === "lead" || activeStatus === "patient") {
//       query.enquiryStatus = activeStatus;
//     }

//     if (search) {
//       const searchRegex = new RegExp(search, "i");
//       query.$or = [
//         { patientName: searchRegex },
//         { contactNumber: searchRegex },
//         { email: searchRegex },
//       ];
//     }

//     let enquiries = await enquiryModel
//       .find(query)
//       .populate({ path: "patientId", select: "personalDetails" })
//       .sort({ createdAt: sortBy === "newest" ? -1 : 1 })
//       .lean();

//     enquiries = enquiries.filter((enquiry) => {
//       const status = enquiry?.patientId?.personalDetails?.patientStatus;

//       // ALL tab: hide inactive patients
//       if (activeStatus === "all") {
//         return !(enquiry.enquiryStatus === "patient" && status === false);
//       }

//       if (activeStatus === "patient") {
//         if (patientStatus === "active") return status === true;
//         if (patientStatus === "inactive") return status === false;
//       }

//       return true;
//     });

//     if (search) {
//       const term = search.toLowerCase();

//       enquiries = enquiries.filter((enquiry) => {
//         const patientCode = enquiry?.patientId?.personalDetails?.patientId
//           ?.toLowerCase()
//           ?.includes(term);

//         const name = enquiry?.patientName?.toLowerCase()?.includes(term);
//         const phone = enquiry?.contactNumber?.includes(term);
//         const email = enquiry?.email?.toLowerCase()?.includes(term);

//         return patientCode || name || phone || email;
//       });
//     }

//     const totalEnquiries = enquiries.length;
//     const totalPages = Math.ceil(totalEnquiries / limit) || 1;
//     const skip = (page - 1) * limit;

//     const paginatedEnquiries = enquiries.slice(skip, skip + limit);

//     res.status(200).json({
//       success: true,
//       enquiries: paginatedEnquiries,
//       pagination: {
//         currentPage: page,
//         totalPages,
//         totalEnquiries,
//         limit,
//         hasPrevPage: page > 1,
//         hasNextPage: page < totalPages,
//       },
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching enquiries",
//     });
//   }
// };


// const getPatientAttendanceEnquiry = async (req, res) => {
//   try {
//     const enquiries = await enquiryModel
//       .find({ enquiryStatus: "patient" })
//       .select("patientName updatedAt patientId")
//       .populate({
//         path: "patientId",
//         select: "personalDetails attendance",
//         populate: {
//           path: "attendance",
//           select: "date status",
//         },
//       });

//     res.status(200).json({ enquiries });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error fetching enquiries" });
//   }
// };

// const getPersonalDetails = async (req, res) => {
//   try {
//     const contactNumber = req?.contactNumber;
//     const enquiryPersonalDetails = await enquiryModel?.find({ contactNumber });

//     res.status(200).json({ enquiryPersonalDetails });
//   } catch (err) {
//     console.log(err);
//   }
// };


// const updatedEnquiry = async (req, res) => {
//   try {
//     const enquiry = await enquiryModel.findById(req.params.id);
//     if (!enquiry) {
//       return res.status(404).json({ message: "Enquiry not found" });
//     }
//     const updatedEnquiry = await enquiryModel.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.status(200).json(updatedEnquiry);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // const deleteEnquiryById = async (req, res) => {
// //   try {
// //     const enquiry = await enquiryModel.findById(req.params.id);
// //     if (!enquiry) {
// //       return res.status(404).json({ message: "Enquiry not found" });
// //     }

// //     console.log("enquiry", enquiry);

// //     // await enquiryModel.findByIdAndDelete(req.params.id);
    
// //     // if(enquiry.enquiryStatus === "patient"){
// //     // }
// //     // res.status(200).json({ success: true,  message: "Enquiry deleted successfully" });

// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// const deleteEnquiryById = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const enquiry = await enquiryModel.findById(req.params.id).session(session);

//     if (!enquiry) {
//       await session.abortTransaction();
//       return res.status(404).json({
//         success: false,
//         message: "Enquiry not found",
//       });
//     }

//     const records = [{ model: enquiryModel, document: enquiry }];

//     // Preserve a patient's complete history as one restorable recycle-bin item.
//     if (enquiry.enquiryStatus === "patient" && enquiry.patientId) {
//       const patientId = enquiry.patientId;
//       const related = await Promise.all([
//         Patient.findById(patientId).session(session),
//         NeurologicalForm.find({ patientId }).session(session),
//         MusculoskeletalForm.find({ patientId }).session(session),
//         ObesityForm.find({ patientId }).session(session),
//         PilatesPhysioForm.find({ patientId }).session(session),
//         TreatmentPlan.find({ patientId }).session(session),
//         Attendance.find({ id: patientId }).session(session),
//         Bill.find({ patientId }).session(session),
//       ]);
//       const [patient, neurological, musculoskeletal, obesity, pilates, plans, attendance, bills] = related;
//       for (const [model, docs] of [[Patient, patient ? [patient] : []], [NeurologicalForm, neurological], [MusculoskeletalForm, musculoskeletal], [ObesityForm, obesity], [PilatesPhysioForm, pilates], [TreatmentPlan, plans], [Attendance, attendance], [Bill, bills]]) {
//         records.push(...docs.map((document) => ({ model, document })));
//       }
//     }

//     await archiveForRecycleBin({ label: `Enquiry: ${enquiry.patientName}`, records, deletedBy: req.id, session });
//     const grouped = new Map();
//     for (const record of records) grouped.set(record.model, [...(grouped.get(record.model) || []), record.document._id]);
//     for (const [model, ids] of grouped) await model.deleteMany({ _id: { $in: ids } }, { session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       success: true,
//       message: "Enquiry and related records moved to the recycle bin",
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error("Cascade delete error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during deletion",
//     });
//   }
// };

// export { createEnquiry, getEnquiry , getPatientAttendanceEnquiry , getPersonalDetails , updatedEnquiry  , deleteEnquiryById };




import enquiryModel from "../models/enquiryModels.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Patient from "../models/patientModel.js";
import TreatmentPlan from "../models/treatmentPlanModels.js";
import Attendance from "../models/attendanceModel.js";
import Bill from "../models/billReportModels.js";
import NeurologicalForm from "../models/neurologicalAssessmentModels.js";
import MusculoskeletalForm from "../models/musculoskeletalAssessmentModels.js";
import ObesityForm from "../models/obesityAssessmentModels.js";
import PilatesPhysioForm from "../models/pilatesAssessmentModels.js";
import { archiveForRecycleBin } from "../utils/archiveForRecycleBin.js";

// Create token based on contactNumber
const createToken = (contactNumber) => {
  return jwt.sign(
    { contactNumber },
    process.env.JWT_SECRET
  );
};

// Create a new enquiry
const createEnquiry = async (req, res) => {
  console.log("response inside backend", req.body);

  try {
    const {
      patientName,
      gender,
      age,
      occupation,
      contactNumber,
      email,
    } = req.body;

    // Check if contact number already exists
    const existing = await enquiryModel.findOne({ contactNumber });

    if (existing) {
      return res.status(400).json({
        message: "Contact number already exists.",
      });
    }

    // Create new enquiry
    const newEnquiry = new enquiryModel({
      patientName,
      gender,
      age,
      occupation,
      contactNumber,
      email,
    });

    await newEnquiry.save();

    // Generate JWT token
    const token = createToken(contactNumber);

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully!",
      data: newEnquiry,
      token,
    });
  } catch (error) {
    console.error("Error in createEnquiry:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

// Get enquiries with pagination, filtering and search
const getEnquiry = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 9, 1),
      100
    );

    const activeStatus = req.query.activeStatus || "all";
    const patientStatus = req.query.patientStatus || "all";
    const search = req.query.search?.trim() || "";
    const sortBy =
      req.query.sortBy === "oldest" ? "oldest" : "newest";

    const query = {};

    // Filter by enquiry type
    if (
      activeStatus === "lead" ||
      activeStatus === "patient"
    ) {
      query.enquiryStatus = activeStatus;
    }

    // IMPORTANT:
    // Do not apply search in MongoDB here.
    // Patient ID is inside populated patientId.personalDetails,
    // so search is performed after population.

    // Fetch enquiries
    let enquiries = await enquiryModel
      .find(query)
      .populate({
        path: "patientId",
        select: "personalDetails",
      })
      .sort({
        createdAt: sortBy === "newest" ? -1 : 1,
      })
      .lean();

    // Apply active/inactive patient filters
    enquiries = enquiries.filter((enquiry) => {
      const status =
        enquiry?.patientId?.personalDetails?.patientStatus;

      if (activeStatus === "patient") {
        if (patientStatus === "active") {
          return status === true;
        }

        if (patientStatus === "inactive") {
          return status === false;
        }
      }

      // ALL tab includes active and inactive patients
      return true;
    });

    // Search by Patient ID, Name, Contact Number and Email
    if (search) {
      const term = search.toLowerCase().trim();

      enquiries = enquiries.filter((enquiry) => {
        const patientCode = String(
          enquiry?.patientId?.personalDetails?.patientId || ""
        ).toLowerCase();

        const name = String(
          enquiry?.patientName || ""
        ).toLowerCase();

        const phone = String(
          enquiry?.contactNumber || ""
        ).toLowerCase();

        const email = String(
          enquiry?.email || ""
        ).toLowerCase();

        return (
          patientCode.includes(term) ||
          name.includes(term) ||
          phone.includes(term) ||
          email.includes(term)
        );
      });
    }

    // Calculate total after applying filters and search
    const totalEnquiries = enquiries.length;

    const totalPages =
      Math.ceil(totalEnquiries / limit) || 1;

    const skip = (page - 1) * limit;

    // Apply pagination
    const paginatedEnquiries = enquiries.slice(
      skip,
      skip + limit
    );

    res.status(200).json({
      success: true,
      enquiries: paginatedEnquiries,
      pagination: {
        currentPage: page,
        totalPages,
        totalEnquiries,
        limit,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (err) {
    console.error("Error fetching enquiries:", err);

    res.status(500).json({
      success: false,
      message: "Error fetching enquiries",
    });
  }
};

// Get patient enquiries with attendance
const getPatientAttendanceEnquiry = async (req, res) => {
  try {
    const enquiries = await enquiryModel
      .find({ enquiryStatus: "patient" })
      .select("patientName updatedAt patientId")
      .populate({
        path: "patientId",
        select: "personalDetails attendance",
        populate: {
          path: "attendance",
          select: "date status",
        },
      });

    res.status(200).json({ enquiries });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error fetching enquiries",
    });
  }
};

// Get personal details
const getPersonalDetails = async (req, res) => {
  try {
    const contactNumber = req?.contactNumber;

    const enquiryPersonalDetails = await enquiryModel?.find({
      contactNumber,
    });

    res.status(200).json({
      enquiryPersonalDetails,
    });
  } catch (err) {
    console.log(err);
  }
};

// Update enquiry
const updatedEnquiry = async (req, res) => {
  try {
    const enquiry = await enquiryModel.findById(
      req.params.id
    );

    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    const updatedEnquiry = await enquiryModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedEnquiry);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete enquiry and archive related patient records
const deleteEnquiryById = async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const enquiry = await enquiryModel
      .findById(req.params.id)
      .session(session);

    if (!enquiry) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    const records = [
      {
        model: enquiryModel,
        document: enquiry,
      },
    ];

    // Preserve patient's complete history
    // as one restorable recycle-bin item
    if (
      enquiry.enquiryStatus === "patient" &&
      enquiry.patientId
    ) {
      const patientId = enquiry.patientId;

      const related = await Promise.all([
        Patient.findById(patientId).session(session),
        NeurologicalForm.find({ patientId }).session(session),
        MusculoskeletalForm.find({ patientId }).session(session),
        ObesityForm.find({ patientId }).session(session),
        PilatesPhysioForm.find({ patientId }).session(session),
        TreatmentPlan.find({ patientId }).session(session),
        Attendance.find({ id: patientId }).session(session),
        Bill.find({ patientId }).session(session),
      ]);

      const [
        patient,
        neurological,
        musculoskeletal,
        obesity,
        pilates,
        plans,
        attendance,
        bills,
      ] = related;

      const relatedRecords = [
        [Patient, patient ? [patient] : []],
        [NeurologicalForm, neurological],
        [MusculoskeletalForm, musculoskeletal],
        [ObesityForm, obesity],
        [PilatesPhysioForm, pilates],
        [TreatmentPlan, plans],
        [Attendance, attendance],
        [Bill, bills],
      ];

      for (const [model, docs] of relatedRecords) {
        records.push(
          ...docs.map((document) => ({
            model,
            document,
          }))
        );
      }
    }

    await archiveForRecycleBin({
      label: `Enquiry: ${enquiry.patientName}`,
      records,
      deletedBy: req.id,
      session,
    });

    const grouped = new Map();

    for (const record of records) {
      grouped.set(record.model, [
        ...(grouped.get(record.model) || []),
        record.document._id,
      ]);
    }

    for (const [model, ids] of grouped) {
      await model.deleteMany(
        { _id: { $in: ids } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message:
        "Enquiry and related records moved to the recycle bin",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Cascade delete error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during deletion",
    });
  }
};

export {
  createEnquiry,
  getEnquiry,
  getPatientAttendanceEnquiry,
  getPersonalDetails,
  updatedEnquiry,
  deleteEnquiryById,
};
