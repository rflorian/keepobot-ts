import {TwitchBotChatEventHandler, TwitchBotEvent, TwitchBotEventTrigger} from '../events';
import {KeepoBot} from '../../KeepoBot';

export class KeepoBotChatEvent implements TwitchBotEvent<KeepoBot, 'chat'> {
    constructor(public id: string,
                public trigger: TwitchBotEventTrigger,
                public handler: TwitchBotChatEventHandler<KeepoBot>) {
    }
}
