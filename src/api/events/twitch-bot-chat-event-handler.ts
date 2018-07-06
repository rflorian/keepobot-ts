import {TwitchUserState} from '../twitch';

export type TwitchBotChatEventHandler<B, C> = (bot: B,
                                               message: string,
                                               userState: TwitchUserState,
                                               channel: string) => C[];
