import * as pino from 'pino';
import {LoggerOptions} from 'pino';

export const logger = pino(<LoggerOptions> {level: 'debug', name: 'keepobot'});
