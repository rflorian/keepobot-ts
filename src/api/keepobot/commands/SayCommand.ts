import {config} from '../../../config';
import {KeepoBotCommand} from './KeepoBotCommand';

export class SayCommand implements KeepoBotCommand {
    static readonly TYPE = 'SAY';
    public type: string;

    constructor(public msg: string,
                public channel: string = config.twitch.stream.channel) {
        this.type = SayCommand.TYPE;
    }
}
