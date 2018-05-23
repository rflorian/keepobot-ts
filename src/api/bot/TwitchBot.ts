import {TwitchBotEvent} from '../events';
import {TwitchBotTask} from '../tasks';

export interface TwitchBot<B, C> {
    start: () => Promise<this>;
    stop: () => Promise<this>;

    addEvent: (event: TwitchBotEvent<B, string, C>) => this;
    removeEvent: (event: TwitchBotEvent<B, string, C>) => this;

    startTask: (task: TwitchBotTask<B, C>) => this;
    stopTask: (task: TwitchBotTask<B, C>) => this;

    uptime: number;
}
