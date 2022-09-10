import config, { saveConfig } from '../config';
import { hookCallbacks, modules, objects } from '../loader';
import type { BladeApi, BladeController, View } from '@tweakpane/core';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

let fpsGraph:
	| undefined
	| (BladeApi<BladeController<View>> & { begin: () => void; end: () => void });

hookCallbacks.push([
	() => {
		const { render } = modules.ui!.exports;
		modules.ui!.exports.render = function (...args) {
			fpsGraph?.begin();
			const result = render.call(this, ...args);
			// if we did any ticks/additional rendering
			// renderCheese();
			fpsGraph?.end();
			return result;
		};
	},
	[],
	['ui'],
]);

export async function createPane() {
	// import tweakpane at a later time because DOM isn't ready yet
	const { Pane } = await import(/* webpackMode: 'eager' */ 'tweakpane');

	const pane = new Pane({
		title: 'Cheese',
	});

	if (process.env.NODE_ENV === 'development') window.pane = pane;

	pane.on('change', saveConfig);

	pane.addInput(config, 'bhop');

	pane.registerPlugin(EssentialsPlugin);

	fpsGraph = <typeof fpsGraph>pane.addBlade({
		view: 'fpsgraph',
		label: 'FPS',
		lineCount: 2,
	});
}

if (process.env.NODE_ENV === 'development') {
	global.modules = modules;
	global.objects = objects;
}

export function fixPane(node: HTMLStyleElement) {
	node.textContent = node.textContent =
		`.tp-dfwv{z-index:2147483646;}.tp-dfwv,.tp-dfwv,.tp-dfwv *{color:revert;font-family:revert}` +
		node.textContent?.replace(
			/((?:color|font-family):.*?)([;}])/g,
			'$1!important$2'
		);
}
