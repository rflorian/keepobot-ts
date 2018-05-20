import {logger} from './logger';
import {getClient} from './client';
import {config} from './config';

logger.debug('Starting application');
const client = getClient();

client.on('chat', (channel, userState, message, self) => {
    logger.debug(`Chat message received -> ${userState['display-name']}: ${message}`);
    if (message === 'Kappa') {
        client.say(config.twitch.stream.channel, 'MrDestructoid');
    }
    if (message === '!stop' && userState['display-name'] === config.twitch.stream.channel) {
        client.disconnect();
    }
});
