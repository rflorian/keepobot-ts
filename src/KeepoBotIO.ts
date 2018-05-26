import {SayCommand, TwitchClient} from './api';
import {Observable, Subject, Subscription} from 'rxjs';
import {logger} from './logger';
import {config} from './config';
import {rateLimit} from './util';

export class KeepoBotIO {

    private readonly toIRCSub: Subscription;

    constructor(private twitch: TwitchClient,
                private toIRC$: Observable<SayCommand>,
                private fromIRC$: Subject<any>) {

        const count = config.twitch.api.quota.msgPerInterval;
        const period = 1000 * config.twitch.api.quota.intervalDuration;

        this.toIRCSub = rateLimit(this.toIRC$, count, period).subscribe(cmd => {
            this.twitch.say(cmd.channel, cmd.msg);
            logger.debug(`---> ${cmd.msg}`);
        });

        this.twitch.on('chat', (...data) => this.fromIRC$.next(data));
    }

    async start() {
        this.twitch.connect().then(() => logger.info('Twitch client connected'));
    }

    stop() {
        this.twitch.disconnect();
        this.toIRCSub.unsubscribe();
    }
}
