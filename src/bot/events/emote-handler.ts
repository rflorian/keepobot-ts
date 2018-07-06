import {KeepoBotChatEvent, KeepoBotSayCommand} from '../../api';

export const emoteHandler= new KeepoBotChatEvent(
    'emoteHandler',
    (message, userState) => !!userState.emotes,
    (bot, message, userState) => {
        const emotes = Object.entries(userState.emotes)
            .map(([id, entries]) => `${(bot.getEmoteName(id) + ' ').repeat(entries.length)}`)
            .reverse()
            .join('');
        return [new KeepoBotSayCommand(emotes)];
    }
);
