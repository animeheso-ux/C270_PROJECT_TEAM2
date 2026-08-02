const http = require("http");

const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const express = require("express")



server.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on port ${PORT}`);
});


//YJ