import React, { useEffect } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Navbar from "./components/Navbar";

import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { useAuthStore } from "./stores/authStore";
import { Loader } from "lucide-react";

import WeeklyTaskPage from "./pages/WeeklyTaskPage";
import DailyTaskPage from "./pages/DailyTaskPage";
import MonthlyTaskPage from "./pages/MonthlyTaskPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import { TooltipProvider } from "@radix-ui/react-tooltip";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex gap-2 items-center justify-center h-screen">
        <Loader className="animate-spin" />
        <p className="text-center">Study Planner</p>
      </div>
    );
  }

  return (
    <ThemeProvider
      defaultTheme="dark"
      storageKey="vite-ui-theme"
    >
      <TooltipProvider>
        <Toaster />

        <Navbar />

        <div className="pt-16">
          <Routes>

            {/* Dashboard */}
            <Route
              path="/"
              element={
                authUser
                  ? <HomePage />
                  : <Navigate to="/login" />
              }
            />

            {/* Daily Planner */}
            <Route
              path="/daily-task"
              element={
                authUser
                  ? <DailyTaskPage />
                  : <Navigate to="/login" />
              }
            />

            {/* Weekly Planner */}
            <Route
              path="/weekly-task"
              element={
                authUser
                  ? <WeeklyTaskPage />
                  : <Navigate to="/login" />
              }
            />

            {/* Monthly Planner */}
            <Route
              path="/monthly-task"
              element={
                authUser
                  ? <MonthlyTaskPage />
                  : <Navigate to="/login" />
              }
            />

            {/* Forgot Password */}
            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />

            {/* Login */}
            <Route
              path="/login"
              element={
                !authUser
                  ? <LoginPage />
                  : <Navigate to="/" />
              }
            />

            {/* Signup */}
            <Route
              path="/signup"
              element={
                !authUser
                  ? <SignupPage />
                  : <Navigate to="/" />
              }
            />

            {/* Unknown URL */}
            <Route
              path="*"
              element={<Navigate to="/" />}
            />

          </Routes>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;