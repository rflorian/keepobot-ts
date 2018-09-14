import { kappaHandler } from './kappa-handler';
import { KeepoBotSayCommand } from '../../api';

describe('kappa handler', () => {
    const underTest = kappaHandler;

    it('is defined', () => expect(underTest).toBeDefined());

    describe('trigger', () => {
        it('returns true when msg is "Kappa"', () => expect(underTest.trigger('Kappa', null, null)).toBe(true));
        it('returns false otherwise', () => expect(underTest.trigger('Not Kappa', null, null)).toBeFalsy());
    });

    describe('handler', () => {
        it('emits a KeepoBotSayCommand', () =>
            expect(underTest.handler(null, null, null, null)).toContainEqual(jasmine.any(KeepoBotSayCommand)))
    });
});
