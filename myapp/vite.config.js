import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    server: {
        proxy: {
            "/Login": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/CreateAccount": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/GetToken": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/GetUsers": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/GetTopics": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/GetQuestions": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/GetOptions": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/CreateQuiz": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/SubmitQuiz": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/TeacherDashboardData": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/DeleteQuiz": {
                target: "http://localhost:3000",
                changeOrigin: true
            },

            "/AdminQuizAnalytics": {
                target: "http://localhost:3000",
                changeOrigin: true
            },
            
            "/StudentDashboardData": {
              target: "http://localhost:3000",
              changeOrigin: true
            },

            "/AuditLogs": {
              target: "http://localhost:3000",
              changeOrigin: true
            },
        }
    }
});