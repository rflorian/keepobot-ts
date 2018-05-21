import {KeepoBotCommand} from '../keepobot/commands';

export interface TwitchBotTask<B> {
    id: string;
    callback: (bot: B) => KeepoBotCommand[];
    interval: number;
}
