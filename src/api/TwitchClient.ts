import {TwitchEventHandler} from './TwitchEventHandler';

export interface TwitchClient {
    connect();

    disconnect();

    on(eventName: string, callback: TwitchEventHandler);

    say(channel: string, msg: string);
}
