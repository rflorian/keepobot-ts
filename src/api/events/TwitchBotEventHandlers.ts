import {TwitchUserState} from '../twitch';

export type TwitchBotEventHandler<B, C> = (bot: B, ...args: any[]) => C[];

export type TwitchBotChatEventHandler<B, C> = (bot: B,
                                               message: string,
                                               userState: TwitchUserState,
                                               channel: string) => C[];
