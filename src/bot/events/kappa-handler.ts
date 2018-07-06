import {KeepoBotChatEvent, KeepoBotSayCommand} from '../../api';

export const kappaHandler = new KeepoBotChatEvent(
    'kappaHandler',
    message => message === 'Kappa',
    () => [new KeepoBotSayCommand('MrDestructoid')]
);
