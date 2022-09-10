/**
 * Glorified top-level useEffect. Simulate components with toplevelComponent.
 */

let setupI = -1;
let nextSetupI = 0;

interface Hook {
	stateI: number;
	states: State[];
	previousDependencies: unknown[];
	// set before callback, accessed by useState
	dependencies: unknown[];
	unregister?: () => void;
}

interface Setup {
	nextHookI: number;
	hookI: number;
	hooks: Hook[];
	// true if initial hooks are being setup
	init: boolean;
	callback: () => void;
}

const setups: Setup[] = [];

export const toplevelComponent = (callback: () => void) => {
	const setup: Setup = {
		hooks: [],
		init: true,
		hookI: -1,
		nextHookI: 0,
		callback,
	};

	const originalSetupI = setupI;

	setupI = nextSetupI;
	nextSetupI = setupI + 1;

	setups[setupI] = setup;

	nextSetupI = setupI + 1;

	// maybe .callback() triggers a change in nextSetupI
	setup.callback();
	setup.init = false;

	setupI = originalSetupI;
};

export const renderData = () => {
	console.log('data updated', changedStates);

	setupI = 0;

	for (const setup of setups) {
		setup.nextHookI = 0;
		setup.hookI = -1;
		nextSetupI = setupI + 1;
		setup.callback();
		setupI = nextSetupI;
	}

	changedStates = [];
};

let changedStates: State[] = [];

// let renderTimeout: ReturnType<typeof setTimeout> | undefined;

/*const queRender = () => {
	if (!renderTimeout)
		renderTimeout = setTimeout(() => {
			renderData();
			renderTimeout = undefined;
		});
};*/

class State<T = unknown> {
	private value: T;
	constructor(value: T) {
		this.value = value;
	}
	get() {
		return this.value;
	}
	set(value: T) {
		this.value = value;
		changedStates.push(this);
		// synchronous:
		renderData();
		// queRender();
	}
}

export const useState = <T>(initialValue: T): [T, (newValue: T) => void] => {
	const setup = setups[setupI];

	const hook = setup.hooks[setup.hookI];

	hook.stateI++;

	if (setup.init) hook.states[hook.stateI] = new State(initialValue);

	console.log('useState', {
		setupI: setupI,
		'setup.hookI': setup.hookI,
		'hook.stateI': hook.stateI,
	});

	const state = hook.states[hook.stateI] as State<T>;

	const stateValue = state.get();

	hook.dependencies.push(stateValue);

	return [
		stateValue,
		(value: T) => {
			state.set(value);
		},
	];
};

export const useEffect = (
	callback: () => void | (() => void),
	dependencies: unknown[]
) => {
	const setup = setups[setupI];

	const originalHookI = setup.hookI;

	console.log('set hookI to ', setup.nextHookI, 'because setupI is', setupI);
	setup.hookI = setup.nextHookI;
	setup.nextHookI = setup.hookI + 1;

	if (setup.init)
		setup.hooks[setup.hookI] = {
			stateI: -1,
			states: [],
			dependencies,
			previousDependencies: [],
		};

	const hook = setup.hooks[setup.hookI];

	let render = false;

	if (setup.init) {
		render = true;
	} else {
		for (const state of hook.states)
			if (changedStates.includes(state)) {
				console.log('hook had changed state', state);
				render = true;
				break;
			}

		if (!render) {
			if (hook.previousDependencies.length !== dependencies.length) {
				render = true;
			} else {
				for (let i = 0; i < dependencies.length; i++)
					if (hook.previousDependencies[i] !== dependencies[i]) {
						console.log('dependency changed');
						render = true;
						break;
					}
			}
		}
	}

	console.log('data useEffect:', { 'setup.hookI': setup.hookI });

	if (render) {
		/*console.log('Reset hook.stateI to', 0, {
			setupI: setupI,
			'setup.hookI': setup.hookI,
			'hook.stateI': hook.stateI,
		});*/
		hook.dependencies = dependencies;
		hook.stateI = -1;

		if (!setup.init && hook.unregister) hook.unregister();
		const unregister = callback();
		if (unregister) hook.unregister = unregister;

		hook.previousDependencies = dependencies;
		hook.dependencies = [];
	}

	setup.hookI = originalHookI;
};
