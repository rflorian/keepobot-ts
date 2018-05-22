import {TwitchBotChatEventHandler, TwitchBotEvent, TwitchBotEventTrigger} from '../events';
import {KeepoBot} from '../../KeepoBot';
import {KeepoBotCommand} from './commands';

export class KeepoBotChatEvent implements TwitchBotEvent<KeepoBot, 'chat', KeepoBotCommand> {
    constructor(public id: string,
                public trigger: TwitchBotEventTrigger,
                public handler: TwitchBotChatEventHandler<KeepoBot, KeepoBotCommand>) {
    }
}
