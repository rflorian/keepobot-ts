import {TwitchBotChatEventHandler, TwitchBotEventTrigger} from '../events';
import {KeepoBot}                                         from '../../bot/keepo-bot';
import {KeepoBotCommand}                                  from './commands';
import {KeepoBotEvent}                                    from './keepo-bot-event';

export class KeepoBotChatEvent extends KeepoBotEvent<'chat'> {
    constructor(public id: string,
                public trigger: TwitchBotEventTrigger,
                public handler: TwitchBotChatEventHandler<KeepoBot, KeepoBotCommand>) {
        super(id, trigger, handler);
    }
}