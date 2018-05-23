import {TwitchBotEventHandler} from '../events';

export interface TwitchClient {
    connect();

    disconnect();

    on(eventName: string, callback: TwitchBotEventHandler<any, any>);
    on(eventName: string, debug: (...data: any[]) => void);

    say(channel: string, msg: string);
}
