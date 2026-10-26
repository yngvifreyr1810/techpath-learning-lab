import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const sandbox={};sandbox.window=sandbox;
vm.createContext(sandbox);
for(const file of ['content.js','challenges.js','foundations.js','python-content.js','api-content.js'])vm.runInContext(await readFile(new URL('./dist/'+file,import.meta.url),'utf8'),sandbox);
export const curriculum=sandbox.TECHPATH;
