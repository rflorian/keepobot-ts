export interface TwitchBotConfig {
    twitch: {
        bot: {
            username: string,
            password: string
        }
        stream: {
            channel: string
        },
        api: {
            emotes: {
                data: string,
                bttv: string,
                refreshInterval: number // seconds
            },
            quota: {
                msgPerInterval: number,
                intervalDuration: number // seconds
            }
        }
    };
    defaultEmote: string;
}
