import {KeepoBotSayCommand, TwitchClient} from '../api';
import {logger} from '../logger';
import {KeepoBotIo} from './keepo-bot-io';

describe('keepo-bot-io', () => {
    let underTest: KeepoBotIo;
    let mockTwitchClient: TwitchClient;

    beforeEach(() => {
        logger.level = 'error';
        mockTwitchClient = <TwitchClient>{
            connect: jest.fn(),
            disconnect: jest.fn(),
            say: jest.fn(),
            on: jest.fn()
        };
        underTest = new KeepoBotIo(mockTwitchClient);
    });

    it('can be instantiated', () => expect(underTest).toBeDefined());

    describe('start', () => {
        it('connects to twitch irc', async () => {
            expect(mockTwitchClient.connect).not.toHaveBeenCalled();
            await underTest.start();
            expect(mockTwitchClient.connect).toHaveBeenCalled();
        });
    });

    describe('stop', () => {
        it('disconnects from twitch irc', async () => {
            expect(mockTwitchClient.disconnect).not.toHaveBeenCalled();
            await underTest.stop();
            expect(mockTwitchClient.disconnect).toHaveBeenCalled();
        });
    });

    describe('twitch->bot comms', () => {
        it('passes chat events through', done => {
            let eventCb;
            mockTwitchClient.on = jest.fn().mockImplementation((eventName, cb) => eventCb = cb);
            underTest = new KeepoBotIo(mockTwitchClient);

            const payload = 'test';
            underTest.listen().subscribe(v => {
                expect(v[0]).toBe(payload);
                done();
            });
            eventCb(payload);
        });
    });

    describe('bot->twitch comms', () => {
        it('evaluates KeepoBotSayCommands', done => {
            const testCmd = new KeepoBotSayCommand('testMsg', 'testChannel');
            mockTwitchClient.say = jest.fn().mockImplementation((channel, msg) => {
                expect(channel).toEqual(testCmd.channel);
                expect(msg).toEqual(testCmd.msg);
                done();
            });
            underTest = new KeepoBotIo(mockTwitchClient);
            underTest.send(testCmd);
        });

        it('are rate limited', done => {
            underTest = new KeepoBotIo(mockTwitchClient);
            const sendEvents = amount => {
                for (const _ of Array.from({length: amount})) underTest.send(new KeepoBotSayCommand('test'));
            }

            const limit = KeepoBotIo.ALLOWED_PER_INTERVAL;
            sendEvents(limit)
            setImmediate(() => expect(mockTwitchClient.say).toHaveBeenCalledTimes(limit));

            sendEvents(1);
            setImmediate(() => {
                expect(mockTwitchClient.say).toHaveBeenCalledTimes(limit);
                done();
            });
        });
    });
});