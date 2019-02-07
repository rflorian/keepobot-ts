import {KeepoBotChatEvent, KeepoBotChatTriggers, KeepoBotSayCommand} from '../../api';

const maffsRegex = new RegExp(`^${KeepoBotChatTriggers.MAFFS} ([0-9]+)$`);

const valueOfSevens = (length: number): number => Number.parseInt('7'.repeat(length));

const getSevensSeed = (value: string): number => {
    const potentialSeed = valueOfSevens(value.length);
    if (potentialSeed >= +value) return potentialSeed;
    return valueOfSevens(value.length + 1);
}

const getSevensRepresentation = (value: string): string => {
    const seed = getSevensSeed(value);
    const parts: (string | number)[] = [seed];

    let remaining = seed - (+value);
    while (remaining > 10) {
        const remainingDigits = String(Math.abs(remaining)).length;
        const next = valueOfSevens(remainingDigits - 1);
        remaining -= next;
        parts.push(next);
    }
    if (remaining >= 7) {
        remaining -= 7;
        parts.push(7);
    }
    if (remaining > 0) parts.push(...Array.from({length: remaining}).map(() => '7/7'));

    return parts.join(' - ');
}

export const maffsHandler = new KeepoBotChatEvent(
    'maffsHandler',
    msg => !!msg.match(maffsRegex),
    (_, msg) => {
        const value = msg.match(maffsRegex)[1];
        return [new KeepoBotSayCommand(`Pepega Clap ${value} = ${getSevensRepresentation(value)} Pepega`)];
    }
);
