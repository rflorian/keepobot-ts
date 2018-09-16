import { KeepoBotChatEvent, KeepoBotSayCommand, KeepoBotChatTriggers } from '../../api';

export const kappaHandler = new KeepoBotChatEvent(
    'kappaHandler',
    msg => msg === KeepoBotChatTriggers.KAPPA,
    () => [new KeepoBotSayCommand('MrDestructoid')]
);
