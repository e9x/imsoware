import config, { saveConfig } from './config';
import keys from './keys';
import type { Player } from './krunker';
import { hookCallbacks, modules, modulesUpdated, objects } from './loader';
import type { BladeApi, BladeController, View } from '@tweakpane/core';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

const mutationObserver = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const node of mutation.addedNodes) {
			if (node instanceof HTMLBodyElement) {
				createPane();
				// mutationObserver.disconnect();
			}
			if (
				node instanceof HTMLStyleElement &&
				node.dataset.tpStyle === 'default'
			) {
				node.textContent = node.textContent =
					`.tp-dfwv{z-index:2147483646;}.tp-dfwv,.tp-dfwv,.tp-dfwv *{color:revert;font-family:revert}` +
					node.textContent?.replace(
						/((?:color|font-family):.*?)([;}])/g,
						'$1!important$2'
					);
				mutationObserver.disconnect();
			}
		}
	}
});

mutationObserver.observe(document, { subtree: true, childList: true });

let fpsGraph:
	| undefined
	| (BladeApi<BladeController<View>> & { begin: () => void; end: () => void });

function renderCheese() {
	/*for (const player of modules.game.players.list) {
		console.log(player);
	}*/
}

hookCallbacks.push([
	() => {
		const { render } = modules.ui!.exports;
		modules.ui!.exports.render = function (...args) {
			fpsGraph?.begin();
			const result = render.call(this, ...args);
			renderCheese();
			fpsGraph?.end();
			return result;
		};
	},
	[],
	['ui'],
]);

const inputIndex = {
	frame: 0,
	delta: 1, // capped at 0.1-33
	xDir: 2,
	yDir: 3,
	moveDir: 4,
	shoot: 5,
	scope: 6,
	jump: 7,
	reload: 8,
	crouch: 9,
	weaponScroll: 10,
	weaponSwap: 11,
	speedLimit: 12,
	reset: 13,
	tweenTime: 14,
	tweenProgress: 15,
};

let originalPos: { x: number; y: number; z: number } | undefined;

hookCallbacks.push([
	() => {
		const { push } = objects.world!.tmpInpts;

		let lastJump = 0;

		objects.world!.tmpInpts.push = function (inputs) {
			const result = push.call(this, inputs);

			// freeze on server clock
			// inputs[inputIndex.speedLimit] = [];

			if (config.bhop && inputs[inputIndex.jump]) {
				inputs[inputIndex.jump] = lastJump;
				lastJump ^= 1;
				inputs[inputIndex.crouch] =
					(objects.localPlayer?.velocity.y || 0) < 0
						? 1
						: inputs[inputIndex.crouch];
			}

			// @ts-ignore
			if (window.doHook) {
				try {
					// @ts-ignore
					window.doHook(keys, inputs, inputIndex, push, this);
				} catch (error) {
					console.error(error);
					// @ts-ignore
					window.doHook = undefined;
				}
			} else {
				// Attempt some funny work
				// Most of this has been patched
				// I sent an older snippet of fiddling with speedLimit to HighNoon..

				if (keys.has('KeyE')) {
					// @ts-ignore

					if (!originalPos) {
						originalPos = {
							x: objects.localPlayer!.x,
							y: objects.localPlayer!.y,
							z: objects.localPlayer!.z,
						};
					}

					// freeze player
					objects.localPlayer!.x = originalPos.x;
					objects.localPlayer!.y = originalPos.y;
					objects.localPlayer!.z = originalPos.z;
				} else {
					originalPos = undefined;
				}
			}

			return result;
		};
	},
	['world'],
]);

hookCallbacks.push([
	() => {
		const canvas = objects.canvas!;
		canvas;
		console.log(canvas);
	},
	['canvas'],
]);

hookCallbacks.push([
	() => {
		const { add } = objects.game!.players;

		objects.game!.players.add = function (...args) {
			const player = add.call(this, ...args);

			if (player.isYTMP) {
				objects.localPlayer = player;
				modulesUpdated();
			}

			return player;
		};
	},
	['game'],
]);

hookCallbacks.push([
	() => {
		const { Player } = modules.players!.exports;

		console.log('hooking player');

		// @ts-ignore
		modules.players.exports.Player = function (
			this: Player,
			...args: unknown[]
		) {
			// eslint-disable-next-line @typescript-eslint/ban-types
			const result = (<Function>(<unknown>Player)).call(this, ...args);

			console.log(this, args);

			console.log(this.isYTMP);

			return result;
		};
	},
	[],
	['players'],
]);

async function createPane() {
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
