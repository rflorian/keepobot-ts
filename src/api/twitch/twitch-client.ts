import {TwitchBotEventHandler} from '../events';
import {TwitchUserState} from './twitch-user-state';

export interface TwitchClient {
    connect(): void;

    disconnect(): void;

    on(eventName: string, callback: TwitchBotEventHandler<any, any>): void;
    on(eventName: 'chat', callback: ([channel, userState, message, self]: [string, TwitchUserState, string, boolean]) => void): void;
    on(eventName: 'disconnected', callback: (reason: string) => void): void;

    say(channel: string, msg: string): void;
}
