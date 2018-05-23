import {mergeAll, windowTime} from 'rxjs/operators';
import {asyncScheduler, Observable, NEVER} from 'rxjs';

export class KeepoBotRateLimiter {

    constructor(private maximum, private duration, private scheduler = asyncScheduler) {
    }

    public thin<T>(stream: Observable<T>): Observable<T> {
        let active = 0;
        let end = 0;

        return stream.pipe(windowTime(
            1000 * this.duration,
            1000 * this.duration,
            this.maximum
        ), mergeAll());
    }
}