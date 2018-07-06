import {KeepoBotCommand} from './keepo-bot-command';

export class KeepoBotStopCommand implements KeepoBotCommand {
    static readonly TYPE = 'STOP';
    public type: string;

    constructor() {
        this.type = KeepoBotStopCommand.TYPE;
    }
}
