import {KeepoBotSayCommand, TwitchClient}  from '../api/index';
import {Observable, Subject, Subscription} from 'rxjs';
import {logger}                            from '../logger';
import {config}                            from '../config/index';
import {rateLimit}                         from '../util/index';
import {tap}                               from 'rxjs/operators';

export class KeepoBotIo {
    private static readonly allowedPerInterval = config.twitch.api.quota.msgPerInterval;
    private static readonly intervalLength     = 1000 * config.twitch.api.quota.intervalDuration;

    private readonly toIRCSub: Subscription;

    constructor(private twitch: TwitchClient,
                private toIRC$: Observable<KeepoBotSayCommand>,
                private fromIRC$: Subject<any>) {

        this.toIRCSub = rateLimit(this.toIRC$, KeepoBotIo.allowedPerInterval, KeepoBotIo.intervalLength)
            .pipe(tap(cmd => logger.debug(`---> ${cmd.msg}`)))
            .subscribe(cmd => this.twitch.say(cmd.channel, cmd.msg));

        this.twitch.on('chat', (...data) => this.fromIRC$.next(data));
    }

    async start() {
        await this.twitch.connect();
        logger.info('Twitch client connected');
    }

    stop() {
        this.twitch.disconnect();
        this.toIRCSub.unsubscribe();
    }
}
