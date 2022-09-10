/* eslint-disable no-var */
import type { GameModules, GameObjects } from './loader';
import type { Pane } from 'tweakpane';

declare global {
	var modules: undefined | Partial<GameModules>;
	var objects: undefined | Partial<GameObjects>;
	var pane: undefined | Pane;
}
