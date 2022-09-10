import deepmerge from 'deepmerge';

const CONFIG_KEY = 'imsoware';

let config = {
	bhop: false,
};

try {
	config = deepmerge(config, JSON.parse(GM_getValue(CONFIG_KEY)));
} catch (_error) {
	console.log(_error);
}

export default config;

const timeouts: number[] = [];

export function saveConfig() {
	timeouts.push(
		<number>(<unknown>setTimeout(() => {
			for (const timeout of timeouts) {
				clearTimeout(timeout);
			}

			console.log('Saved');

			GM_setValue(CONFIG_KEY, JSON.stringify(config));
		}, 500))
	);
}
