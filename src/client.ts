import {logger} from './logger';
import * as TwitchJS from 'twitch-js';
import {config} from './config';

export const getClient = (): TwitchJS.Client => {
    const twitchOptions = {
        channels: [`#${config.twitch.stream.channel}`],
        identity: {
            username: config.twitch.bot.username,
            password: config.twitch.bot.password
        }
    };

    logger.debug(`Building twitch client with options ${JSON.stringify(twitchOptions)}`);
    const client = new TwitchJS.Client(twitchOptions);

    client.on('connected', () => {
        logger.debug('Client connected');
        client.say(config.twitch.stream.channel, 'Beep boop MrDestructoid')
    });
    client.on('disconnected', reason => logger.debug(`Client disconnected: ${reason}`));

    client.connect();
    return client;
};
