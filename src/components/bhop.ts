import config from '../config';
import { toplevelComponent, useEffect } from '../hooks';
import { inputIndex } from '../krunker';
import { useObject } from '../loader';

export const inputHooks: ((inputs: number[]) => void)[] = [];

toplevelComponent(() => {
	useEffect(() => {
		// console.log('BHOP INIT ' + '.'.repeat(20));

		// console.log('Call world:');
		const world = useObject('world');
		// console.log('Call localPlayer:');
		const localPlayer = useObject('localPlayer');

		// console.log('BHOP DONE ' + '.'.repeat(20));

		console.trace({ world, localPlayer }, 'bhop data');

		if (!world || !localPlayer) return;

		console.log('got localPlayer', localPlayer);

		let lastJump = 0;

		const { push } = world.tmpInpts;

		world.tmpInpts.push = function (inputs) {
			const result = push.call(this, inputs);

			for (const hook of inputHooks) hook(inputs);

			if (config.bhop && inputs[inputIndex.jump]) {
				inputs[inputIndex.jump] = lastJump;
				lastJump ^= 1;
				// if crouch isn't already held, override crouch
				if (!inputs[inputIndex.crouch])
					inputs[inputIndex.crouch] =
						(localPlayer.velocity.y || 0) < 0 ? 1 : inputs[inputIndex.crouch];
			}

			return result;
		};

		return () => {
			world.tmpInpts.push = push;
		};
	}, []);
});
