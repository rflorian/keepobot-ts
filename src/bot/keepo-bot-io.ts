import {Subject, Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {KeepoBotSayCommand, TwitchClient, TwitchUserState} from '../api';
import {config} from '../config';
import {logger} from '../logger';
import {rateLimit} from '../util';

export class KeepoBotIo {
    public static readonly ALLOWED_PER_INTERVAL = config.twitch.api.quota.msgPerInterval;
    public static readonly INTERVAL_LENGTH = 1000 * config.twitch.api.quota.intervalDuration;

    private toTwitch$ = new Subject<KeepoBotSayCommand>();
    private fromTwitch$ = new Subject<[[string, TwitchUserState, string, boolean]]>();
    private readonly toTwitchSub: Subscription;

    constructor(
        private twitchClient: TwitchClient,
    ) {
        this.twitchClient.on('disconnected', reason => logger.debug(`Twitch client disconnected: ${reason}`));

        this.toTwitchSub = rateLimit(this.toTwitch$, KeepoBotIo.ALLOWED_PER_INTERVAL, KeepoBotIo.INTERVAL_LENGTH)
            .pipe(tap(cmd => logger.debug(`---> ${cmd.msg}`)))
            .subscribe(cmd => this.twitchClient.say(cmd.channel, cmd.msg));

        this.twitchClient.on('chat', (...data) => this.fromTwitch$.next(data));
    }

    async start() {
        logger.debug('KeepoBotIo connecting...');
        await this.twitchClient.connect();
        logger.info('KeepoBotIo connected');
    }

    async stop() {
        logger.debug('KeepoBotIo disconnecting...');
        await Promise.all([
            this.twitchClient.disconnect(),
            this.toTwitchSub.unsubscribe()
        ]);
        logger.info('KeepoBotIo disconnected');
    }

    send(cmd: KeepoBotSayCommand) {
        this.toTwitch$.next(cmd);
    }

    listen() {
        return this.fromTwitch$;
    }
}
