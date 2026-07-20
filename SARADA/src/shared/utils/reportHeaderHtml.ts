import {
  HOSPITAL_ADDRESS,
  HOSPITAL_EMAIL,
  HOSPITAL_NAME_LINE1,
  HOSPITAL_NAME_LINE2,
  HOSPITAL_WEBSITE,
  HOSPITAL_PHONE,
} from "../constants/hospitalBranding";

/** Shared print header HTML — logo left, specialty + email + website right, address below. */
export const getReportHeaderHtml = (logoSrc: string) => `
  <div class="letterhead-wrap">
    <div class="letterhead">
      <div class="letterhead-left">
        <img src="${logoSrc}" class="logo" alt="Logo" onerror="this.style.display='none'" />
        <span class="letterhead-title">TAGNYA HOSPITAL</span>
      </div>
      <div class="letterhead-right">
        <div class="services-block">
          <div class="services-large">24/7</div>
          <div class="services-sub">SERVICES</div>
        </div>
        <div class="divider-line"></div>
        <div class="contact-block">
          <div class="contact-phone">+91 9632203555</div>
          <div class="contact-email">Tagnyahealthcare@gmail.com</div>
        </div>
      </div>
    </div>
    <div class="letterhead-address-bar">${HOSPITAL_ADDRESS}</div>
  </div>`;

export const getReportHeaderStyles = () => `
    .letterhead-wrap { margin-bottom: 12px; font-family: Arial, Helvetica, sans-serif; }
    .letterhead { display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; }
    .letterhead-left { display: flex; align-items: center; gap: 12px; }
    .letterhead-left .logo { height: 52px; width: auto; object-fit: contain; }
    .letterhead-title { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; font-family: Arial, Helvetica, sans-serif; }
    .letterhead-right { display: flex; align-items: center; gap: 14px; }
    .services-block { text-align: right; line-height: 1.1; }
    .services-large { font-size: 20px; font-weight: 900; color: #0284c7; }
    .services-sub { font-size: 10px; font-weight: 800; color: #0284c7; letter-spacing: 1px; }
    .divider-line { width: 2px; height: 38px; background-color: #e28743; }
    .contact-block { text-align: left; line-height: 1.3; }
    .contact-phone { font-size: 13px; font-weight: 700; color: #0284c7; }
    .contact-email { font-size: 11px; font-weight: 700; color: #0284c7; }
    .letterhead-address-bar { color: #0284c7; border-top: 2px solid #0284c7; border-bottom: 2px solid #0284c7; padding: 6px 4px; text-align: center; font-size: 10px; font-weight: 700; font-family: Arial, Helvetica, sans-serif; margin-top: 4px; }
`;
