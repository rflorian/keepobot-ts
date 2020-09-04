import {Subject, Subscription, timer} from 'rxjs';
import * as TwitchJS from 'twitch-js';
import {KeepoBotChatEvent, KeepoBotCommand, KeepoBotEvent, KeepoBotSayCommand, KeepoBotStopCommand, KeepoBotTask, TwitchBot, TwitchBotChatEventHandler, TwitchBotEventHandler, TwitchBotEventTrigger, TwitchJsOptions, TwitchUserState} from '../api';
import {logger} from '../logger';
import {keepoBotEvents} from './events';
import {KeepoBotIo} from './keepo-bot-io';
import {keepoBotTasks} from './tasks';

type KeepoBotEventListeners<T> = Record<string, {
    trigger: TwitchBotEventTrigger,
    handler: T extends 'chat' ?
    TwitchBotChatEventHandler<KeepoBot, KeepoBotCommand> :
    TwitchBotEventHandler<KeepoBot, KeepoBotCommand>
}>;

export class KeepoBot implements TwitchBot<KeepoBot, KeepoBotCommand> {
    private readonly chatEventListeners: KeepoBotEventListeners<'chat'> = {};
    private readonly eventListeners: KeepoBotEventListeners<Exclude<string, 'chat'>> = {};
    private readonly tasks: Record<string, Subscription> = {};

    private readonly commands$ = new Subject<KeepoBotCommand>();
    private readonly io = new KeepoBotIo(new TwitchJS.Client(this.twitchOptions));

    private startUpTimestamp: number;

    constructor(private twitchOptions: TwitchJsOptions) {
        this.io.listen().subscribe(data => this.handleTwitchChatEvents.bind(this)(...data));

        this.commands$.subscribe(cmd => {
            logger.debug(`Evaluating command [${cmd.type}]`);
            if (cmd instanceof KeepoBotSayCommand) this.io.send(cmd);
            else if (cmd instanceof KeepoBotStopCommand) this.stop();
        });

        keepoBotEvents.forEach(e => this.addEvent(e));
        keepoBotTasks.forEach(t => this.addTask(t));
    }

    // TODO: move into separate class
    private handleTwitchChatEvents(
        channel: string,
        userState: TwitchUserState,
        message: string,
        sentBySelf: boolean,
    ) {
        if (sentBySelf) return;
        logger.debug(`<--- ${userState.username}: ${message}`);

        Object.entries(this.chatEventListeners)
            .filter(([id, listener]) => listener.trigger(message, userState, channel))
            .forEach(([id, listener]) => {
                logger.trace(`Calling "${id}" handler with ${message}, ${userState}`);
                listener.handler(this, message, userState, channel)
                    .forEach(cmd => this.commands$.next(cmd));
            });
    }

    async start() {
        logger.trace('Client connecting');
        await this.io.start();
        this.startUpTimestamp = Date.now();
        return this;
    }

    stop() {
        this._stopAllTasks();
        this.io.stop();
        return this;
    }

    get uptime() {
        if (!this.startUpTimestamp) return;

        return Date.now() - this.startUpTimestamp;
    }

    addEvent<T extends string>(event: KeepoBotEvent<T>) {
        if (event instanceof KeepoBotChatEvent) {
            this.chatEventListeners[event.id] = {trigger: event.trigger, handler: event.handler};
        }
        else this.eventListeners[event.id] = {trigger: event.trigger, handler: event.handler};
        logger.debug(`Added "${event.id}" event`);
        return this;
    }

    removeEvent<T extends string>(event: KeepoBotEvent<T>) {
        if (event instanceof KeepoBotChatEvent) delete this.chatEventListeners[event.id];
        else delete this.eventListeners[event.id];
        logger.debug(`Removed "${event.id}" event`);
        return this;
    }

    get events() {
        return Object.entries({...this.eventListeners, ...this.chatEventListeners})
            .map(([id, {trigger, handler}]) => ({id, trigger, handler}));
    }

    addTask(task: KeepoBotTask) {
        this.removeTask(task);
        this.tasks[task.id] = timer(task.interval, task.interval)
            .subscribe(() => task.callback(this).forEach(cmd => this.commands$.next(cmd)));
        logger.debug(`Added "${task.id}" task`);
        return this;
    }

    removeTask(task: KeepoBotTask) {
        const subscription = this.tasks[task.id];
        if (subscription) {
            subscription.unsubscribe();
            logger.debug(`Removed "${task.id}" task`);
        }
        return this;
    }

    private _stopAllTasks() {
        Object.values(this.tasks).forEach(task => task.unsubscribe());
    }
}
