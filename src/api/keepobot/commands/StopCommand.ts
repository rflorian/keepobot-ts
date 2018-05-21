import {KeepoBotCommand} from './KeepoBotCommand';

export class StopCommand implements KeepoBotCommand {
    static readonly TYPE = 'STOP';
    public type: string;

    constructor() {
        this.type = StopCommand.TYPE;
    }
}
