export interface TwitchJsOptions {
    channels: string[],
    identity?: {
        username: string,
        password: string
    },
    options?: {
        debug: boolean
    },
    connection?: {
        reconnect: boolean,
        secure: boolean
    }
}
