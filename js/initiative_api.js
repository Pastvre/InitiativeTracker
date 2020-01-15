
const INITIATIVE_API_ENDPOINT = "wss://bgov1wxo28.execute-api.us-east-1.amazonaws.com/prod"

var refreshInitiatives;
let showSessionCode = function(code) {
    document.getElementById("sessionCodeLabel").innerText = code;
    let link = '/?code=' + code;
    console.log('linking to '+link);
    document.getElementById("sessionCodeLink").href = link;
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

var characterName;
var sessionCode;

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
        } else if (action === "reset") {
            let code = params.session;
            console.log('got reset for session '+code);
            if (code == sessionCode) {
                resetInitiativesTable();
            }
        } 
        else if (action === "onJoin") {
            sessionCode = params.session;
            //changeState('userUI');
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
            setCookie('sessionCode', sessionCode, 1); // lasts 1 day
            setCookie('characterName', characterName, 8); // lasts 8 days
            validateConnection();
        } 
        else if (action === "onCreate") {
            sessionCode = params.session;
            //changeState('userUI');
            showSessionCode(sessionCode);
        }
        else {
            alert(`[message] Data received from server: ${event.data}`);
        }
    };
    socket.onclose = function(event) {
        console.log('close:'+JSON.stringify(event));
        if (event.wasClean) {
            console.log('[close] Connection died cleanly');
        } else {
            console.log('[close] Connection died');
        }
    };
    socket.onerror = function(error) {
        alert(`[error] ${error.message}`);
    };
    return socket;
}

var socket = initSocket();

function waitForSocket(callback) {
    if (socket.ready)
        callback(socket);
}

var getSocket;
getSocket = function(callback) {
    if (socket.readyState == WebSocket.OPEN) {
        console.log('got socket')
        callback(socket);
    } else if (socket.readyState == WebSocket.CONNECTING) {
        console.log('waiting for socket');
        setTimeout(() => {getSocket(callback);}, 400);
    } else {
        console.log('initializing socket');
        socket = initSocket();
        setTimeout(() => {getSocket(callback);}, 400);
    }
}

function sendToApi(json) {
    getSocket((s) => {s.send(JSON.stringify(json));});
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
    setCookie('modifier', document.getElementById('modifierInput').value, 8); // lasts 8 days
}

function createSession() {
    console.log('creating a session');
    sendToApi({
        service: "initiative",
        action: "create",
        data: {}
    });
}

function resetSession() {
    console.log('creating a session');
    sendToApi({
        service: "initiative",
        action: "reset",
        data: {
            session: sessionCode
        }
    });
}
