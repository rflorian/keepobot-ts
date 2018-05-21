import * as TwitchJS from 'twitch-js';
import {
    KeepoBotChatEvent,
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

type KeepoBotEventListeners<T> = {
    [id: string]: {
        trigger: TwitchBotEventTrigger,
        handler: T extends 'chat' ? TwitchBotChatEventHandler<KeepoBot> : TwitchBotEventHandler<KeepoBot>
    }
};

export class KeepoBot implements TwitchBot<KeepoBot> {
    private twitch: TwitchClient;
    private chatEventListeners: KeepoBotEventListeners<'chat'> = {};
    private eventListeners: KeepoBotEventListeners<Exclude<string, 'chat'>> = {};

    private startUpTimestamp;

    get uptime() {
        return new Date().getTime() - this.startUpTimestamp;
    }

    constructor(private twitchOptions: TwitchJSOptions) {
        this.twitch = new TwitchJS.Client(twitchOptions);

        this.twitch.on('disconnected', reason => logger.debug(`Client disconnected: ${reason}`));
        this.twitch.on('chat', this.handleTwitchChatEvents.bind(this));
    }

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
                listener.handler(this, message, userState, channel);
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
        this.twitch.disconnect();
        logger.trace('Client disconnecting');
        return this;
    }

    addEvent<T extends string>(event: TwitchBotEvent<this, T>) {
        if (event instanceof KeepoBotChatEvent) {
            this.chatEventListeners[event.id] = {trigger: event.trigger, handler: event.handler};
        }
        else this.eventListeners[event.id] = {trigger: event.trigger, handler: event.handler};
        logger.trace(`Added ${event.id} chat event`);
        return this;
    }

    removeEvent<T extends string>(event: TwitchBotEvent<this, T>) {
        if (event instanceof KeepoBotChatEvent) delete this.chatEventListeners[event.id];
        else delete this.eventListeners[event.id];
        logger.trace(`Removed ${event.id} chat event`);
        return this;
    }

    // TODO: move to I/O unit which receives the twitch client
    say(msg: string, channel: string = config.twitch.stream.channel) {
        this.twitch.say(channel, msg);
        logger.debug(`---> ${msg}`);
        return this;
    }
}
