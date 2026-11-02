


import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import { useState } from "react";

import ProtectedRoute from "./routers/ProtectedRoute.jsx";
import ProtectedRouteAdmin from "./routers/ProtectedRouteAdmin.jsx";

import AuthPage from "./pages/AuthPage";
import Navbar from "./Component/navbar.jsx";

import Home from "./Component/Home";
import Assessment from "./Component/Assessment";
import Musculoskeletal from "./Component/Musculoskeletal";
import Obesity from "./Component/Obesity";
import Pilates from "./Component/Pilates";
import TreatmentPlan from "./Component/TreatmentPlan";
import Client from "./Component/Client";
import Reports from "./Component/Reports";
import Bill from "./Component/Bill";
import Expenses from "./Component/Expenses";
import Inventory from "./Component/Inventory";
import Salary from "./Component/Salary";
import Rent from "./Component/Rent";
import Total from "./Component/Total";
import Attendence from "./Component/Attendence";

import PatientDetails from "./Component/PatientDetails.jsx";
import EmployeeDetails from "./Component/EmployeeDetails.jsx";
import AllEnquiry from "./Component/AllEnquiry.jsx";
import AllEmployee from "./Component/AllEmployee.jsx";
import CreateBill from "./Component/CreateBill.jsx";
import PatientAttendancePage from "./Component/PatientAttendancePage.jsx";
import Enquiry from "./Component/Enquiry.jsx";
import Newbill from "./Component/Newbill.jsx";
import RecycleBin from "./Component/RecycleBin.jsx";

// ======================================================
// GLOBAL BACK BUTTON
// ======================================================

function GlobalBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === "/";
  const isAuthPage = location.pathname === "/auth";
  const isAttendancePortal =
    location.pathname.toLowerCase() === "/daily-attendance";

  // Hide Back button on Dashboard and Authentication
  if (isDashboard || isAuthPage || isAttendancePortal) {
    return null;
  }

  const handleBack = () => {
    // Return to the previous application page when possible.
    // Fall back to Dashboard on a fresh/direct page load.
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="px-4 pt-3 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back to previous page"
        className="group inline-flex items-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B4BAA] shadow-sm transition-all duration-200 hover:border-[#00C2CB] hover:bg-[#E8F0FB] active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        >
          <path d="m15 18-6-6 6-6" />
          <path d="M20 12H9" />
        </svg>

        <span>Back</span>
      </button>
    </div>
  );
}

// ======================================================
// MAIN APP
// ======================================================

function App() {
  const [role, setRole] = useState("employee");

  return (
    <Router>
      <Navbar />

      {/* Global Back button */}
      <GlobalBackButton />

      <Routes>
        {/* ==========================================
            AUTHENTICATION
        ========================================== */}

        <Route
          path="/auth"
          element={<AuthPage setRole={setRole} />}
        />

        {/* ==========================================
            DASHBOARD
        ========================================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home role={role} />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            ENQUIRIES
        ========================================== */}

        <Route
          path="/allEnquiry"
          element={
            <ProtectedRoute>
              <AllEnquiry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Enquiry"
          element={
            <ProtectedRoute>
              <Enquiry />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            BILLING
        ========================================== */}

        <Route
          path="/Newbill"
          element={
            <ProtectedRoute>
              <Newbill />
            </ProtectedRoute>
          }
        />

        <Route
          path="/createBill"
          element={
            <ProtectedRoute>
              <CreateBill />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            EMPLOYEE MANAGEMENT
        ========================================== */}

        <Route
          path="/allEmployee"
          element={
            <ProtectedRoute>
              <ProtectedRouteAdmin>
                <AllEmployee />
              </ProtectedRouteAdmin>
            </ProtectedRoute>
          }
        />

        <Route
          path="/EmployeeDetails/:id"
          element={
            <ProtectedRoute>
              <ProtectedRouteAdmin>
                <EmployeeDetails role={role} />
              </ProtectedRouteAdmin>
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            PATIENT MANAGEMENT
        ========================================== */}

        <Route
          path="/PatientDetails/:id"
          element={
            <ProtectedRoute>
              <PatientDetails />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            ASSESSMENT
        ========================================== */}

        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/musculoskeletal"
          element={
            <ProtectedRoute>
              <Musculoskeletal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/obesity"
          element={
            <ProtectedRoute>
              <Obesity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pilates"
          element={
            <ProtectedRoute>
              <Pilates />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            TREATMENT AND CLIENT MANAGEMENT
        ========================================== */}

        <Route
          path="/treatmentPlan"
          element={
            <ProtectedRoute>
              <TreatmentPlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <Client />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            REPORTS
        ========================================== */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ProtectedRouteAdmin>
                <Reports />
              </ProtectedRouteAdmin>
            </ProtectedRoute>
          }
        >
          {/* Default reports page */}
          <Route
            index
            element={
              <div className="text-lg text-gray-500">
                Select a report to view details
              </div>
            }
          />

          <Route
            path="bill"
            element={
              <ProtectedRoute>
                <Bill />
              </ProtectedRoute>
            }
          />

          <Route
            path="expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />

          <Route
            path="inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="salary"
            element={
              <ProtectedRoute>
                <Salary />
              </ProtectedRoute>
            }
          />

          <Route
            path="rent"
            element={
              <ProtectedRoute>
                <Rent />
              </ProtectedRoute>
            }
          />

          <Route
            path="daily-attendance"
            element={<Navigate to="/daily-attendance" replace />}
          />

          <Route
            path="total"
            element={
              <ProtectedRoute>
                <Total />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ==========================================
            ATTENDANCE
        ========================================== */}

        {/* Employee and patient check-in/out. Public on purpose: the
            employee's start-of-day code is what logs them in. */}
        <Route path="/daily-attendance" element={<PatientAttendancePage />} />

        <Route path="/recycle-bin" element={<ProtectedRoute><ProtectedRouteAdmin><RecycleBin /></ProtectedRouteAdmin></ProtectedRoute>} />

        {/* Staff roster - owner only (also enforced by the API). */}
        <Route
          path="/attendence"
          element={
            <ProtectedRoute>
              <ProtectedRouteAdmin>
                <Attendence />
              </ProtectedRouteAdmin>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


