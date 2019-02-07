import {TwitchBotEventHandler} from '../events';

export interface TwitchClient {
    connect(): void;

    disconnect(): void;

    on(eventName: string, callback: TwitchBotEventHandler<any, any>): void;
    on(eventName: string, debug: (...data: any[]) => void): void;

    say(channel: string, msg: string): void;
}
