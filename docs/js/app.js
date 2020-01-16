
function validateInputs() {
    let nameIn = document.getElementById('characterNameInput').value;
    let codeIn = document.getElementById('sessionCodeInput').value;
    document.getElementById('joinButton').disabled = nameIn.length == 0 || codeIn.length !== 6;
}

function validateConnection() {
    document.getElementById('initiativeButton').disabled == socket.readyState !== WebSocket.OPEN;
}

function sessionParams() {
    let session = document.getElementById("sessionCodeInput").value;
    let name = document.getElementById("characterNameInput").value;
    return {
        session: session,
        name: name
    }
}
function submitCreate() {
    createSession();
}
function submitJoin() {
    let params = sessionParams();
    joinSession(params.session, params.name);
}
function submitInitiative() {
    sendInitiative({ 
        initiative: document.getElementById("initiativeInput").value,
        critical: document.getElementById("critInput").checked,
        surprised: document.getElementById("failInput").checked,
        modifier: document.getElementById("modifierInput").value
    });
}
document.getElementById("createForm").onsubmit = function(event) {
    event.preventDefault();
    submitCreate();
    return false;
}
document.getElementById("joinForm").onsubmit = function(event) {
    event.preventDefault();
    submitJoin();
    return false;
}
document.getElementById("initiativeForm").onsubmit = function(event) {
    event.preventDefault();
    submitInitiative();
    return false;
}

// get parameters from query string
let urlParams = new URLSearchParams(window.location.search);
console.log(JSON.stringify(urlParams));
if (urlParams.has('code'))
    sessionCode = urlParams.get('code');
if (urlParams.has('name'))
    characterName = urlParams.get('name');
document.getElementById('sessionCodeInput').value = sessionCode;
document.getElementById('characterNameInput').value = characterName;
document.getElementById('modifierInput').value = Number(getCookie('modifier')) || 0;

if (urlParams.has('code') && urlParams.get('code') == sessionCode  && (characterName.length || 0) > 1) {
    showSessionCode(sessionCode);
    submitJoin();
    console.log('automatically joining session ' + sessionCode);
}

var currentState = 'sessionUI';
function changeState(state) {
    console.log('changing session to '+state);
    document.getElementById(currentState).classList.remove("activestate");
    document.getElementById(state).classList.add("activestate");
    currentState = state;
}

validateInputs();
validateConnection();