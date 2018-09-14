import { KeepoBotChatEvent, KeepoBotSayCommand } from '../../api';

export const emoteHandler = new KeepoBotChatEvent(
    'emoteHandler',
    (_, userState) => !!userState.emotes,
    (bot, _, userState) => {
        const emotes = Object.entries(userState.emotes)
            .map(([id, entries]) => `${(bot.getEmoteName(id) + ' ').repeat(entries.length)}`)
            .reverse()
            .join('');
        return [new KeepoBotSayCommand(emotes)];
    }
);
