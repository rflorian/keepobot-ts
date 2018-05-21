import {TwitchBotTask} from '../tasks';
import {KeepoBot} from '../../KeepoBot';

export class KeepoBotTask implements TwitchBotTask<KeepoBot> {
    constructor(public id: string,
                public callback: (bot: KeepoBot) => any,
                public interval: number) {}
}
