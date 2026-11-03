import raw from '../data/github.json';
import { githubData } from './github';

export const github = githubData.parse(raw);
