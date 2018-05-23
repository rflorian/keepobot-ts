import {SayCommand, TwitchClient} from './api';
import {asyncScheduler, Observable, of, Subject, Subscription} from 'rxjs';
import {concatMap, delay, map, mergeAll, mergeMap, switchMapTo, windowTime} from 'rxjs/operators';
import {logger} from './logger';
import {config} from './config';
import {KeepoBotRateLimiter} from './KeepoBotRateLimiter';

export class KeepoBotIO {

    private readonly toIRCSub: Subscription;

    constructor(private twitch: TwitchClient,
                private toIRC$: Observable<SayCommand>,
                private fromIRC$: Subject<any>) {

        const rateLimiter = new KeepoBotRateLimiter(
            config.twitch.api.quota.msgPerInterval,
            config.twitch.api.quota.intervalDuration
        );
        this.toIRCSub = rateLimiter.thin(this.toIRC$).subscribe()

        this.toIRCSub = this.toIRC$.pipe().subscribe((cmd: SayCommand) => {
            this.twitch.say(cmd.channel, cmd.msg);
            logger.debug(`---> ${cmd.msg}`);
        });
        this.twitch.on('chat', (...data) => this.fromIRC$.next(data));
    }

    async start() {
        this.twitch.connect().then(() => logger.debug('Twitch client connected'));
    }

    stop() {
        this.twitch.disconnect();
        this.toIRCSub.unsubscribe();
    }
}
