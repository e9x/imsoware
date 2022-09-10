import config from '../config';
import { inputIndex } from '../krunker';
import { hookCallbacks, objects } from '../loader';

hookCallbacks.push([
	() => {
		let lastJump = 0;

		objects.world!.tmpInpts.push = function (inputs) {
			const result = Array.prototype.push.call(this, inputs);

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
	},
	['world'],
]);
