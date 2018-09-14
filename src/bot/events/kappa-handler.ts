import {KeepoBotChatEvent, KeepoBotSayCommand} from '../../api';

export const kappaHandler = new KeepoBotChatEvent(
    'kappaHandler',
    msg => msg === 'Kappa',
    () => [new KeepoBotSayCommand('MrDestructoid')]
);
