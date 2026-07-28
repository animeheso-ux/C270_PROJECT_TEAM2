import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyTarget = process.env.VITE_PROXY_TARGET || "http://localhost:8080";

export default defineConfig({
    plugins: [react()],

    server: {
         allowedHosts: [
      ".run.app"
    ],
        proxy: {
            "/Login": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/CreateAccount": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/GetToken": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/GetUsers": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/Profile": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/GetTopics": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/GetQuestions": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/GetOptions": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/CreateQuiz": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/SubmitQuiz": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/TeacherDashboardData": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/DeleteQuiz": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/AdminQuizAnalytics": {
                target: proxyTarget,
                changeOrigin: true
            },

            "/StudentDashboardData": {
              target: proxyTarget,
              changeOrigin: true
            },

            "/AuditLogs": {
              target: proxyTarget,
              changeOrigin: true
            },
        }
    }
});