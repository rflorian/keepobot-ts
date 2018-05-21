import {TwitchBotEvent} from '../events';
import {TwitchBotTask} from '../tasks';

export interface TwitchBot<B> {
    start: () => this;
    stop: () => this;

    addEvent: (event: TwitchBotEvent<B, string>) => this;
    removeEvent: (event: TwitchBotEvent<B, string>) => this;

    startTask: (task: TwitchBotTask<B>) => this;
    stopTask: (task: TwitchBotTask<B>) => this;

    uptime: number;
}
