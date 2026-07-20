import React from "react";
import hospitalLogo from "../../assets/sarada_logo.png";
import {
  HOSPITAL_ADDRESS,
  HOSPITAL_EMAIL,
  HOSPITAL_NAME_LINE1,
  HOSPITAL_NAME_LINE2,
  HOSPITAL_WEBSITE,
  HOSPITAL_PHONE,
} from "../constants/hospitalBranding";
import "./ReportLetterhead.css";

/** Compact letterhead for on-screen receipts (matches print/PDF layout). */
const ReportLetterhead: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`report-letterhead-wrap ${className}`.trim()}>
      <div className="report-letterhead">
        <div className="hospital-header-left">
          <img src={hospitalLogo} alt="Logo" className="hospital-header-logo" />
          <span className="hospital-header-title">{HOSPITAL_NAME_LINE1}</span>
        </div>
        <div className="hospital-header-right">
          <div className="services-block">
            <div className="services-large">24/7</div>
            <div className="services-sub">SERVICES</div>
          </div>
          <div className="divider-line"></div>
          <div className="contact-block">
            <div className="contact-phone">{HOSPITAL_PHONE}</div>
            <div className="contact-email">{HOSPITAL_EMAIL}</div>
          </div>
        </div>
      </div>
      <div className="report-letterhead-address-bar">{HOSPITAL_ADDRESS}</div>
    </div>
  );
};

export default ReportLetterhead;
