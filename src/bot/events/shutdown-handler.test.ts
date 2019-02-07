import {KeepoBotSayCommand, KeepoBotStopCommand, TwitchUserState} from '../../api';
import {shutdownHandler} from './shutdown-handler';
import {config} from '../../config';
import {KeepoBot} from '../keepo-bot';

describe('shutdown handler', () => {
    const underTest = shutdownHandler;

    describe('trigger', () => {
        it('returns false if msg is not "!stop"', () => expect(underTest.trigger('___stop___', null, null)).toBeFalsy());
        it('returns false when the user is not the owner of the current channel', () =>
            expect(underTest.trigger('!stop', <TwitchUserState>{username: 'bla'}, null)).toBeFalsy());
        it('returns true when the owner of the current channel sends the command', () =>
            expect(underTest.trigger('!stop', <TwitchUserState>{username: config.twitch.stream.channel}, null)).toBe(true));
    });

    describe('handler', () => {
        it('emits a KeepoBotSayCommand', () =>
            expect(underTest.handler(<KeepoBot>{uptime: -1}, null, null, null)).toEqual([
                jasmine.any(KeepoBotSayCommand),
                jasmine.any(KeepoBotSayCommand),
                jasmine.any(KeepoBotStopCommand)
            ]))
    });
});
