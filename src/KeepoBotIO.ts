import {SayCommand, TwitchClient} from './api';
import {Observable, Subject, Subscription} from 'rxjs';
import {logger} from './logger';

export class KeepoBotIO {

    private readonly toIRCSub: Subscription;

    constructor(private twitch: TwitchClient,
                private toIRC$: Observable<SayCommand>,
                private fromIRC$: Subject<any>) {

        // TODO: add rate limiting (X req per Y seconds) to this observable
        this.toIRCSub = this.toIRC$.subscribe(cmd => {
            this.twitch.say(cmd.channel, cmd.msg);
            logger.debug(`---> ${cmd.msg}`);
        });
        this.twitch.on('chat', (...data) => this.fromIRC$.next(data));
    }

    start() {
        this.twitch.connect().then(() => logger.debug('Twitch client connected'));
    }

    stop() {
        this.twitch.disconnect();
        this.toIRCSub.unsubscribe();
    }
}
