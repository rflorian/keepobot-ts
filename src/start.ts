import {logger} from './logger';
import {config} from './config';
import {appNameAndVersion} from './util';
import {KeepoBotChatEvent, TwitchJSOptions} from './api';
import {KeepoBot} from './KeepoBot';

const twitchOptions: TwitchJSOptions = {
    channels: [`#${config.twitch.stream.channel}`],
    identity: {
        username: config.twitch.bot.username,
        password: config.twitch.bot.password
    }
};

logger.debug(`Starting ${appNameAndVersion}`);
const bot = new KeepoBot(twitchOptions).start();

bot.addEvent(new KeepoBotChatEvent(
    'shutdown',
    (message, userState) => message === '!stop' && userState.username === config.twitch.stream.channel,
    bot => bot.say(`TFW ded after ${bot.uptime}ms FeelsBadMan :gun:`).stop()
));

bot.addEvent(new KeepoBotChatEvent(
    'kappa',
    message => message === 'Kappa',
    bot => bot.say('MrDestructoid')
));
