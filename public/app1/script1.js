const socket = io();
const canvas = document.getElementById('footballField');
const ctx = canvas.getContext('2d');

let players = [];
 
let draggingPlayer = null;
 
let offsetX, offsetY;

let isAuthenticated = false;

// 비밀번호 입력을 위한 input 박스 추가 (수정된 부분)
const passwordInput = document.createElement('input');
passwordInput.type = 'password';
passwordInput.placeholder = '비밀번호 입력';
const submitButton = document.createElement('button');
submitButton.innerText = '인증';
document.body.appendChild(passwordInput);
document.body.appendChild(submitButton);

submitButton.addEventListener('click', () => {
    const password = passwordInput.value;
    socket.emit('authenticate', password);
});

/*
// 비밀번호 입력창
const password = prompt("선수를 움직이려면 비밀번호를 입력하세요:");
socket.emit('authenticate', password);
*/
socket.on('authSuccess', () => {
    alert("인증 성공! 선수를 이동할 수 있습니다.");
    isAuthenticated = true;
});

socket.on('authFail', () => {
    alert("인증 실패! 이동 권한이 없습니다.");
});

// 충돌 감지 함수 추가 (수정된 부분 시작)
function checkCollision(player, newX, newY) {
    return players.some(otherPlayer => {
        if (otherPlayer.id !== player.id) {
            const dist = Math.sqrt((otherPlayer.x - newX) ** 2 + (otherPlayer.y - newY) ** 2);
            return dist < player.radius * 2; // 선수끼리 겹치지 않도록
        }
        return false;
    });
}
// 수정된 부분 끝

 


// 축구장 그리기
function drawFootballField() {
 
	
	ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
// 중앙선
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.stroke();

// 센터 써클
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.stroke();

// 우측반원	
	ctx.beginPath();
    ctx.arc(canvas.width - 100, canvas.height / 2, 25, Math.PI / 2, Math.PI * 1.5, false);
    ctx.strokeStyle = 'white';
    ctx.stroke();

// 좌측반원	 
	ctx.beginPath();
    ctx.arc(100, canvas.height / 2, 25, Math.PI / 2, Math.PI * 1.5, true);
    ctx.strokeStyle = 'white';
    ctx.stroke();
	   
// 우측상단 1/4원    
	ctx.beginPath();
    ctx.arc(canvas.width, 0, 25, Math.PI / 2, Math.PI, false);
    ctx.strokeStyle = 'white';
    ctx.stroke();
	
// 좌측상단 1/4원    
	ctx.beginPath();
    ctx.arc(0, 0, 25, Math.PI / 1, Math.PI /2, false);
    ctx.strokeStyle = 'white';
    ctx.stroke();
	
// 우측하단 1/4원    
	ctx.beginPath();
    ctx.arc(canvas.width, canvas.height, 25, -Math.PI, -Math.PI /2, false);
    ctx.strokeStyle = 'white';
    ctx.stroke();
	
// 좌측하단 1/4원    
	ctx.beginPath();
    ctx.arc(0, canvas.height, 25, 0, -Math.PI /2, true);
    ctx.strokeStyle = 'white';
    ctx.stroke();


// 왼쪽 골박스
    ctx.beginPath();
    ctx.rect(0, canvas.height / 4, 100, canvas.height / 2);
    ctx.strokeStyle = 'white';
    ctx.stroke();

//우측 골박스와 좌우 골키퍼 존
    ctx.beginPath();
    ctx.rect(canvas.width - 100, canvas.height / 4, 100, canvas.height / 2);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(0, canvas.height / 2 - 30, 20, 60);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(canvas.width - 20, canvas.height / 2 - 30, 20, 60);
    ctx.fillStyle = 'white';
    ctx.fill();
 	
	// 왼쪽 골키퍼 보호존
    ctx.beginPath();
    ctx.rect(0, canvas.height / 2 - 50, 60, 100);
	ctx.fillStyle = 'white';
    ctx.stroke();
    
    // 오른쪽 골키퍼 보호존
    ctx.beginPath();
    ctx.rect(canvas.width - 60, canvas.height / 2 - 50, 60, 100);
	ctx.fillStyle = 'white';
    ctx.stroke();
	
}



