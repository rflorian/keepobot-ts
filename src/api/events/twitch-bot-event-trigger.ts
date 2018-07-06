import {TwitchUserState} from '../twitch';

export type TwitchBotEventTrigger = (message: string,
                                     userState: TwitchUserState,
                                     channel: string) => boolean;
