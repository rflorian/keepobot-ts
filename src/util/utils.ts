import {concatMap, delay, scan} from 'rxjs/operators';
import {of} from 'rxjs';

export const appNameAndVersion = `${process.env.npm_package_name} (${process.env.npm_package_version})`;

// see https://stackoverflow.com/a/42286407
export const rateLimit = (source, count, period) => {
    return source
        .pipe(
            scan((records, value) => {
                const now = Date.now();
                const since = now - period;
                records = records.filter((record) => record.until > since);

                if (records.length >= count) {
                    const firstRecord = records[0];
                    const lastRecord = records[records.length - 1];
                    const until = firstRecord.until + (period * Math.floor(records.length / count));

                    records.push({
                        delay: (lastRecord.until < now) ?
                            (until - now) :
                            (until - lastRecord.until),
                        until,
                        value
                    });
                } else {
                    records.push({
                        delay: 0,
                        until: now,
                        value
                    });
                }
                return records;
            }, [])
            , concatMap((records: any[]) => {
                const lastRecord = records[records.length - 1];
                const res = of(lastRecord.value);
                return lastRecord.delay ? res.pipe(delay(lastRecord.delay)) : res;
            })
        );
};
