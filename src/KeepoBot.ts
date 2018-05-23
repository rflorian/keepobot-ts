import * as TwitchJS from 'twitch-js';
import {
    KeepoBotChatEvent,
    KeepoBotCommand,
    KeepoBotEvent,
    KeepoBotTask,
    SayCommand,
    StopCommand,
    TwitchBot,
    TwitchBotChatEventHandler,
    TwitchBotEventHandler,
    TwitchBotEventTrigger,
    TwitchClient,
    TwitchJSOptions,
    TwitchUserState
} from './api';
import {logger} from './logger';
import {config} from './config';
import {Subject, Subscription, timer} from 'rxjs';
import {KeepoBotIO} from './KeepoBotIO';
import * as request from 'request';
import * as fs from 'fs';
import * as path from 'path';

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
    private readonly twitch: TwitchClient;
    private chatEventListeners: KeepoBotEventListeners<'chat'> = {};
    private eventListeners: KeepoBotEventListeners<Exclude<string, 'chat'>> = {};
    private tasks: KeepoBotTasks = {};

    private readonly fromIRC$: Subject<any>;
    private readonly toIRC$: Subject<SayCommand>;
    private readonly commands$: Subject<KeepoBotCommand>;
    private io: KeepoBotIO;

    private startUpTimestamp;
    private emotes = {}; // TODO: move to static API

    get uptime() {
        return this.startUpTimestamp ? new Date().getTime() - this.startUpTimestamp : undefined;
    }

    constructor(private twitchOptions: TwitchJSOptions) {
        this.twitch = new TwitchJS.Client(twitchOptions);
        this.twitch.on('disconnected', reason => logger.debug(`Client disconnected: ${reason}`));

        this.fromIRC$ = new Subject();
        this.fromIRC$.subscribe(data => this.handleTwitchChatEvents.bind(this)(...data));
        this.toIRC$ = new Subject();
        this.io = new KeepoBotIO(this.twitch, this.toIRC$, this.fromIRC$);

        this.commands$ = new Subject();
        this.commands$.subscribe(cmd => {
            logger.debug(`Evaluating command [${cmd.type}]`);
            if (cmd instanceof SayCommand) this.toIRC$.next(cmd);
            else if (cmd instanceof StopCommand) this.stop();
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

    async start() {
        logger.trace('Client connecting');
        this.initEmoteData();
        await this.io.start();
        this.startUpTimestamp = new Date().getTime();
        return this;
    }

    async stop() {
        this._stopAllTasks();
        await this.io.stop();
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
                .forEach(cmd => this.commands$.next(cmd)));
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

    private initEmoteData() {
        const jsonPath = path.join(__dirname, '..', 'tmp', 'emotes.json');
        // if (fs.existsSync(jsonPath)) {
        //     logger.debug('Fetching existing emote data');
        //     const start = new Date().getTime();
        //     // TODO: change local emote caching to prevent heap OOM errors
        //     fs.readFile(jsonPath, (err, body) => {
        //         const delay = new Date().getTime() - start;
        //         if (err) logger.error(`Failed loading local emote data after ${delay}ms`, err);
        //         else {
        //             logger.debug(`Loaded cached emote data with ${Object.keys(body).length} entries after ${delay}ms`);
        //             this.emotes = body;
        //         }
        //     });
        //
        //     const lastChange = fs.statSync(jsonPath).mtime.getTime();
        //     if (new Date().getTime() - lastChange < 3600 * 1000) return;
        // }
        // else {
            logger.debug('Fetching new emote data');
            const start = new Date().getTime();
            request({
                url: config.twitch.api.emotes.data,
                json: true
            }, (err, res, body) => {
                const delay = new Date().getTime() - start;
                if (err) logger.error(`Failed loading remote emote data after ${delay}ms`, err);
                else {
                    logger.debug(`Received emote data with ${Object.keys(body).length} entries after ${delay}ms`);
                    this.emotes = body;
                    fs.writeFileSync(jsonPath, JSON.stringify(body));
                }
            });
        // }
    }

    getEmoteName(emoteId: string) {
        const emote = this.emotes[emoteId];
        return emote ? emote.code : config.defaultEmote;
    }
}
