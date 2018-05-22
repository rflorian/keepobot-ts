import * as TwitchJS from 'twitch-js';
import {
    KeepoBotChatEvent,
    KeepoBotCommand, KeepoBotTask,
    SayCommand,
    StopCommand,
    TwitchBot,
    TwitchBotChatEventHandler,
    TwitchBotEvent,
    TwitchBotEventHandler,
    TwitchBotEventTrigger,
    TwitchClient,
    TwitchJSOptions,
    TwitchUserState
} from './api';
import {logger} from './logger';
import {config} from './config';
import {appNameAndVersion} from './util';
import {Subscription, timer, Subject} from 'rxjs';
import {KeepoBotEvent} from './api/keepobot/KeepoBotEvent';

type KeepoBotEventListeners<T> = {
    [id: string]: {
        trigger: TwitchBotEventTrigger,
        handler: T extends 'chat' ?
            TwitchBotChatEventHandler<KeepoBot, KeepoBotCommand> :
            TwitchBotEventHandler<KeepoBot, KeepoBotCommand>
    }
};
type KeepoBotTasks = {[id: string]: Subscription};

export class KeepoBot implements TwitchBot<KeepoBot, KeepoBotCommand> {
    private twitch: TwitchClient;
    private chatEventListeners: KeepoBotEventListeners<'chat'> = {};
    private eventListeners: KeepoBotEventListeners<Exclude<string, 'chat'>> = {};
    private tasks: KeepoBotTasks = {};

    private commands$: Subject<KeepoBotCommand>;

    private startUpTimestamp;

    get uptime() {
        return this.startUpTimestamp ? new Date().getTime() - this.startUpTimestamp : undefined;
    }

    constructor(private twitchOptions: TwitchJSOptions) {
        this.twitch = new TwitchJS.Client(twitchOptions);
        this.twitch.on('disconnected', reason => logger.debug(`Client disconnected: ${reason}`));
        this.twitch.on('chat', this.handleTwitchChatEvents.bind(this));

        // TODO: move into separate class
        this.commands$ = new Subject();
        this.commands$.subscribe(cmd => {
            logger.debug(`Evaluating command [${cmd.type}]`);
            if (cmd instanceof SayCommand) {
                this.twitch.say(cmd.channel, cmd.msg);
                logger.debug(`---> ${cmd.msg}`);
            }
            else if (cmd instanceof StopCommand) {
                this._stopAllTasks();
                this.twitch.disconnect();
                logger.trace('Client disconnecting');
            }
        });
    }

    // TODO: move into separate class
    private handleTwitchChatEvents(channel: string,
                                   userState: TwitchUserState,
                                   message: string,
                                   self: boolean) {
        if (self) return;
        logger.debug(`<--- ${userState.username}: ${message}`);

        Object.entries(this.chatEventListeners)
            .filter(([id, listener]) => listener.trigger(message, userState, channel))
            .forEach(([id, listener]) => {
                logger.trace(`Calling "${id}" handler with ${message}, ${userState}`);
                listener.handler(this, message, userState, channel)
                    .forEach(cmd => this.commands$.next(cmd));
            });
    }

    start() {
        logger.trace('Client connecting');
        this.twitch.connect().then(() => {
            logger.debug('Client connected');
            this.startUpTimestamp = new Date().getTime();
            this.say(`${appNameAndVersion} ready for duty MrDestructoid`)
        });
        return this;
    }

    stop() {
        this.commands$.next(new StopCommand());
        return this;
    }

    addEvent<T extends string>(event: KeepoBotEvent<T>) {
        if (event instanceof KeepoBotChatEvent) {
            this.chatEventListeners[event.id] = {trigger: event.trigger, handler: event.handler};
        }
        else this.eventListeners[event.id] = {trigger: event.trigger, handler: event.handler};
        logger.trace(`Added ${event.id} chat event`);
        return this;
    }

    removeEvent<T extends string>(event: KeepoBotEvent<T>) {
        if (event instanceof KeepoBotChatEvent) delete this.chatEventListeners[event.id];
        else delete this.eventListeners[event.id];
        logger.trace(`Removed ${event.id} chat event`);
        return this;
    }

    startTask(task: KeepoBotTask) {
        this.stopTask(task);
        this.tasks[task.id] = timer(task.interval, task.interval)
            .subscribe(() => task.callback(this)
                .forEach(cmd => this.commands$.next(cmd))); // TODO: parse callback res into commands
        logger.debug(`Added task ${task.id}`);
        return this;
    }

    stopTask(task: KeepoBotTask) {
        const subscription = this.tasks[task.id];
        if (subscription) {
            subscription.unsubscribe();
            logger.debug(`Removed task ${task.id}`);
        }
        return this;
    }

    private _stopAllTasks() {
        Object.values(this.tasks).forEach(task => task.unsubscribe());
    }

    // TODO: move to I/O unit which receives the twitch client
    say(msg: string, channel: string = config.twitch.stream.channel) {
        this.commands$.next(new SayCommand(msg, channel));
        return this;
    }
}
