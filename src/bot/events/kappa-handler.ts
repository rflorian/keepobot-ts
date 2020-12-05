import { KeepoBotChatEvent, KeepoBotSayCommand, KeepoBotChatEvents } from '../../api';

export const kappaHandler = new KeepoBotChatEvent(
    'kappaHandler',
    msg => msg === KeepoBotChatEvents.Kappa,
    () => [new KeepoBotSayCommand('MrDestructoid')]
);
