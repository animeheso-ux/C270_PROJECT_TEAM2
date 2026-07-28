const http = require("http");
const { exec } = require("node:child_process");

const app = require("./app");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

if (process.env.BUILD_FRONTEND === "true") {
    exec("cd myapp && npm run build", (error, stdout, stderr) => {
        if (error) {
            console.error("REACT BUILD ERROR:", error);
            return;
        }

        console.log(stdout);
    });
}
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});