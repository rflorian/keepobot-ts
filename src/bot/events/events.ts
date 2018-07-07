import {emoteHandler}    from './emote-handler';
import {kappaHandler}    from './kappa-handler';
import {shutdownHandler} from './shutdown-handler';
import {weatherHandler}  from './weather-handler';

export const KeepoBotEvents = [
    emoteHandler,
    kappaHandler,
    shutdownHandler,
    weatherHandler
];
