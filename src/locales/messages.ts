// Presentation text only; game identifiers and saved progress stay unchanged.
import {core} from './core.ts';
import {details} from './details.ts';
import {narrative} from './narrative.ts';
import {gameplay} from './gameplay.ts';
import {science} from './science.ts';
import {operations} from './operations.ts';
import {archive} from './archive.ts';
export const messages:Array<[string,string,string]>=[...core,...details,...narrative,...gameplay,...science,...operations,...archive];
