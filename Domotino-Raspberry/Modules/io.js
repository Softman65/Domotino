module.exports = function (app, port) {
    var _io = require('socket.io').listen(port)
    console.log('IO client connect on port ' + port)

    _io.sockets.on('connection', function (socket) {
       console.log('client connect (this) on port ' + port)
       send('this',app._Data);
    });
    function send(command, data) {
        _io.sockets.emit(command, data);
    }

    return send
}
