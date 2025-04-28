const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require("path")
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 📌 정적 파일 제공 (public 폴더 내의 파일 접근 가능)
app.use(express.static(path.join(__dirname, "public")));
//app.use(express.static(__dirname)); // 같은 경로에 파일 있을경우

// 인증된 사용자 저장
let authorizedUsers = new Set();
 

io.on('connection', (socket) => {
    console.log('New client connected');
	
	// 비밀번호 인증
    socket.on('authenticate', (password) => {
        if (password === '1234') {
            authorizedUsers.add(socket.id);
            socket.emit('authSuccess');
        } else {
            socket.emit('authFail');
        }
    });

    socket.on('playerMoved', (data) => {
        if (authorizedUsers.has(socket.id)) { // 권한 체크
            io.emit('playerMoved', data);
        }
    });
	
 

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public","app1" , "aaa.html"));
});

server.listen(3000, () => {
  console.log('서버 실행 중: http://localhost:3000');
});
