import React from "react";
import { Star, Coffee, Heart, Wind, Smile } from "../../../shared/utils/icons";
import dashboardData from "../data/dashboardMockData.json";

interface ColorStyle {
  bgLight: string;
  text: string;
}

interface DashboardData {
  colorStyles: {
    amber: ColorStyle;
    rose: ColorStyle;
    sky: ColorStyle;
    emerald: ColorStyle;
  };
}

type HospitalityColor = "amber" | "rose" | "sky" | "emerald";
const HospitalitySection: React.FC = () => {
  const { colorStyles } = dashboardData as DashboardData;

  const hospitalityItems: {
    icon: React.ElementType;
    title: string;
    desc: string;
    color: HospitalityColor;
  }[] = [
    {
      icon: Coffee,
      title: "Patient Comfort",
      desc: "Premium amenities for rapid recovery.",
      color: "amber",
    },
    {
      icon: Heart,
      title: "Compassionate Care",
      desc: "Personalized attention from dedicated staff.",
      color: "rose",
    },
    {
      icon: Wind,
      title: "Healing Atmosphere",
      desc: "Advanced air purification systems.",
      color: "sky",
    },
    {
      icon: Smile,
      title: "Concierge Support",
      desc: "24/7 assistance for families.",
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
            Hospitality Excellence
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Elevating the patient journey through superior care.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-hospital-blue/10 px-4 py-2 rounded-full">
          <Star className="w-4 h-4 text-hospital-blue fill-hospital-blue" />
          <span className="text-hospital-blue/70 font-black text-xs uppercase tracking-widest">
            Patient Satisfaction
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {hospitalityItems.map((item, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div
              className={`w-12 h-12 ${
                colorStyles[item.color]?.bgLight
              } rounded-2xl flex items-center justify-center ${
                colorStyles[item.color]?.text
              } mb-6 group-hover:scale-110 transition-transform`}
            >
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">
              {item.title}
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalitySection;
