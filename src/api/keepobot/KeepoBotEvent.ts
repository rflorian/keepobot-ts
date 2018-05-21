import {TwitchBotEvent, TwitchBotEventHandler, TwitchBotEventTrigger} from '../events';
import {KeepoBot} from '../../KeepoBot';

export class KeepoBotEvent<T extends Exclude<string, 'chat'>> implements TwitchBotEvent<KeepoBot> {
    constructor(public id: string,
                public trigger: TwitchBotEventTrigger,
                public handler: TwitchBotEventHandler<KeepoBot>) {
    }
}
