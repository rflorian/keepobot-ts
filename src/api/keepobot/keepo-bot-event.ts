import {KeepoBot}                                                                                from '../../bot';
import {TwitchBotChatEventHandler, TwitchBotEvent, TwitchBotEventHandler, TwitchBotEventTrigger} from '../events';
import {KeepoBotCommand}                                                                         from './commands';

export class KeepoBotEvent<T extends string> implements TwitchBotEvent<KeepoBot, T, KeepoBotCommand> {
    constructor(public id: string,
                public trigger: TwitchBotEventTrigger,
                public handler: T extends 'chat' ?
                    TwitchBotChatEventHandler<KeepoBot, KeepoBotCommand> :
                    TwitchBotEventHandler<KeepoBot, KeepoBotCommand>) {
    }
}
