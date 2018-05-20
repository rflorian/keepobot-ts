import * as TwitchJS from 'twitch-js';
import {
    KeepoBotChatHandler,
    KeepoBotEventHandler,
    TwitchBot,
    TwitchClient,
    TwitchEventTrigger,
    TwitchJSOptions,
    TwitchUserState
} from './api';
import {logger} from './logger';
import {config} from './config';
import {appNameAndVersion} from './util';

type EventListener = {[eventId: string]: {trigger: TwitchEventTrigger, handler: KeepoBotEventHandler}};

export class KeepoBot implements TwitchBot {
    private twitch: TwitchClient;
    private chatListeners: EventListener = {};

    private startUpTimestamp;

    get uptime() {
        return new Date().getTime() - this.startUpTimestamp;
    }

    constructor(private twitchOptions: TwitchJSOptions) {
        this.twitch = new TwitchJS.Client(twitchOptions);

        this.twitch.on('connected', () => {
            logger.debug('Client connected');
            this.say(`${appNameAndVersion} ready for duty MrDestructoid`)
        });
        this.twitch.on('disconnected', reason => logger.debug(`Client disconnected: ${reason}`));
        this.twitch.on('chat', this.handleTwitchChatEvents.bind(this));
    }

    private handleTwitchChatEvents(channel: string,
                                   userState: TwitchUserState,
                                   message: string,
                                   self: boolean) {
        if (self) return;
        logger.debug(`Chat message received -> ${userState.username}: ${message}`);

        Object.entries(this.chatListeners)
            .filter(([id, listener]) => listener.trigger(message, userState, channel))
            .forEach(([id, listener]) => {
                logger.trace(`Calling "${id}" handler with ${message}, ${userState}`);
                listener.handler(this, message, userState, channel);
            });
    }

    start() {
        this.twitch.connect().then(() => this.startUpTimestamp = new Date().getTime());
        return this;
    }

    stop() {
        this.twitch.disconnect();
        return this;
    }

    addChatEvent(id: string, trigger: TwitchEventTrigger, handler: KeepoBotChatHandler) {
        this.chatListeners[id] = {trigger, handler};
        logger.trace(`Added ${id} chat event`);
        return this;
    }

    removeChatEvent(id: string) {
        delete this.chatListeners[id];
        logger.trace(`Removed ${id} chat event`);
        return this;
    }

    say(msg: string, channel: string = config.twitch.stream.channel) {
        this.twitch.say(channel, msg);
        return this;
    }
}
