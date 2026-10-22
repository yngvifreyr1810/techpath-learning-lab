import {randomBytes} from 'node:crypto';
export const sessionToken=randomBytes(32).toString('hex');
