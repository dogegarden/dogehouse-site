const Calls = require('../database/functions');

class SocketHandler {

  static respond(msg, roomId, type = 'consoleCommandReturn') {
    this.io.to(roomId).emit(type, msg)
  }

  _io;
  get io() { return _io }
  set io(io) { this._io = io }

  static handle(clientIO) {
    this.io = clientIO;
    this.io.on('connection', async (socket) => {
      const intention = decodeURIComponent(socket.handshake.query.intention)
      const token = decodeURIComponent(socket.handshake.query.authToken)
      let id = decodeURIComponent(socket.handshake.query.authId)
      const subuser = decodeURIComponent(socket.handshake.query.subUser)
      const userName = decodeURIComponent(socket.handshake.query.userName)
      const botId = decodeURIComponent(socket.handshake.query.botId)
      if(
        id === undefined            ||
        id === null                 ||
        token === undefined         ||
        token === null              ||
        subuser === undefined       ||
        subuser === null            ||
        userName === undefined      ||
        userName === null           ||
        intention === undefined     ||
        intention === null
      ) {
        socket.emit('fd')
        socket.disconnect()
        return
      }
      if(intention === 'botConsole' && (botId === undefined || botId === null)) {
        socket.emit('fd')
        socket.disconnect()
        return
      }
      const valid = await Calls.isValidToken(id, token)
      if(!valid) {
        socket.emit('fd')
        socket.disconnect()
        return
      }
      Calls.deleteToken(id)
      if(subuser !== 'NONE') id = subuser
      switch (intention) {
        case 'panelConsole':
          this.handleNewSocketPanelConsole(socket, id, userName)
          break
        
        case 'botConsole':
          this.handleNewSocketBotConsole(socket, botId, userName)
          break
        
        default:
          socket.emit('fd')
          socket.disconnect()
          break
      }
    });
  }

  static parseDispatcherData(data) {
    const d = Buffer.from(data, 'base64').toString('binary').split('|DISPATCHER-DATA|')
    return {
      executor: d[0],
      userId: d[1]
    }
  }

  static handleNewSocketPanelConsole(socket, id, userName) {
    const roomId = `panel_${id}`
    socket.join(roomId)
    setTimeout(() => {
      this.respond(`${userName} has joined the console.`, roomId, 'console')
    }, 500);
    socket.emit(
      'consoleBegin',
      [
        '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=',
        ' ',
        'DogeHotel - dogehouse.xyz',
        'This service is currently in beta.',
        'Add your dogehouse auth tokens in the settings tab to get started.',
        ' ',
        '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-='
      ]
    );

    //need to actually auth key with ingress when we get ingress server
    socket.emit('console',`(${socket.id}) Room ingress key authenticated. Welcome.`);
    let interval = setInterval(function() {
      socket.emit('console',`Sending heartbeat to ingress.`);
      // need to setup ingress later
    }, 60000);//should maybe be longer?
    
    socket.on(
      'consoleCommand',
      async (pData) => {
        try {
          // "!" is prefix
          if(typeof pData !== 'string') return;
          const tmpData = pData.split('|DISPATCHER|')
          const parsedData = this.parseDispatcherData(tmpData.shift())
          if(!tmpData[0].startsWith('!')) return
          this.respond(`[${parsedData.executor}]: ${tmpData[0]}`, roomId)
          const args = tmpData[0].split(' ')
          const cmd = args.shift().replace('!', '').toLowerCase()
          switch (cmd) {
            case 'help':
              this.respond('Commands: !ping', roomId)
              break;

            case 'ping':
              socket.emit('sh_ping')
              let ms = Date.now()
              socket.once('sh_pong', () => {
                ms = Date.now() - ms
                this.respond(`Pong: ${ms}ms (for ${parsedData.executor})`, roomId)
              })
              break;

            default:
              socket.emit('console', `Unknown command: !${cmd}`)
              break;
          }
        } catch (e) {
          // empty catch block
        }
      }
    );
    socket.on('disconnect', () => {
      this.respond(`${userName} has left the console.`, roomId, 'console')
      clearInterval(interval);

    })
  }
}

module.exports = SocketHandler;