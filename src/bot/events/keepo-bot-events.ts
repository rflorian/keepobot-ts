import {emoteHandler}    from './emote-handler';
import {kappaHandler}    from './kappa-handler';
import {shutdownHandler} from './shutdown-handler';
import { commandsHandler } from './commands-handler';

export const keepoBotEvents = [
    commandsHandler,
    emoteHandler,
    kappaHandler,
    shutdownHandler
];
