/**
 * Glorified top-level useEffect. Simulate components with setupHooks.
 */

const hookSetups: (() => void)[] = [];

let setupI = 0;

const setups: Setup[] = [];

export const setupHooks = (callback: () => void) => {
	hookSetups.push(callback);

	setups[setupI] = { hooks: [], init: true, hookI: 0 };
	callback();
	setupI++;
};

interface Hook {
	last: unknown[];
	unregister?: () => void;
}

interface Setup {
	hookI: number;
	hooks: Hook[];
	// true if initial hooks are being setup
	init: boolean;
}

export const useKrunker = (
	callback: () => void | (() => void),
	dependencies: unknown[]
) => {
	const setup = setups[setupI];

	const i = setup.hookI++;

	if (setup.init)
		setup.hooks[i] = {
			last: [],
		};

	const hook = setup.hooks[i];

	if (!hook.last.length) {
		callback();
	} else {
		for (let i = 0; i < hook.last.length; i++)
			if (hook.last[i] !== dependencies[i]) {
				console.log('dependency changed');
				if (hook.unregister) hook.unregister();
				const unregister = callback();
				if (unregister) hook.unregister = unregister;
				break;
			}
	}

	hook.last = dependencies;
};

export const dataUpdated = () => {
	setupI = 0;

	for (const setup of hookSetups) {
		setups[setupI].hookI = 0;
		setup();
		setupI++;
	}
};
