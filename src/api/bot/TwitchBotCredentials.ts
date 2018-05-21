export interface TwitchBotCredentials {
    twitchBotAccount: {
        username: string,
        password: string
    },
    twitchStreamAccounts: {
        channel: string,
        key: string
    }[],
    google?: {
        engineId: string,
        enginePassword: string
    },
    openWeather?: {
        apiKey: string
    }
}
