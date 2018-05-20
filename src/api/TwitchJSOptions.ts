export interface TwitchJSOptions {
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
