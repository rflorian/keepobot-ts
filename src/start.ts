import {logger}            from './logger';
import {config}            from './config';
import {appNameAndVersion} from './util';
import {TwitchJsOptions}   from './api';
import {KeepoBot}          from './bot';

const twitchOptions: TwitchJsOptions = {
    channels: [`#${config.twitch.stream.channel}`],
    identity: {
        username: config.twitch.bot.username,
        password: config.twitch.bot.password
    }
};

logger.level = 'debug';
logger.info(`Starting ${appNameAndVersion}`);
const keepoBot = new KeepoBot(twitchOptions);
keepoBot.start();
