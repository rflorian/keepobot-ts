# keepobot-ts
Typescript twitch chat bot

## Capabilities
* Establish an IRC connection to the twitch chat servers via [twitch-js](https://github.com/twitch-apis/twitch-js)
* Specify customizable event handlers to add behavior to the bot

## How to run
Add a credentials.ts file inside src/config/ that conforms to the [TwitchBotCredentials](src/api/bot/twitch-bot-credentials.ts) interface.
```
npm i
npm start
```

## License
MIT
