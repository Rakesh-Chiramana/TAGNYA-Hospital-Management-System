import React, { ReactNode } from "react";
import "./PageTransition.css";
import {
  Bed as BedIcon,
  Activity,
  Users,
  Stethoscope,
  Pill,
  FlaskConical,
  Heart,
} from "../utils/icons";

interface PageTransitionProps {
  children: React.ReactNode;
  tab: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, tab }) => {
  const getIcon = () => {
    switch (tab) {
      case "bed-allocation":
        return <BedIcon className="w-24 h-24 text-hospital-blue" />;
      case "dashboard":
        return <Activity className="w-24 h-24 text-hospital-blue" />;
      case "patients":
        return <Users className="w-24 h-24 text-hospital-blue" />;
      case "appointments":
        return <Stethoscope className="w-24 h-24 text-hospital-blue" />;
      case "billing":
        return <Pill className="w-24 h-24 text-hospital-blue" />;
      case "lab":
        return <FlaskConical className="w-24 h-24 text-hospital-blue" />;
      default:
        return <Heart className="w-24 h-24 text-hospital-blue" />;
    }
  };

  return (
    <div key={tab} className="relative">
      {children}
    </div>
  );
};

export default PageTransition;
