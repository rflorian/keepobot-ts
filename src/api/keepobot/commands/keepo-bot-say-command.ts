import {config}          from '../../../config';
import {KeepoBotCommand} from './keepo-bot-command';

export class KeepoBotSayCommand implements KeepoBotCommand {
    static readonly TYPE = 'SAY';
    public type: string;

    constructor(public msg: string,
                public channel: string = config.twitch.stream.channel) {
        this.type = KeepoBotSayCommand.TYPE;
    }
}
