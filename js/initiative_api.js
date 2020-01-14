
const INITIATIVE_API_ENDPOINT = "wss://bgov1wxo28.execute-api.us-east-1.amazonaws.com/prod"

var refreshInitiatives;
let showSessionCode = function(code) {
    document.getElementById("sessionCodeLabel").innerText = code;
}

function setCookie(cname, cvalue, exdays) {
    // https://www.w3schools.com/js/js_cookies.asp
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    // https://www.w3schools.com/js/js_cookies.asp
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

var characterName = getCookie('characterName');
var sessionCode = getCookie('sessionCode');

function initSocket() {
    let socket = new WebSocket(INITIATIVE_API_ENDPOINT);
    socket.onopen = function(event) {
        validateConnection();
    };
    socket.onmessage = function(event) {
        let data = JSON.parse(event.data);
        let action = data.action;
        let params = data.data;
        console.log('message:'+JSON.stringify(data));
        if (action === "put") {
            let p  = params.values;
            p.name = params.name;
            p.session = params.session;
            updateInitiative(p);
        } 
        else if (action === "onJoin") {
            sessionCode = params.session;
            showSessionCode(sessionCode);
            let players = params.players;
            console.log('onJoin:'+JSON.stringify(players))
            for (var i in players) {
                let p = players[i];
                console.log('onJoin['+i+']:'+JSON.stringify(p))
                // p.name = k;
                updateInitiative(p);
                if (p.name == characterName) {
                    document.getElementById('modifierInput').value = p.modifier || 0;
                }
            }
            setCookie('sessionCode', sessionCode, 1);
            setCookie('characterName', characterName, 8);
            validateConnection();
        } 
        else if (action === "onCreate") {
            sessionCode = params.session;
            showSessionCode(sessionCode);
        }
        else {
            alert(`[message] Data received from server: ${event.data}`);
        }
    };
    socket.onclose = function(event) {
        console.log('close:'+JSON.stringify(event));
        if (event.wasClean) {
        } else {
            alert('[close] Connection died');
        }
        validateConnection();
    };
    socket.onerror = function(error) {
        alert(`[error] ${error.message}`);
        validateConnection();
    };
    return socket;
}

var socket = initSocket();

function getSocket() {
    if (socket.readyState == WebSocket.OPEN)
        return socket;
    else {
        joinSession(socket.sessionCode || sessionCode, socket.characterName || characterName);
        return socket;
    }
}

function sendToApi(json) {
    getSocket().send(JSON.stringify(json));
}

function joinSession(session, name) {
    sessionCode = session;
    characterName = name;
    socket.sessionCode = session;
    socket.characterName = characterName;
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
    setCookie('modifier', document.getElementById('modifierInput').value, 31);
}

function createSession() {
    sendToApi({
        service: "initiative",
        action: "create",
        data: {}
    });
}
