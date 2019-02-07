import {KeepoBotChatEvent, KeepoBotSayCommand, KeepoBotChatTriggers} from '../../api';

export const commandsHandler = new KeepoBotChatEvent(
    'commandsHandler',
    msg => msg.toLowerCase().startsWith(KeepoBotChatTriggers.COMMANDS),
    bot => {
        const commands = bot.events.map(e => e.id).join(', ');
        const commandIds = Object.values(KeepoBotChatTriggers).map(t => `"${t}"`).join(', ');
        return [new KeepoBotSayCommand(`My commands are ${commands}. Their IDs are ${commandIds}`)]
    }
);
