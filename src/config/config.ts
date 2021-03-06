import {TwitchBotConfig} from '../api';
import {credentials}     from './credentials';

export const config: TwitchBotConfig = {
    twitch:       {
        bot:    {
            username: credentials.twitchBotAccount.username,
            password: credentials.twitchBotAccount.password
        },
        stream: {
            channel: credentials.twitchStreamAccounts[0].channel,
        },
        api:    {
            emotes: {
                data:            'https://twitchemotes.com/api/v4/emotes',
                bttv:            'https://api.betterttv.net/2/emotes',
                refreshInterval: 30 // seconds
            },
            quota:  {
                msgPerInterval:   20,
                intervalDuration: 30 // seconds
            }
        }
    },
    defaultEmote: 'Kappa'
};
