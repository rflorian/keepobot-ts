import {KeepoBotChatTriggers} from '../../api';
import {maffsHandler} from './maffs-handler';

describe('maffs handler', () => {
    const underTest = maffsHandler;

    describe('trigger', () => {
        it('returns false because initial part of message does not match', () => expect(underTest.trigger('weird', null, null)).toBeFalsy());
        it('returns false because no numeric argument is provided', () =>
            expect(underTest.trigger(`${KeepoBotChatTriggers.MAFFS} weird`, null, null)).toBeFalsy());
        it('returns false because no arguments are invalid', () =>
            expect(underTest.trigger(`${KeepoBotChatTriggers.MAFFS} 7 12`, null, null)).toBeFalsy());
        it('returns true because regex is matched', () =>
            expect(underTest.trigger(`${KeepoBotChatTriggers.MAFFS} 777`, null, null)).toBeTruthy());
    });

    describe('handler', () => {
        it('contains 2 7s when given 7', () => {
            const res = underTest.handler(undefined, `${KeepoBotChatTriggers.MAFFS} 7`, undefined, undefined);
            expect(res.length).toBe(1);
            const msg: string = res[0]['msg'];
            expect(msg.split('').filter(v => v === '7').length).toBe(2);
        });

        it('contains 21 7s when given 9', () => {
            const res = underTest.handler(undefined, `${KeepoBotChatTriggers.MAFFS} 9`, undefined, undefined);
            expect(res.length).toBe(1);
            const msg: string = res[0]['msg'];
            expect(msg.split('').filter(v => v === '7').length).toBe(21);
        });

        it('contains 11 7s when given 14', () => {
            const res = underTest.handler(undefined, `${KeepoBotChatTriggers.MAFFS} 14`, undefined, undefined);
            expect(res.length).toBe(1);
            const msg: string = res[0]['msg'];
            expect(msg.split('').filter(v => v === '7').length).toBe(11);
        });
    });
});
