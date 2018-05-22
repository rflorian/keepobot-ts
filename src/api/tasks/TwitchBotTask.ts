export interface TwitchBotTask<B, C> {
    id: string;
    callback: (bot: B) => C[];
    interval: number;
}
