import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root=process.cwd();
const built=join(root,'dist','wizard.js');
if(!existsSync(built)) process.exit(0);
const outputTime=statSync(built).mtimeMs;
const sources=[join(root,'tsconfig.json'),join(root,'package.json')];
for(const name of readdirSync(join(root,'src'))) if(name.endsWith('.ts')) sources.push(join(root,'src',name));
process.exit(sources.some(path=>statSync(path).mtimeMs>outputTime)?0:1);
