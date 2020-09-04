export interface TwitchUserState {
    ['user-id']: string;
    username: string;
    ['display-name']: string;
    ['user-type']: string;
    ['room-id']: string;
    color: string;
    badges: Record<string, string>;
    ['badges-raw']: string;
    emotes: Record<string, string[]>;
    ['emotes-raw']: string;
    mod: boolean;
    subscriber: boolean;
    turbo: boolean;
    ['message-type']: string
}
