import { KeepoBotSayCommand, KeepoBotStopCommand, TwitchUserState } from '../../api';
import { emoteHandler } from './emote-handler';

describe('emote handler', () => {
    const underTest = emoteHandler;

    describe('trigger', () => {
        it('returns false if no emotes are contained', () => expect(underTest.trigger(null, <any>{}, null)).toBeFalsy());
        it('returns true if emotes are contained', () => expect(underTest.trigger(null, <any>{ emotes: {} }, null)).toBe(true));
    });

    describe('handler', () => {
        it('emits a KeepoBotSayCommand', () =>
            expect(underTest.handler(<any>{ getEmoteName: id => id }, null, <any>{ emotes: { '1': ['2'] } }, null))
                .toEqual([jasmine.any(KeepoBotSayCommand)]))
    });
});
