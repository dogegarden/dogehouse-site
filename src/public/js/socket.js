const xhr = new XMLHttpRequest();
const consoleWindow = document.getElementById('console-window-inner');
const consoleInput = document.getElementById('console-input');
let reconnecting = false;
let fd = false;
let socket;
let intention = document.getElementById('getIntention') === null ? 'panelConsole' : document.getElementById('getIntention').value

xhr.open('POST', 'http://localhost:3071/api/token', true);

xhr.setRequestHeader('Content-Type', 'application/json');
xhr.withCredentials = true;

xhr.send();

xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        if (xhr.status == 200) {
            const { token } = JSON.parse(xhr.responseText);
            socket = io('http://localhost:3071', { reconnection: false, query: `intention=${encodeURIComponent(intention)}&authToken=${token}&authId=${encodeURIComponent(getUserId())}&subUser=${encodeURIComponent(getSubUser())}&userName=${encodeURIComponent(getName())}` + (intention === 'botConsole' ? `&botId=${encodeURIComponent(getBotId())}` : '') });

            socket.once('connect', () => {

                if (reconnecting === true) {
                    addToConsole('Successfully reconnected to the socket!')
                    reconnecting = false
                }

                socket.once('consoleBegin', (data) => {
                    try { $(spinner).hide() } catch (e) { /* empty catch block */ }
                    data.forEach((msg) => {
                        if (msg.includes('<BOT-NAME-PLACEHOLDER>')) {
                            msg = msg.replace('<BOT-NAME-PLACEHOLDER>', `<code>${getBotName()}</code>`)
                        }
                        addToConsole(msg)
                    })
                });

                $(document).ready(function() {
                    $('#startBtn').click(async function() {
                        startAllBots()
                    });
                    $('#restartBtn').click(async function() {
                        restartAllBots()
                    });
                    $('#stopBtn').click(async function() {
                        stopAllBots()
                    });
                });

                socket.on('panelNewStatus', (tmp) => {
                    const data = tmp.split('|DISPATCHER-STATUS|')
                    if (data[0] === 'on') {
                        document.getElementById('statusBodyText').innerHTML = `<i class="status-on-circle fas fa-circle"></i> RUNNING`
                        document.getElementById('startBtn').disabled = true
                        document.getElementById('restartBtn').disabled = true
                        document.getElementById('stopBtn').disabled = false
                    } else {
                        document.getElementById('statusBodyText').innerHTML = `<i class="status-off-circle fas fa-circle"></i> STOPPED`
                        document.getElementById('startBtn').disabled = false
                        document.getElementById('restartBtn').disabled = false
                        document.getElementById('stopBtn').disabled = true
                    }
                    if (data[1] !== undefined) {
                        document.getElementById('accountsRunning').innerHTML = `${data[1]}`
                    }
                });

                socket.on('consoleNewStatus', (tmp) => {
                    const data = tmp.split('|DISPATCHER-STATUS|')
                    if (data[0] === 'on') {
                        document.getElementById('statusBodyText').innerHTML = `<i class="status-on-circle fas fa-circle"></i> RUNNING`
                    } else {
                        addToConsole('The bot just went offline, meaning you cannot execute commands or say messages anymore!')
                        document.getElementById('statusBodyText').innerHTML = `<i class="status-off-circle fas fa-circle"></i> STOPPED`
                    }
                    if (data[1] !== undefined) {
                        document.getElementById('hubName').innerHTML = `${upper(data[1])}`
                    }
                    if (data[2] !== undefined) {
                        document.getElementById('currentLobby').innerHTML = `#${data[2]}`
                    }
                });

                socket.on('console', (data) => {
                    addToConsole(data)
                });

                socket.on('consoleBot', (data) => {
                    const ansi_up = new AnsiUp;
                    const html = ansi_up.ansi_to_html(data);
                    addToConsole(html, 'CHAT')
                });

                socket.on('consoleCommandReturn', (data) => {
                    addToConsole(data, 'CMD')
                });

                socket.on('sh_ping', () => {
                    socket.emit('sh_pong')
                })

            });

            socket.on('fd', () => {
                fd = true
                reconnecting = true
                addToConsole('Could not authenticate socket, please reload and try again.', 'ERROR', true)
            });
            socket.once('disconnect', () => {
                if (fd === false) {
                    reconnecting = true
                    addToConsole('Disconnected from the socket, reconnecting.', 'WARN', true)
                    window.location.reload()
                }
            });
        }
    }
};

function date() {
    return new Date().toTimeString().split(' ')[0]
}

function addToConsole(msg, type = 'INFO', internal = false) {
    if (internal) {
        consoleWindow.innerHTML = `<span style="color: yellow !important;">${msg}</span><br>`
        consoleWindow.scrollTop = consoleWindow.scrollHeight
        return
    }
    consoleWindow.innerHTML += `[${date()} ${type}]: ${msg}<br>`
    consoleWindow.scrollTop = consoleWindow.scrollHeight
}

function getName() {
    return `${document.getElementById('getUserName').value}#${document.getElementById('getDiscriminator').value}`
}

function getUserId() {
    return `${document.getElementById('getUserId').value}`
}

function getSubUser() {
    return `${document.getElementById('getSubUser').value}`
}

function parseDispatcherData() {
    return btoa(`${getName()}|DISPATCHER-DATA|${getUserId()}`)
}

function upper(txt) {
    return txt.substring(0, 1).toUpperCase() + txt.substring(1)
}

$('.input').keypress(function(event) {
    if ((27 === event.which) || (13 === event.which)) {
        event.preventDefault()
        if (
            fd === true ||
            reconnecting === true ||
            consoleInput.value == '' ||
            consoleInput.value.trim() == '' ||
            consoleInput.value.trim().length <= 1
        ) return;
        socket.emit('consoleCommand', `${parseDispatcherData()}|DISPATCHER|${consoleInput.value}`);
        event.currentTarget.value = "";
        return false;
    }
});
