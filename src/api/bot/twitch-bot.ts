import {TwitchBotEvent} from '../events';
import {TwitchBotTask} from '../tasks';

export interface TwitchBot<B, C> {
    start: () => this | Promise<this>;
    stop: () => this;

    addEvent: (event: TwitchBotEvent<B, string, C>) => this;
    removeEvent: (event: TwitchBotEvent<B, string, C>) => this;
    events: TwitchBotEvent<B, string, C>[];

    addTask: (task: TwitchBotTask<B, C>) => this;
    removeTask: (task: TwitchBotTask<B, C>) => this;

    uptime: number;
}
