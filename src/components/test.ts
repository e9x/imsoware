import { dataUpdated, setupHooks, useKrunker } from '../hooks';
import keys from '../keys';
import type { Player } from '../krunker';
import { inputIndex } from '../krunker';
import { modules, objects } from '../loader';

let originalPos: { x: number; y: number; z: number } | undefined;

setupHooks(() => {
	useKrunker(() => {
		if (!objects.world) return;

		const { push } = objects.world.tmpInpts;

		objects.world.tmpInpts.push = function (inputs) {
			const result = push.call(this, inputs);

			// freeze on server clock
			// inputs[inputIndex.speedLimit] = [];

			// @ts-ignore
			if (window.doHook) {
				try {
					// @ts-ignore
					window.doHook(keys, inputs, inputIndex, push, this);
				} catch (err) {
					console.error(err);
					// @ts-ignore
					window.doHook = undefined;
				}
			} else if (objects.localPlayer) {
				// Attempt some funny work
				// Most of this has been patched
				// I sent an older snippet of fiddling with speedLimit to HighNoon..

				if (keys.has('KeyE')) {
					// @ts-ignore

					if (!originalPos) {
						originalPos = {
							x: objects.localPlayer.x,
							y: objects.localPlayer.y,
							z: objects.localPlayer.z,
						};
					}

					// freeze player
					objects.localPlayer.x = originalPos.x;
					objects.localPlayer.y = originalPos.y;
					objects.localPlayer.z = originalPos.z;
				} else {
					originalPos = undefined;
				}
			}

			return result;
		};

		return () => {
			if (!objects.world) return;

			objects.world.tmpInpts.push = push;
		};
	}, [modules.world]);

	useKrunker(() => {
		if (!objects.game) return;

		const { add } = objects.game!.players;

		objects.game.players.add = function (...args) {
			const player = add.call(this, ...args);

			if (player.isYTMP) {
				objects.localPlayer = player;
				dataUpdated();
			}

			return player;
		};
	}, [objects.game]);

	useKrunker(() => {
		if (!modules.players) return;

		const { Player } = modules.players.exports;

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

		return () => {
			if (!modules.players) return;

			modules.players.exports.Player = Player;
		};
	}, [modules.players]);
});
