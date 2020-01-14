
const INITIATIVE_API_ENDPOINT = "wss://bgov1wxo28.execute-api.us-east-1.amazonaws.com/prod"

var refreshInitiatives;
let showSessionCode = function(code) {
    document.getElementById("sessionCodeLabel").innerText = code;
}

var characterName;
var sessionCode;
var socket = new WebSocket(INITIATIVE_API_ENDPOINT);

function sendToApi(json) {
    socket.send(JSON.stringify(json));
}

socket.onopen = function(event) {};
socket.onmessage = function(event) {
    let data = JSON.parse(event.data);
    let action = data.action;
    let params = data.data;
    console.log(JSON.stringify(data));
    if (action === "put") {
        updateInitiative(params);
    } 
    else if (action === "onJoin") {
        sessionCode = params.session;
        showSessionCode(sessionCode);
        let players = params.players;
        for (var i in players) {
            let p = players[i];
            // p.name = k;
            updateInitiative(p);
        }
    } 
    else if (action === "onCreate") {
        sessionCode = params.session;
        showSessionCode(sessionCode);
        alert("Created session " + sessionCode);
    }
    else {
        alert(`[message] Data received from server: ${event.data}`);
    }
};
socket.onclose = function(event) {
    if (event.wasClean) {
        alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        alert('[close] Connection died');
    }
};
socket.onerror = function(error) {
    alert(`[error] ${error.message}`);
};

function joinSession(session, name) {
    sessionCode = session;
    characterName = name;
    sendToApi({
        service: "initiative",
        action: "join",
        data: {
            session: session,
            name: name
        }
    });
}

function sendInitiative(valuesMap) {
    sendToApi({
        service: "initiative",
        action: "put",
        data: {
            session: sessionCode,
            name: characterName,
            values: valuesMap
        }
    });
}

function createSession() {
    sendToApi({
        service: "initiative",
        action: "create",
        data: {}
    });
}