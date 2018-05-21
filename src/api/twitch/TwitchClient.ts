import {TwitchBotEventHandler} from '../events';

export interface TwitchClient {
    connect();

    disconnect();

    on(eventName: string, callback: TwitchBotEventHandler);

    say(channel: string, msg: string);
}
