import {TwitchBotConfig} from '../api';
import {credentials}     from './credentials';

export const config: TwitchBotConfig = {
    twitch:       {
        bot:    {
            username: credentials.twitchBotAccount.username,
            password: credentials.twitchBotAccount.password
        },
        stream: {
            channel: credentials.twitchStreamAccounts[0].channel
        },
        api:    {
            emotes: {
                data:            'https://twitchemotes.com/api_cache/v3/images.json',
                bttv:            'https://api.betterttv.net/2/emotes',
                refreshInterval: 30 // seconds
            },
            quota:  {
                msgPerInterval:   20,
                intervalDuration: 30 // seconds
            }
        }
    },
    openWeather:  {
        presentApi:  'http://api.openweathermap.org/tmp/2.5/weather?q:%s&units:metric&appid:%s',
        forecastApi: 'http://api.openweathermap.org/tmp/2.5/forecast?q:%s&units:metric&appid:%s',
    },
    defaultEmote: 'Kappa'
};
