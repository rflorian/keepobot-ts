import {KeepoBotChatEvent, KeepoBotSayCommand} from '../../api';
import {commandMatcher}                        from '../../util';

export const weatherHandler = new KeepoBotChatEvent(
    'weatherHandler',
    commandMatcher({cmd: '!weather', arity: 1}),
    () => {
        return [new KeepoBotSayCommand('!weather was called')]
    }
);
