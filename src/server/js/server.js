let fs = require('fs');
let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let port = process.env.PORT || 8080;
let ip = "127.0.0.1";

module.exports = function startServer(dir) {
    app.use(express.static(path.join(dir, "/src")));
    app.get("/", function (req, res, next) {
        res.sendFile(path.join(dir, "/src/client/html/index.html"));
    });

    io.on("connect", function (socket) {
        console.log(`Socket connected: ${socket.id}`);
        configureSocket(socket)
    });

    http.listen(port, function () {
        console.log(`Server works on http://${ip}:${port}/`);
    });
};

function configureSocket(socket) {
    socket.on("disconnect", function (socket) {
        console.log("Socket disconnected.");
    });
}