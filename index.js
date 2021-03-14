require('dotenv').config();
const client = new (require('./src/classes/App'));
const Logger = require('./src/util/Logger');
const SocketHandler = require('./src/util/SocketHandler');

(async function () {
    await client.registerRoutes();
    await client.listen(() => {
        Logger.info(`Express serving on port ${process.env.PORT}`);
        SocketHandler.handle(client.io);
    }, true);
})();