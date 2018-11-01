import {Observable, Subject, Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {KeepoBotSayCommand, TwitchClient} from '../api';
import {logger} from '../logger';
import {config} from '../config';
import {rateLimit} from '../util';

export class KeepoBotIo {
    public static readonly ALLOWED_PER_INTERVAL = config.twitch.api.quota.msgPerInterval;
    public static readonly INTERVAL_LENGTH = 1000 * config.twitch.api.quota.intervalDuration;

    private readonly toIRCSub: Subscription;

    constructor(private twitch: TwitchClient,
        private toIRC$: Observable<KeepoBotSayCommand>,
        private fromIRC$: Subject<any>) {

        this.toIRCSub = rateLimit(this.toIRC$, KeepoBotIo.ALLOWED_PER_INTERVAL, KeepoBotIo.INTERVAL_LENGTH)
            .pipe(tap(cmd => logger.debug(`---> ${cmd.msg}`)))
            .subscribe(cmd => this.twitch.say(cmd.channel, cmd.msg));

        this.twitch.on('chat', (...data) => this.fromIRC$.next(data));
    }

    async start() {
        await this.twitch.connect();
        logger.info('KeepoBotIo connected');
    }

    async stop() {
        await Promise.all([
            this.twitch.disconnect(),
            this.toIRCSub.unsubscribe()
        ]);
        logger.info('KeepoBotIo disconnected');
    }
}
