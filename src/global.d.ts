/* eslint-disable no-var */
import type { GameModules, GameObjects } from './loader';

declare global {
	var modules: undefined | Partial<GameModules>;
	var objects: undefined | Partial<GameObjects>;
}
