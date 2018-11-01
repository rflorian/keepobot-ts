import {Subject} from 'rxjs';
import {KeepoBotSayCommand, TwitchClient} from '../api';
import {KeepoBotIo} from './keepo-bot-io';
import {logger} from '../logger';

describe('keepo-bot-io', () => {
    let underTest: KeepoBotIo;
    let toIrc$: Subject<KeepoBotSayCommand>;
    let fromIrc$: Subject<any>;
    let mockTwitchClient: TwitchClient;

    beforeEach(() => {
        logger.level = 'error';
        toIrc$ = new Subject<KeepoBotSayCommand>();
        fromIrc$ = new Subject<any>();
        mockTwitchClient = <TwitchClient>{
            connect: jest.fn(),
            disconnect: jest.fn(),
            say: jest.fn(),
            on: jest.fn()
        };
        underTest = new KeepoBotIo(mockTwitchClient, toIrc$, fromIrc$);
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
            underTest = new KeepoBotIo(mockTwitchClient, toIrc$, fromIrc$);

            const payload = 'test';
            fromIrc$.subscribe(v => {
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
            toIrc$.next(testCmd);
        });

        it('are rate limited', done => {
            const sendEvents = amount => {
                for (const _ of Array.from({length: amount})) toIrc$.next(new KeepoBotSayCommand('test'));
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