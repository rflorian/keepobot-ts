import {KeepoBotConfig} from '../api';
import {credentials} from './credentials';

export const config: KeepoBotConfig = {
    twitch: {
        bot: {
            username: credentials.twitchBotAccount.username,
            password: credentials.twitchBotAccount.password
        },
        stream: {
            channel: credentials.twitchStreamAccounts[0].channel
        },
        api: {
            emotes: {
                basic: 'https://twitchemotes.com/api_cache/v2/global.json',
                bttv: 'https://api.betterttv.net/2/emotes',
                refreshInterval: 30 // seconds
            },
            quota: {
                msgPerInterval: 20,
                intervalDuration: 30 // seconds
            }
        }
    },
    openWeather: {
        presentApi: 'http://api.openweathermap.org/data/2.5/weather?q:{query}&units:metric&appid:{appid}',
        forecastApi: 'http://api.openweathermap.org/data/2.5/forecast?q:{query}&units:metric&appid:{appid}',
    }
};