import React, { useState } from "react";
import { UserRole } from "../../../shared/types";
import { mapStaffRoleToUserRole } from "../utils/loginCredentials";

interface UseLoginProps {
  onLoginSuccess: (role: UserRole, staffName?: string) => void;
}

export const useLogin = ({ onLoginSuccess }: UseLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setLoginError(false);

      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setLoginError(true);
        return;
      }

      const user = data.user;

      // Normalize role: map staff roles (e.g. "lab", "lab technician") to UserRole
      const mapped = mapStaffRoleToUserRole(user.role as string);
      const normalizedRole = mapped || (
        (user.role as string).charAt(0).toUpperCase() + (user.role as string).slice(1).toLowerCase() as UserRole
      );

      onLoginSuccess(
        normalizedRole,
        user.name
      );
    } catch (error) {
      console.error("Login Error:", error);
      setLoginError(true);
    } finally {
      setLoading(false);
    }

  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loginError,
    loading,
    handleLogin,
  };
};
