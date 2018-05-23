import {TwitchBotChatEventHandler, TwitchBotEventTrigger} from '../events';
import {KeepoBot} from '../../KeepoBot';
import {KeepoBotCommand} from './commands';
import {KeepoBotEvent} from './KeepoBotEvent';

export class KeepoBotChatEvent extends KeepoBotEvent<'chat'> {
    constructor(public id: string,
                public trigger: TwitchBotEventTrigger,
                public handler: TwitchBotChatEventHandler<KeepoBot, KeepoBotCommand>) {
        super(id, trigger, handler);
    }
}
