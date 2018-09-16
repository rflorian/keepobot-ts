import { KeepoBotChatEvent, KeepoBotSayCommand, KeepoBotChatTriggers } from '../../api';

export const commandsHandler = new KeepoBotChatEvent(
    'commandsHandler',
    msg => msg.toLowerCase().startsWith(KeepoBotChatTriggers.COMMANDS),
    bot => [new KeepoBotSayCommand(`My commands are ${bot.events.map(e => e.id).join(', ')}. Their IDs are ${Object.values(KeepoBotChatTriggers).map(t => `"${t}"`).join(', ')}`)]
);
