import {TwitchUserState} from '../twitch';

export type TwitchBotEventHandler<B> = (bot: B, ...args: any[]) => any;

export type TwitchBotChatEventHandler<B> = (bot: B,
                                            message: string,
                                            userState: TwitchUserState,
                                            channel: string) => any; // refactor resulting type into command
