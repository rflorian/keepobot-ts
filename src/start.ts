import {logger} from './logger';
import {config} from './config';
import {appNameAndVersion} from './util';
import {KeepoBotChatEvent, SayCommand, StopCommand, TwitchJSOptions} from './api';
import {KeepoBot} from './KeepoBot';
import {KeepoBotTask} from './api/keepobot/KeepoBotTask';

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
    bot => [
        new SayCommand(`TFW ded after ${bot.uptime}ms FeelsBadMan :gun:`),
        new StopCommand()
    ]
));
bot.addEvent(new KeepoBotChatEvent(
    'kappa',
    message => message === 'Kappa',
    () => [new SayCommand('MrDestructoid')]
));

bot.startTask(new KeepoBotTask(
    'HeyGuys',
    bot => [new SayCommand(`online for ${bot.uptime}ms monkaS`)],
    5000
));
