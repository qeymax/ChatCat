module.exports = function (io , rooms) {
    var chatrooms = io.of("/roomlist").on("connection", function (socket) {
        console.log("connected");
        socket.emit("roomupdate", JSON.stringify(rooms));
        
        socket.on("newroom", function (data) {
            data.clients = [];
            rooms.push(data);
            socket.broadcast.emit("roomupdate", JSON.stringify(rooms));
            socket.emit("roomupdate", JSON.stringify(rooms));
        });

    });

    var message = io.of("/messages").on("connection", function (socket) {
        console.log("connected 2");
        socket.on("joinroom", function (data) {
            for (var i = 0, len = rooms.length; i < len; i++) {
                if (rooms[i].id === data.roomNumber) {
                    rooms[i].clients.push({ userName = data.userName, userPic = data.userPic });
                }
            }
            socket.join(data.roomNumber);
            updateUserList(data.roomNumber, true);
        });
         socket.on('end', function(data) {
            for (var i = 0, len = rooms.length; i < len; i++) {
                if (rooms[i].id === data.roomName) {
                    for (var j = 0; j < romms[i].length; i++) {
                        if (rooms[i][j].userName === data.userName) {
                            rooms[i].splice(rooms[i][j], 1);
                        }
                    }
                }
            }
        });

        socket.on("newmessage", function (data) {
            console.log("new message");
            socket.broadcast.to(data.roomNumber).emit("messagefeed", JSON.stringify(data));
        });

        function updateUserList(room, updateAll) {
            var userList = [];
            for (var i = 0, len = rooms.length; i < len; i++) {
                if (rooms[i].id === room) {
                    userList = rooms[i].clients;
                }
            }
            
            
            console.log("reached here");
            console.log(userList);
            socket.to(room).emit("updateuserslist", JSON.stringify(userList));

            if (updateAll) {
                socket.broadcast.to(room).emit("updateuserslist", JSON.stringify(userList));
            }
        }
        

        socket.on("updatelist", function (data) {
            updateUserList(data.roomNumbe);
        });
    });

    
}