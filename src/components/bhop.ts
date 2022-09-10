import config from '../config';
import { inputIndex } from '../krunker';
import { hookCallbacks, objects } from '../loader';

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

			return result;
		};
	},
	['world'],
]);
