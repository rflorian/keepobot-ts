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
import * as streamObject from 'stream-json/utils/StreamObject';
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

    start() {
        logger.trace('Client connecting');
        this._initEmoteData();
        this.io.start().then(() => this.startUpTimestamp = new Date().getTime());
        return this;
    }

    stop() {
        this._stopAllTasks();
        this.io.stop();
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
            .subscribe(() => task.callback(this).forEach(cmd => this.commands$.next(cmd)));
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

    private _initEmoteData() {
        const cachePath = path.join(__dirname, '..', 'tmp', 'emotes.json');
        if (fs.existsSync(cachePath)) {
            const lastChange = fs.statSync(cachePath).mtime.getTime();
            if (new Date().getTime() - lastChange < 3600 * 1000) {
                this._loadCachedEmoteData(cachePath);
                return;
            }
        }
        this._loadAndCacheEmoteData(cachePath);
    }

    private _loadCachedEmoteData(cachePath: string) {
        logger.debug('Loading cached emote data from', cachePath);
        const start = new Date().getTime();
        const jsonObjectParser = streamObject.make();
        jsonObjectParser.output.on('data', data => this.emotes[data.key] = data.value);
        jsonObjectParser.output.on('end', () => {
            const delay = new Date().getTime() - start;
            logger.debug(`Loaded cached emotes after ${delay}ms`);
            this.toIRC$.next(new SayCommand('Armed and ready SMOrc'));
        });
        fs.createReadStream(cachePath).pipe(jsonObjectParser.input);
    }

    private _loadAndCacheEmoteData(cachePath: string) {
        logger.debug('Fetching new emote data');
        const start = new Date().getTime();
        request({
            url: config.twitch.api.emotes.data,
            json: true
        }, (err, res, body) => {
            const delay = new Date().getTime() - start;
            if (err) logger.error(`Failed loading remote emote data after ${delay}ms`, err);
            else {
                logger.debug(`Received emote data after ${delay}ms`);
                this.emotes = body;

                logger.debug('Writing emote data to', cachePath);
                fs.writeFileSync(cachePath, JSON.stringify(this.emotes));

                this.toIRC$.next(new SayCommand('Armed and ready SMOrc'));
            }
        });
    }

    getEmoteName(emoteId: string) {
        const emote = this.emotes[emoteId];
        return emote ? emote.code : config.defaultEmote;
    }
}
