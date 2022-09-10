import config from '../config';
import { toplevelComponent, useEffect } from '../hooks';
import { inputIndex } from '../krunker';
import { useObject } from '../loader';

export const inputHooks: ((inputs: number[]) => void)[] = [];

toplevelComponent(() => {
	useEffect(() => {
		const world = useObject('world');
		const localPlayer = useObject('localPlayer');

		if (!world || !localPlayer) return;

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
