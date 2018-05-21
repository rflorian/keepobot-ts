import {TwitchBotEvent} from '../events';

export interface TwitchBot<B> {
    start: () => this;
    stop: () => this;

    addEvent: (event: TwitchBotEvent<B, string>) => this;
    removeEvent: (event: TwitchBotEvent<B, string>) => this;

    addTask?: (id: string, task: (bot: this) => void, interval: number) => this;
    removeTask?: (id: string) => this;

    uptime: number;
}
