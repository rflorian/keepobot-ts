import {kappaHandler} from './kappa-handler';
import {shutdownHandler} from './shutdown-handler';
import {commandsHandler} from './commands-handler';
import {maffsHandler} from './maffs-handler';

export const keepoBotEvents = [
    commandsHandler,
    kappaHandler,
    shutdownHandler,
    maffsHandler
];
