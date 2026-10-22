import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const sandbox={};sandbox.window=sandbox;
vm.createContext(sandbox);
vm.runInContext(await readFile(new URL('./dist/content.js',import.meta.url),'utf8'),sandbox);
export const curriculum=sandbox.TECHPATH;
