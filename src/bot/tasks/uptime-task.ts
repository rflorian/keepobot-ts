import {KeepoBotTask, KeepoBotSayCommand} from '../../api';

export const uptimeTask = new KeepoBotTask(
    'periodicUptime',
    bot => [new KeepoBotSayCommand(`online for ${Math.round(bot.uptime / (60 * 1000))}min monkaS`)],
    5 * 60 * 1000
);
