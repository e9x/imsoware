import type {
	Game,
	Config,
	Player,
	World,
	Socket,
	Canvas,
	Util,
} from './krunker';
import type { Object3D, Renderer } from 'three';

interface Token {
	sid: number;
	cfid: number;
	token: string;
}

type ClientKey = number[];

const matchmaker = process.env.WEBPACK_MATCHMAKER!;
const matchmakerHelper = process.env.WEBPACK_MATCHMAKER_HELPER!;

async function clientKey(): Promise<ClientKey> {
	return await (await fetch(new URL('clientKey', matchmakerHelper))).json();
}

async function source(): Promise<string> {
	return await (await fetch(new URL('source', matchmakerHelper))).text();
}

async function hashToken(data: Token): Promise<number[]> {
	return await (
		await fetch(new URL('hashToken', matchmakerHelper), {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(data),
		})
	).json();
}

async function generateToken(clientKey: ClientKey): Promise<Token> {
	return await (
		await fetch(new URL('generate-token', matchmaker), {
			headers: {
				'client-key': clientKey.join(','),
			},
		})
	).json();
}

const loadGame = new Promise<void>((resolve) => {
	const mutationObserver = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (
					node instanceof HTMLScriptElement &&
					node.textContent?.includes('yendis')
				) {
					node.remove();
					resolve();
				}
			}
		}
	});

	mutationObserver.observe(document, { subtree: true, childList: true });
});

async function createToken(): Promise<number[]> {
	return await hashToken(await generateToken(await clientKey()));
}

export interface Module {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	exports: any;
	i: string;
}

export interface ModuleUI extends Module {
	exports: {
		render: (...args: unknown[]) => unknown;
		scale: number;
		canvas: HTMLCanvasElement;
	};
}

export interface ModulePlayers extends Module {
	exports: {
		manager: {
			new (...args: unknown[]): unknown;
		};
		Player: Player;
	};
}

export interface ModuleWorld extends Module {
	exports: {
		pchObjc: Object3D;
	};
}

export interface ModuleGameInstance extends Module {
	exports: {
		obj: (...args: unknown[]) => Game;
	};
}

export interface ModuleConfig extends Module {
	exports: Config;
}

export interface GameModules {
	config: ModuleConfig;
	ui: ModuleUI;
	instance: ModuleGameInstance;
	players: ModulePlayers;
	world: ModuleWorld;
	[key: string]: Module;
}

export interface GameObjects {
	game: Game;
	world: World;
	renderer: Renderer;
	localPlayer: Player;
	util: Util;
	canvas: Canvas;
	socket: Socket;
}

/*
console.log(module.exports);
const og = module.exports.render;

module.exports.render = function (...args: any[]) {
	console.log(module.exports, 'called me');
	return og.call(this, ...args);
}
*/

const searchFilters: {
	[key: string]: (exports: Readonly<Module['exports']>) => void | boolean;
} = {
	config(exports) {
		if (typeof exports?.gameVersion === 'string') {
			return true;
		}
	},
	ui(exports) {
		if (
			typeof exports?.render === 'function' &&
			typeof exports.canvas === 'object'
		) {
			return true;
		}
	},
	instance(exports) {
		if (typeof exports?.obj === 'function') {
			return true;
		}
	},
	players(exports) {
		if (
			typeof exports?.manager === 'function' &&
			typeof exports.Player === 'function'
		) {
			return true;
		}
	},
	world(exports) {
		if (
			typeof exports === 'function' &&
			exports.toString().includes('pchObjc=')
		) {
			return true;
		}
	},
};

export const hookCallbacks: [() => void, string[]?, string[]?][] = [
	[
		() => {
			const { obj } = modules.instance!.exports;

			modules.instance!.exports.obj = function (this: Game, ...args) {
				const result = obj.call(this, ...args);

				// eslint-disable-next-line @typescript-eslint/no-this-alias
				objects.game = this;
				modulesUpdated();

				return result;
			};
		},
		[],
		['instance'],
	],
	[
		() => {
			const World = modules.world!.exports;

			/*				objects.renderer = renderer;
				objects.util = util;
				objects.socket = socket;
				objects.canvas = canvas;
*/

			// @ts-ignore
			modules.world.exports = function (this: World, ...args: unknown[]) {
				// eslint-disable-next-line @typescript-eslint/ban-types
				const result = (<Function>(<unknown>World)).call(this, ...args);

				objects.world = this;

				modulesUpdated();

				return result;
			};
		},
		[],
		['world'],
	],
];

export const objects: Partial<GameObjects> = {};

export const modules: Partial<GameModules> = {};

const calledBacks = new WeakSet();

export function modulesUpdated() {
	hk: for (const [
		callback,
		objectDependencies,
		moduleDependencies,
	] of hookCallbacks) {
		if (calledBacks.has(callback)) continue;

		if (moduleDependencies)
			for (const dependency of moduleDependencies) {
				if (!(dependency in modules)) {
					continue hk;
				}
			}

		if (objectDependencies)
			for (const dependency of objectDependencies) {
				if (!(dependency in objects)) {
					continue hk;
				}
			}

		calledBacks.add(callback);
		callback();
	}
}

const modulesPromise: Promise<GameModules> = new Promise<GameModules>(
	// eslint-disable-next-line no-async-promise-executor
	async function load(resolve, reject) {
		const token = createToken();
		const src = await source();

		// not an array of modules
		function giveMeTheModules(module: Module) {
			for (const name in searchFilters) {
				if (searchFilters[name](module.exports)) {
					modules[name] = module;
					console.log(`Module ${module.i} was ${name}`);

					modulesUpdated();

					break;
				}
			}
		}

		const giveMeTheModules_s = `_${Math.random().toString(36).slice(2)}`;

		const patched =
			src.replace(
				/(\w+)\.exports}\w+\.m=/,
				(match, module) => `${giveMeTheModules_s}(${module}),${match}`
			) + '//# sourceURL=krunker';

		await loadGame;

		new Function('WP_fetchMMToken', giveMeTheModules_s, patched)(
			token,
			giveMeTheModules
		);

		for (const name in searchFilters) {
			if (!(name in modules)) {
				reject(`Did not match ${name}`);
				return;
			}
		}

		resolve(<GameModules>(<unknown>modules));
	}
);

export default modulesPromise;
