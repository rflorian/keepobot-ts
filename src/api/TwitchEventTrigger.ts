import {TwitchUserState} from './TwitchUserState';

export type TwitchEventTrigger = (message: string,
                                  userState: TwitchUserState,
                                  channel: string) => boolean;
