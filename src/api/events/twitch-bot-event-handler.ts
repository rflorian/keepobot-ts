export type TwitchBotEventHandler<B, C> = (bot: B, ...args: any[]) => C[];