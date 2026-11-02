import express from "express";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import enquiryRouter from "./routes/enquiryRoute.js";
import patientRouter from "./routes/patientRoute.js";
import assessmentRouter from "./routes/assesmentRoute.js";
import clientRouter from "./routes/clientRoute.js";
import reportRouter from "./routes/reportRoute.js";
import employeeRouter from "./routes/employeeRoute.js";
import treatmentPlanRouter from "./routes/treatmentPlanRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js";
import connectDb from "./config/mongodb.js";
import recycleBinRouter from "./routes/recycleBinRoute.js";
import { deleteBill } from "./controllers/reportsController.js";
import employeeAuth from "./middleware/employeeAuth.js";

//App config
const app = express();

//middewares

// req.ip must be the real client for the clinic IP allowlist (middleware/clinicIp.js).
// Behind a proxy (Vercel, nginx, Cloudflare) set TRUST_PROXY to the number of
// proxy hops, e.g. TRUST_PROXY=1. Leave it unset when Express is exposed
// directly - trusting a proxy that is not there lets a client forge
// X-Forwarded-For and bypass the allowlist.
if (process.env.TRUST_PROXY) {
  const hops = Number(process.env.TRUST_PROXY);
  app.set("trust proxy", Number.isNaN(hops) ? process.env.TRUST_PROXY : hops);
}

app.use(express.json());

// CORS_ORIGINS = comma-separated list of the frontend URLs allowed to call this
// API, e.g. https://staff.example.com. Unset (local development) allows any
// origin; set it in production so only your own site can use staff logins.
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : "*" }));

// Health check: answers even when the database is down, so "is the server up?"
// and "is the database up?" can be told apart.
app.get("/", (req, res) => {
  res.send("API working");
});

// Make sure the database is connected before any API route runs. connectDb()
// is idempotent (it returns at once when already connected), so on a normal
// server this costs nothing, and in a serverless function it opens the
// connection on a cold start and reuses it afterwards - whichever file the host
// uses as the entry point. If the database is unreachable the caller gets a
// clear 503 instead of a request that hangs.
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    console.error("Database unavailable:", error.message);
    res.status(503).json({
      success: false,
      message: "The service is temporarily unavailable. Please try again.",
      code: "DB_UNAVAILABLE",
    });
  }
});

//api end points
app.use("/api/user", userRouter);
app.use("/api/enquiry", enquiryRouter);
app.use("/api/patient", patientRouter);
app.use("/api/assessment", assessmentRouter);
app.use("/api/client", clientRouter);
app.use("/api/report", reportRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/treatmentPlan", treatmentPlanRouter);
app.use("/api/attendance",attendanceRouter );
app.use("/api/recycle-bin", recycleBinRouter);

// Alias route for bill deletion
app.delete("/api/bill/deleteBill/:id", employeeAuth, deleteBill);

export default app;
