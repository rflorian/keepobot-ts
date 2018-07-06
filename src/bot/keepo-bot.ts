import * as TwitchJS                  from 'twitch-js';
import {
    KeepoBotChatEvent,
    KeepoBotCommand,
    KeepoBotEvent,
    KeepoBotSayCommand,
    KeepoBotStopCommand,
    KeepoBotTask,
    TwitchBot,
    TwitchBotChatEventHandler,
    TwitchBotEventHandler,
    TwitchBotEventTrigger,
    TwitchClient,
    TwitchJsOptions,
    TwitchUserState
}                                     from '../api/index';
import {logger}                       from '../logger';
import {config}                       from '../config';
import {Subject, Subscription, timer} from 'rxjs';
import {KeepoBotIo}                   from './keepo-bot-io';
import * as request                   from 'request';
import * as streamObject              from 'stream-json/utils/StreamObject';
import * as fs                        from 'fs';
import * as path                      from 'path';
import {KeepoBotTasks}                from './tasks';
import {KeepoBotEvents}               from './events';

type KeepoBotEventListeners<T> = {
    [id: string]: {
        trigger: TwitchBotEventTrigger,
        handler: T extends 'chat' ?
            TwitchBotChatEventHandler<KeepoBot, KeepoBotCommand> :
            TwitchBotEventHandler<KeepoBot, KeepoBotCommand>
    }
};

export class KeepoBot implements TwitchBot<KeepoBot, KeepoBotCommand> {
    private twitch: TwitchClient;
    private chatEventListeners: KeepoBotEventListeners<'chat'>              = {};
    private eventListeners: KeepoBotEventListeners<Exclude<string, 'chat'>> = {};
    private tasks: {[id: string]: Subscription}                             = {};

    private fromIRC$: Subject<any>;
    private toIRC$: Subject<KeepoBotSayCommand>;
    private commands$: Subject<KeepoBotCommand>;
    private io: KeepoBotIo;

    private startUpTimestamp;
    private emotes = {}; // TODO: move to static API

    get uptime() {
        if (!this.startUpTimestamp) return;
        return new Date().getTime() - this.startUpTimestamp;
    }

    constructor(private twitchOptions: TwitchJsOptions) {
        this.buildTwitchClient();
        this.buildIO();
        this.buildCommandListener();

        this.registerEvents();
        this.registerTasks();
    }

    private buildTwitchClient() {
        this.twitch = new TwitchJS.Client(this.twitchOptions);
        this.twitch.on('disconnected', reason => logger.debug(`Client disconnected: ${reason}`));
    }

    private buildIO() {
        this.fromIRC$ = new Subject();
        this.fromIRC$.subscribe(data => this.handleTwitchChatEvents.bind(this)(...data));
        this.toIRC$ = new Subject();
        this.io     = new KeepoBotIo(this.twitch, this.toIRC$, this.fromIRC$);
    }

    private buildCommandListener() {
        this.commands$ = new Subject();
        this.commands$.subscribe(cmd => {
            logger.debug(`Evaluating command [${cmd.type}]`);
            if (cmd instanceof KeepoBotSayCommand) this.toIRC$.next(cmd);
            else if (cmd instanceof KeepoBotStopCommand) this.stop();
        });
    }

    private registerEvents() { KeepoBotEvents.forEach(e => this.addEvent(e)); }

    private registerTasks() { KeepoBotTasks.forEach(t => this.startTask(t)); }

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
        await this._initEmoteData();
        await this.io.start();
        this.startUpTimestamp = new Date().getTime();
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
        logger.info(`Added "${event.id}" event`);
        return this;
    }

    removeEvent<T extends string>(event: KeepoBotEvent<T>) {
        if (event instanceof KeepoBotChatEvent) delete this.chatEventListeners[event.id];
        else delete this.eventListeners[event.id];
        logger.info(`Removed "${event.id}" event`);
        return this;
    }

    startTask(task: KeepoBotTask) {
        this.stopTask(task);
        this.tasks[task.id] = timer(task.interval, task.interval)
            .subscribe(() => task.callback(this).forEach(cmd => this.commands$.next(cmd)));
        logger.info(`Added "${task.id}" task`);
        return this;
    }

    stopTask(task: KeepoBotTask) {
        const subscription = this.tasks[task.id];
        if (subscription) {
            subscription.unsubscribe();
            logger.info(`Removed "${task.id}" task`);
        }
        return this;
    }

    private _stopAllTasks() { Object.values(this.tasks).forEach(task => task.unsubscribe()); }

    private async _initEmoteData() {
        const cachePath = path.join(__dirname, '..', '..', 'tmp', 'emotes.json');
        if (!fs.existsSync(cachePath)) return await this._loadAndCacheEmoteData(cachePath);

        const sinceLastChange = new Date().getTime() - fs.statSync(cachePath).mtime.getTime();
        const oneDay          = 24 * 60 * 60 * 1000;
        return sinceLastChange > oneDay ?
            await this._loadAndCacheEmoteData(cachePath) :
            await this._loadCachedEmoteData(cachePath);
    }

    private _loadCachedEmoteData(cachePath: string) {
        return new Promise(resolve => {
            logger.debug('Loading cached emote data from', cachePath);
            const start            = new Date().getTime();
            const jsonObjectParser = streamObject.make();
            jsonObjectParser.output.on('data', data => this.emotes[data.key] = data.value);
            jsonObjectParser.output.on('end', () => {
                const delay = new Date().getTime() - start;
                logger.info(`Loaded cached emotes after ${delay}ms`);
                resolve();
            });
            fs.createReadStream(cachePath).pipe(jsonObjectParser.input);
        });
    }

    private _loadAndCacheEmoteData(cachePath: string) {
        logger.debug('Fetching new emote data');
        const start = new Date().getTime();
        request({
            url:  config.twitch.api.emotes.data,
            json: true
        }, (err, res, body) => {
            const delay = new Date().getTime() - start;
            if (err) logger.error(`Failed loading remote emote data after ${delay}ms`, err);
            else {
                logger.info(`Received emote data after ${delay}ms`);
                this.emotes = body;

                logger.debug('Writing emote data to', cachePath);
                fs.writeFileSync(cachePath, JSON.stringify(this.emotes));

                this.toIRC$.next(new KeepoBotSayCommand('Armed and ready SMOrc'));
            }
        });
    }

    getEmoteName(emoteId: string) {
        const emote = this.emotes[emoteId];
        return emote ? emote.code : config.defaultEmote;
    }
}
