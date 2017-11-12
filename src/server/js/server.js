express = require('express');
app = express();
http = require('http').Server(app);
io = require('socket.io')(http);
fs = require('fs');

port = 8080;
ip = '127.0.0.1';

module.exports = function startServer(path) {

    app.use(express.static(path + '/src/'));

    app.get('/', function (req, res) {
        res.sendFile(path + '/src/client/html/index.html');
    });

    io.on("connection", function (socket) {
        console.log(`Socket connected: ${socket.id}`);
    });

    http.listen(port, function () {
        console.log(`Server works on http://${ip}:${port}/`);
    });
};