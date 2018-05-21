import {TwitchBotEventHandler} from '../events/TwitchBotEventHandler';

export interface TwitchClient {
    connect();

    disconnect();

    on(eventName: string, callback: TwitchBotEventHandler);

    say(channel: string, msg: string);
}
