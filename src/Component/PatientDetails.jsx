import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PersonalInfoSection from "./personalDetailsSections/PersonalInfoSection";
import EnquiryInfoSection from "./personalDetailsSections/EnquiryInfoSection";
import AssessmentSection from "./personalDetailsSections/AssessmentSection";
import TreatmentSection from "./personalDetailsSections/TreatmentSection";
import AttendanceSection from "./personalDetailsSections/AttendanceSection";
import BillSection from "./personalDetailsSections/BillSection";

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patientDetail, setPatientDetail] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/patient/getPatientById/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            token:
              localStorage.getItem("token") ||
              localStorage.getItem("webapptoken"),
          },
        }
      );

      const data = await res.json();
      setPatientDetail(data.patient);
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (!patientDetail) return <div className="p-4">Loading...</div>;

  const { personalDetails, assessment, treatment, attendance, billing } =
    patientDetail;

    console.log("patient details" , patientDetail);

  return (
    <div className="p-4 space-y-6">
      {/* ================= PERSONAL INFO ================= */}
      <PersonalInfoSection personalDetails={personalDetails} />

      {/* ================= ENQUIRY INFO ================= */}

      <EnquiryInfoSection enquiryId={personalDetails?.enquiryId} />

      {/* ================= ASSESSMENT ================= */}

      <AssessmentSection
        assessment={assessment}
        patientDetail={patientDetail}
        id={id}
      />

      {/* ================= TREATMENT ================= */}
      <TreatmentSection treatment={treatment} patientDetail={patientDetail} />

      {/* ================= ATTENDANCE ================= */}
      <AttendanceSection
        attendance={attendance}
        patientDetail={patientDetail}
        billing={billing}
      />

      {/* ================= BILLING ================= */}
      <BillSection fetchData={fetchData} billing={billing} patientDetail={patientDetail} attendance={attendance} />
    </div>
  );
};

export default PatientDetails;