// 선수 객체 생성
function createPlayer(id, x, y, color) {
    return { id, x, y, color, radius: 10 };
}

// 선수 그리기
function drawPlayer(player) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.fillStyle = player.color;
    ctx.fill();
}

// 선수 초기화
function initPlayers() {

	 const startX = canvas.width / 2;
    const startY = canvas.height / 8;
    const spacing = 30; // 선수 간 간격

    for (let i = 0; i < 11; i++) {
		players.push(createPlayer(i, startX, startY + i * spacing, `rgb(${8 * 1}, ${8 * 255}, ${1 * 255})`));
    }
	
	players.push(createPlayer(11, startX, startY + 11 * spacing, `rgb(${1 * 1}, ${8 * 1}, ${1 * 1})`));
}

// 캔버스 그리기
function drawCanvas() {
    drawFootballField();
    players.forEach(drawPlayer);
}


// 모바일 지원: 터치 이벤트 추가 (수정된 부분 시작)
canvas.addEventListener('touchstart', (e) => {
    if (!isAuthenticated) return;
    const touch = e.touches[0];
    const touchX = touch.clientX - canvas.getBoundingClientRect().left;
    const touchY = touch.clientY - canvas.getBoundingClientRect().top;
    draggingPlayer = players.find(player => Math.sqrt((player.x - touchX) ** 2 + (player.y - touchY) ** 2) < player.radius);
    if (draggingPlayer) {
        offsetX = touchX - draggingPlayer.x;
        offsetY = touchY - draggingPlayer.y;
    }
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!isAuthenticated || !draggingPlayer) return;
    const touch = e.touches[0];
    const newX = touch.clientX - canvas.getBoundingClientRect().left - offsetX;
    const newY = touch.clientY - canvas.getBoundingClientRect().top - offsetY;
    
    if (!checkCollision(draggingPlayer, newX, newY)) {
        draggingPlayer.x = newX;
        draggingPlayer.y = newY;
        drawCanvas();
        socket.emit('playerMoved', { id: draggingPlayer.id, x: draggingPlayer.x, y: draggingPlayer.y });
    }
    e.preventDefault();
});

canvas.addEventListener('touchend', () => {
    if (!isAuthenticated) return;
    if (draggingPlayer) {
        socket.emit('playerMoved', { id: draggingPlayer.id, x: draggingPlayer.x, y: draggingPlayer.y });
        draggingPlayer = null;
    }
});
// 수정된 부분 끝

// 마우스 다운 이벤트 처리
canvas.addEventListener('mousedown', (e) => {
	if (!isAuthenticated) return;
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    draggingPlayer = players.find(player => Math.sqrt((player.x - mouseX) ** 2 + (player.y - mouseY) ** 2) < player.radius);

    if (draggingPlayer) {
        offsetX = mouseX - draggingPlayer.x;
        offsetY = mouseY - draggingPlayer.y;
    }
});

// 마우스 이동 이벤트 처리
canvas.addEventListener('mousemove', (e) => {
	if (!isAuthenticated || !draggingPlayer) return;
    const newX = e.clientX - canvas.getBoundingClientRect().left - offsetX;
    const newY = e.clientY - canvas.getBoundingClientRect().top - offsetY;
    
    // 충돌 감지 추가 (수정된 부분 시작)
    if (!checkCollision(draggingPlayer, newX, newY)) {
        draggingPlayer.x = newX;
        draggingPlayer.y = newY;
        drawCanvas();
        socket.emit('playerMoved', { id: draggingPlayer.id, x: draggingPlayer.x, y: draggingPlayer.y });
    }
    // 수정된 부분 끝
});

// 마우스 업 이벤트 처리
canvas.addEventListener('mouseup', () => {
	if (!isAuthenticated) return;
    if (draggingPlayer) {
        socket.emit('playerMoved', { id: draggingPlayer.id, x: draggingPlayer.x, y: draggingPlayer.y });
        draggingPlayer = null;
    }
});

// 소켓 이벤트 처리
socket.on('playerMoved', (data) => {
    const player = players.find(p => p.id === data.id);
    if (player) {
        player.x = data.x;
        player.y = data.y;
        drawCanvas();
    }
});

// 초기화
initPlayers();
drawCanvas();
