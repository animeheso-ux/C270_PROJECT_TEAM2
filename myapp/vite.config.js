import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendTarget =
  process.env.VITE_BACKEND_TARGET || "http://localhost:3000";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,

    proxy: {
      "/Login": {
        target: backendTarget,
        changeOrigin: true
      },

      "/CreateAccount": {
        target: backendTarget,
        changeOrigin: true
      },

      "/GetToken": {
        target: backendTarget,
        changeOrigin: true
      },

      "/GetUsers": {
        target: backendTarget,
        changeOrigin: true
      },

      "/GetTopics": {
        target: backendTarget,
        changeOrigin: true
      },

      "/GetQuestions": {
        target: backendTarget,
        changeOrigin: true
      },

      "/GetOptions": {
        target: backendTarget,
        changeOrigin: true
      },

      "/CreateQuiz": {
        target: backendTarget,
        changeOrigin: true
      },

      "/SubmitQuiz": {
        target: backendTarget,
        changeOrigin: true
      },

      "/TeacherDashboardData": {
        target: backendTarget,
        changeOrigin: true
      },

      "/DeleteQuiz": {
        target: backendTarget,
        changeOrigin: true
      },

      "/AdminQuizAnalytics": {
        target: backendTarget,
        changeOrigin: true
      },

      "/StudentDashboardData": {
        target: backendTarget,
        changeOrigin: true
      },

      "/AuditLogs": {
        target: backendTarget,
        changeOrigin: true
      }
    }
  }
});