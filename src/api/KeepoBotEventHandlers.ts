import {TwitchUserState} from './TwitchUserState';
import {KeepoBot} from '../KeepoBot';

export type KeepoBotEventHandler = (bot: KeepoBot, ...args: any[]) => any;

export type KeepoBotChatHandler = (bot: KeepoBot,
                                   message: string,
                                   userState: TwitchUserState,
                                   channel: string) => any;
