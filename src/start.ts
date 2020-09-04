import {logger} from './logger';
import {config} from './config';
import {appNameAndVersion} from './util';
import {TwitchJsOptions} from './api';
import {KeepoBot} from './bot';

const twitchOptions: TwitchJsOptions = {
    channels: [`#${config.twitch.stream.channel}`],
    identity: {
        username: config.twitch.bot.username,
        password: config.twitch.bot.password
    }
};

(async () => {
    logger.level = 'debug';
    logger.info(`${appNameAndVersion} starting`);
    const keepoBot = new KeepoBot(twitchOptions);
    await keepoBot.start();
    logger.info(`${appNameAndVersion} successfully started`);
})();
