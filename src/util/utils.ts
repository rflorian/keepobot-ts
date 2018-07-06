import {concatMap, delay, scan} from 'rxjs/operators';
import {of, Observable}         from 'rxjs';

export const appNameAndVersion = `${process.env.npm_package_name}@${process.env.npm_package_version}`;

// see https://stackoverflow.com/a/42286407
export const rateLimit = <T>(source: Observable<T>, count: number, period: number): Observable<T> =>
    source.pipe(
        rateAnalyzingScan(count, period),
        nonLossyThrottleConcat
    );

const nonLossyThrottleConcat = concatMap((records: any[]) => {
    const lastRecord = records[records.length - 1];
    const res        = of(lastRecord.value);
    return lastRecord.delay ? res.pipe(delay(lastRecord.delay)) : res;
});

const rateAnalyzingScan = (count: number, period: number) =>
    scan((records, value) => {
        const now   = Date.now();
        const since = now - period;
        records     = records.filter((record) => record.until > since);

        // TODO: support items which consume more than 1 token
        if (records.length >= count) {
            const firstRecord = records[0];
            const lastRecord  = records[records.length - 1];
            const until       = firstRecord.until + (period * Math.floor(records.length / count));

            records.push({
                delay: (lastRecord.until < now) ?
                           (until - now) :
                           (until - lastRecord.until),
                until,
                value
            });
        } else records.push({
            delay: 0,
            until: now,
            value
        });

        return records;
    }, []);
