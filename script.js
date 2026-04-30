// script.js
const ws = new WebSocket('ws://localhost:8080');
const statusMessage = document.getElementById('statusMessage');

ws.onopen = () => {
    console.log("✅ З'єднання з сервером встановлено.");
};

ws.onclose = () => {
    statusMessage.innerText = "Зв'язок із сервером втрачено. Переконайтеся, що сервер запущено.";
};

ws.onmessage = (event) => {
    const response = JSON.parse(event.data);

    if (response.type === "register_account") {
        if (response.is_ok) {
            document.getElementById('formCard').style.display = "none";
            document.getElementById('resultWindow').style.display = "block";

            document.getElementById('userIdText').innerText = response.user.id;
            document.getElementById('loginText').innerText = response.user.login;
            document.getElementById('emailText').innerText = response.user.email;
            document.getElementById('nameText').innerText = response.user.full_name;
        } else {
            statusMessage.innerText = response.error;
        }
    }
};

document.getElementById('regForm').addEventListener('submit', (e) => {
    e.preventDefault(); 

    if (ws.readyState !== WebSocket.OPEN) {
        statusMessage.innerText = "Немає зв'язку з сервером!";
        return;
    }

    statusMessage.innerText = ""; 

    const login = document.getElementById('login').value;
    const email = document.getElementById('email').value;
    const fullname = document.getElementById('fullname').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (password !== confirmPassword) {
        statusMessage.innerText = "Паролі не збігаються!";
        return; 
    }

    const requestData = {
        type: "register_account",
        data: {
            login: login,
            email: email,
            full_name: fullname,
            password: password
        }
    };

    ws.send(JSON.stringify(requestData));
});