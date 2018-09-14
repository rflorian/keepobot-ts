import {KeepoBotChatEvent, KeepoBotSayCommand, KeepoBotStopCommand} from '../../api';
import {config}                                                     from '../../config';

export const shutdownHandler = new KeepoBotChatEvent(
    'shutdownHandler',
    (msg, userState) => msg === '!stop' && userState.username === config.twitch.stream.channel,
    bot => [
        new KeepoBotSayCommand(`TFW ded after ${bot.uptime}ms FeelsBadMan :gun:`),
        new KeepoBotStopCommand()
    ]
);
