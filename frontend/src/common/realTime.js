

export function initRealTime(){
    const socket = new WebSocket("ws://localhost:8000/ws/todos/");

    socket.onopen = function() {
        console.log("WebSocket connected");
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log(data)
        document.getElementById("response").innerText = data.message;
    };

    function sendMessage() {
        const text = document.getElementById("msgInput").value;
        socket.send(JSON.stringify({ message: text }));
    }

    const testRTBtn = document.getElementById('testRT')
    testRTBtn.addEventListener('click',(e)=>{
        sendMessage()
    })
}