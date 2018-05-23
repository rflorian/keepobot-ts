import {logger} from './logger';
import {config} from './config';
import {appNameAndVersion} from './util';
import {KeepoBotChatEvent, SayCommand, StopCommand, TwitchJSOptions} from './api';
import {KeepoBot} from './KeepoBot';

const twitchOptions: TwitchJSOptions = {
    channels: [`#${config.twitch.stream.channel}`],
    identity: {
        username: config.twitch.bot.username,
        password: config.twitch.bot.password
    }
};

logger.debug(`Starting ${appNameAndVersion}`);
const keepoBot = new KeepoBot(twitchOptions);
keepoBot.start();

keepoBot.addEvent(new KeepoBotChatEvent(
    'shutdown',
    (message, userState) => message === '!stop' && userState.username === config.twitch.stream.channel,
    bot => [
        new SayCommand(`TFW ded after ${bot.uptime}ms FeelsBadMan :gun:`),
        new StopCommand()
    ]
));
keepoBot.addEvent(new KeepoBotChatEvent(
    'kappa',
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

// keepoBot.startTask(new KeepoBotTask(
//     'HeyGuys',
//     bot => [new SayCommand(`online for ${bot.uptime}ms monkaS`)],
//     5000
// ));
