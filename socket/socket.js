module.exports = function (io , rooms) {
    var chatrooms = io.of("/roomlist").on("connection", function (socket) {
        console.log("connected");
        socket.emit("roomupdate", JSON.stringify(rooms));
        
        socket.on("newroom", function (data) {
            rooms.push(data);
            socket.broadcast.emit("roomupdate", JSON.stringify(rooms));
            socket.emit("roomupdate", JSON.stringify(rooms));
        });

    });

    var message = io.of("/messages").on("connection", function (socket) {
        console.log("connected 2");
        socket.on("joinroom", function (data) {
            socket.userName = data.userName;
            socket.userPic = data.userPic;
            socket.join(data.roomNumber);
            updateUserList(data.roomNumber, true);
        });

        socket.on("newmessage", function (data) {
            console.log("new message");
            socket.broadcast.to(data.roomNumber).emit("messagefeed", JSON.stringify(data));
        });

        function updateUserList(room , updateAll) {
            var getUsers = findClientsSocket(room, "/messages");
            var userList = [];
            for (var i = 0; i < getUsers.length; i++) {
                userList.push({ userName: getUsers[i].userName, userPic: getUsers[i].userPic });
            }
            console.log("reached here");
            console.log(userList);
            socket.emit("updateuserslist", JSON.stringify(userList));

            if (updateAll) {
                socket.broadcast.to(room).emit("updateuserslist", JSON.stringify(userList));
            }
        }
        function findClientsSocket(roomId, namespace) {
            var res = []
            , ns = io.of(namespace ||"/");    // the default namespace is "/"

            if (ns) {
                for (var id in ns.connected) {
                    if(roomId) {
                        var index = ns.connected[id].rooms[roomId];
                        if(index) {
                            res.push(ns.connected[id]);
                        }
                    } else {
                        res.push(ns.connected[id]);
                    }
                }
            }
            return res;
        }

        socket.on("updatelist", function (data) {
            updateUserList(data.roomNumbe);
        });
    });

    
}