import {KeepoBot}        from '../../bot';
import {TwitchBotTask}   from '../tasks';
import {KeepoBotCommand} from './commands';

export class KeepoBotTask implements TwitchBotTask<KeepoBot, KeepoBotCommand> {
    constructor(public id: string,
                public callback: (bot: KeepoBot) => KeepoBotCommand[],
                public interval: number) {}
}
