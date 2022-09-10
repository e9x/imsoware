import config from '../config';
import { setupHooks, useKrunker } from '../hooks';
import { inputIndex } from '../krunker';
import { objects } from '../loader';

setupHooks(() => {
	useKrunker(() => {
		if (!objects.world) return;

		let lastJump = 0;

		const { push } = objects.world.tmpInpts;

		objects.world.tmpInpts.push = function (inputs) {
			const result = push.call(this, inputs);

			if (config.bhop && inputs[inputIndex.jump]) {
				inputs[inputIndex.jump] = lastJump;
				lastJump ^= 1;
				// if crouch isn't already held, override crouch
				if (!inputs[inputIndex.crouch])
					inputs[inputIndex.crouch] =
						(objects.localPlayer?.velocity.y || 0) < 0
							? 1
							: inputs[inputIndex.crouch];
			}

			return result;
		};

		return () => {
			if (!objects.world) return;

			objects.world.tmpInpts.push = push;
		};
	}, [objects.world]);
});
