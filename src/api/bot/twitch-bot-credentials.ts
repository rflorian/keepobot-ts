export interface TwitchBotCredentials {
    twitchBotAccount: {
        username: string,
        password: string
    };
    twitchStreamAccounts: {
        channel: string,
        key: string
    }[];
}
