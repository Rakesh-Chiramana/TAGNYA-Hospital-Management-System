import React from "react";
import "./HospitalHeader.css";
import hospitalLogo from "../../assets/sarada_logo.png";
import {
  HOSPITAL_ADDRESS,
  HOSPITAL_EMAIL,
  HOSPITAL_NAME_LINE1,
  HOSPITAL_NAME_LINE2,
  HOSPITAL_WEBSITE,
  HOSPITAL_PHONE,
} from "../constants/hospitalBranding";

interface HospitalHeaderProps {
  /** Use on prescription, admission receipts, and other full-page documents */
  variant?: "default" | "large";
}

const HospitalHeader: React.FC<HospitalHeaderProps> = ({ variant = "default" }) => {
  return (
    <div
      className={`hospital-header-container${variant === "large" ? " hospital-header-container--large" : ""}`}
    >
      <div className="hospital-header-main">
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
      <div className="hospital-header-address-bar">{HOSPITAL_ADDRESS}</div>
    </div>
  );
};

export default HospitalHeader;
