import {KeepoBotChatHandler, KeepoBotEventHandler} from './KeepoBotEventHandlers';
import {TwitchEventTrigger} from './TwitchEventTrigger';

export interface TwitchBot {
    start: () => this;
    stop: () => this;

    addEvent?: (id: string, trigger: TwitchEventTrigger, handler: KeepoBotEventHandler) => this;
    removeEvent?: (id: string) => this;

    addChatEvent: (id: string, trigger: TwitchEventTrigger, handler: KeepoBotChatHandler) => this;
    removeChatEvent: (id: string) => this;

    addTask?: (id: string, task: (bot: this) => void, interval: number) => this;
    removeTask?: (id: string) => this;

    uptime: number;
}
