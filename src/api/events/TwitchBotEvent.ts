import {TwitchBotChatEventHandler, TwitchBotEventHandler, TwitchBotEventTrigger} from './index';

export interface TwitchBotEvent<B, T extends string = 'event'> {
    id: string;
    trigger: TwitchBotEventTrigger;
    handler: T extends 'chat' ? TwitchBotChatEventHandler<B, any> : TwitchBotEventHandler<B, any>;
}
