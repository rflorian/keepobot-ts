import {TwitchBotTask}   from '../tasks';
import {KeepoBot}        from '../../bot/keepo-bot';
import {KeepoBotCommand} from './commands';

export class KeepoBotTask implements TwitchBotTask<KeepoBot, KeepoBotCommand> {
    constructor(public id: string,
                public callback: (bot: KeepoBot) => KeepoBotCommand[],
                public interval: number) {}
}
