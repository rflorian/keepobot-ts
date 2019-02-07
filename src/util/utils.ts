import {of, Observable} from 'rxjs';
import {concatMap, delay, scan} from 'rxjs/operators';

export const appNameAndVersion = `${process.env.npm_package_name}@${process.env.npm_package_version}`;

interface RateLimitToken<T> {
    delay: number;
    until: number;
    value: T;
}

// see https://stackoverflow.com/a/42286407
export const rateLimit = <T>(source: Observable<T>, count: number, period: number): Observable<T> =>
    source.pipe(
        rateAnalyzingScan<T>(count, period),
        nonLossyThrottleConcat<T>()
    );

const nonLossyThrottleConcat = <T>() => concatMap((tokens: RateLimitToken<T>[]) => {
    const lastToken = tokens[tokens.length - 1];
    const res = of(lastToken.value);
    return lastToken.delay ? res.pipe(delay(lastToken.delay)) : res;
});

const rateAnalyzingScan = <T>(count: number, period: number) =>
    scan((records: RateLimitToken<T>[], value: T) => {
        const now = Date.now();
        const since = now - period;
        const _records = records.filter(record => record.until > since);

        // TODO: support items which consume more than 1 token
        if (_records.length >= count) {
            const firstRecord = _records[0];
            const lastRecord = _records[_records.length - 1];
            const until = firstRecord.until + (period * Math.floor(_records.length / count));
            const delay = lastRecord.until < now ?
                until - now :
                until - lastRecord.until;

            _records.push({
                delay,
                until,
                value
            });
        } else {
            _records.push({
                delay: 0,
                until: now,
                value
            });
        }

        return _records;
    }, []);
