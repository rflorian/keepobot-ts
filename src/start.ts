import {logger} from './logger';
import {config} from './config';
import {appNameAndVersion} from './util';
import {KeepoBotChatEvent, KeepoBotTask, SayCommand, StopCommand, TwitchJSOptions} from './api';
import {KeepoBot} from './KeepoBot';

const twitchOptions: TwitchJSOptions = {
    channels: [`#${config.twitch.stream.channel}`],
    identity: {
        username: config.twitch.bot.username,
        password: config.twitch.bot.password
    }
};

logger.level = 'info';
logger.info(`Starting ${appNameAndVersion}`);
const keepoBot = new KeepoBot(twitchOptions);
keepoBot.start();

keepoBot.addEvent(new KeepoBotChatEvent(
    'shutdownEvent',
    (message, userState) => message === '!stop' && userState.username === config.twitch.stream.channel,
    bot => [
        new SayCommand(`TFW ded after ${bot.uptime}ms FeelsBadMan :gun:`),
        new StopCommand()
    ]
));
keepoBot.addEvent(new KeepoBotChatEvent(
    'kappaEvent',
    message => message === 'Kappa',
    () => [new SayCommand('MrDestructoid')]
));
keepoBot.addEvent(new KeepoBotChatEvent(
    'emoteRepeater',
    (message, userState) => !!userState.emotes,
    (bot, message, userState) => {
        const emotes = Object.entries(userState.emotes)
            .map(([id, ranges]) => `${(bot.getEmoteName(id) + ' ').repeat(ranges.length)}`)
            .reverse()
            .join('');
        return [new SayCommand(emotes)];
    }
));

keepoBot.startTask(new KeepoBotTask(
    'periodicUptime',
    bot => [new SayCommand(`online for ${Math.round(bot.uptime / (60 * 1000))}min monkaS`)],
    60000
));
