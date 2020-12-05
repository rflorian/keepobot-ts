import {KeepoBotChatEvent, KeepoBotSayCommand, KeepoBotChatEvents} from '../../api';

export const commandsHandler = new KeepoBotChatEvent(
    'commandsHandler',
    msg => msg.toLowerCase().startsWith(KeepoBotChatEvents.Commands),
    bot => {
        const commands = bot.events.map(e => e.id).join(', ');
        const commandIds = Object.values(KeepoBotChatEvents).map(t => `"${t}"`).join(', ');
        return [new KeepoBotSayCommand(`My commands are ${commands}. Their IDs are ${commandIds}`)]
    }
);
