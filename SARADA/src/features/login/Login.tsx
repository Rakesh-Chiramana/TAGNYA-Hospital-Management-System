import React, { useState } from "react";
import "./styles/login.css";
import {
  Heart,
  ShieldCheck,
  Activity,
  User,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "../../shared/utils/icons";
import { UserRole } from "../../shared/types";
import { useLogin } from "./hooks/useLogin";
import saradaLogo from "../../assets/sarada_logo.png";

interface LoginFormProps {
  onLoginSuccess: (role: UserRole, staffName?: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    username,
    setUsername,
    password,
    setPassword,
    loginError,
    handleLogin,
  } = useLogin({ onLoginSuccess });

  return (
    <div className="login-page selection:bg-[#f29100]/30">
      {/* Left Side: Hospitality Background */}
      <div className="login-left-side">
        <div className="login-bg-img">
          <img
            src="/hospitality_medical_background_1776850455614.png"
            alt="Hospitality Background"
          />
          <div className="login-bg-overlay"></div>
        </div>

        <div className="relative z-10">
          <div className="mb-14 flex flex-col items-start">
            <img src={saradaLogo} alt="Sarada Hospital" className="login-logo-left" />
          </div>

          <div className="max-w-2xl">
            <h2 className="text-7xl font-black text-[#063970] leading-[1] tracking-tighter mb-10">
              Hospitality <br />
              <span className="text-[#3498db] italic">Meets</span> Precision.
            </h2>
            <p className="text-2xl text-black font-medium leading-relaxed mb-16 shadow-sm">
              A specialized clinical operating system designed for the next
              generations of healthcare hospitality.
            </p>

            <div className="grid grid-cols-2 gap-12">
              {[
                {
                  icon: ShieldCheck,
                  label: "Secure Node",
                  desc: "Encrypted Clinical Data",
                },
                {
                  icon: Activity,
                  label: "Real-time Pulse",
                  desc: "Live Patient Analytics",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-6">
                  <div className="mt-1 p-3 bg-[#e0f2fe]/50 rounded-2xl border border-[#bae6fd]/30">
                    <item.icon className="w-6 h-6 text-[#3498db]" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#063970] mb-1 tracking-tight">
                      {item.label}
                    </p>
                    <p className="text-sm text-slate-500 font-medium tracking-wide">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-8 text-slate-400 text-[11px] font-black uppercase tracking-[0.4em]">
          <p>© 2026 Sarada Hospital</p>
          <div className="h-[1px] w-20 bg-slate-300/50"></div>
          <p>Premium Medical Node</p>
        </div>
      </div>

      {/* Right Side: Login Card */}
      <div className="login-right-side">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[#005c97]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="login-card">
          <div className="mb-10 flex flex-col items-center text-center">
            <img src={saradaLogo} alt="Sarada Hospital" className="login-logo-card" />
            <h3 className="text-3xl font-black text-[#063970] tracking-tighter mb-3">
              Login
            </h3>
            <p className="text-slate-500 font-medium text-sm">
              Secure access for authorized faculty only.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                Login
              </label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="login-input"
                />
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3498db] transition-colors" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                Password
              </label>
              <div className="relative group">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input pr-12"
                />
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3498db] transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3498db] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center space-x-3 text-red-400 p-5 bg-red-500/5 border border-red-500/20 rounded-3xl">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-black uppercase tracking-wider">
                  Invalid Credentials
                </p>
              </div>
            )}

            <button
              type="submit"
              className="login-btn group"
            >
              <ShieldCheck className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>Login</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
