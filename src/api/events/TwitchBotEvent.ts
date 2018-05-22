import {TwitchBotChatEventHandler, TwitchBotEventHandler, TwitchBotEventTrigger} from './index';

export interface TwitchBotEvent<B, T, C> {
    id: string;
    trigger: TwitchBotEventTrigger;
    handler: T extends 'chat' ? TwitchBotChatEventHandler<B, C> : TwitchBotEventHandler<B, C>;
}
