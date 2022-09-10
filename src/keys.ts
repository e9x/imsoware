const keys = new Set<string>();

window.addEventListener('keydown', (event) => {
	keys.add(event.code);
});

window.addEventListener('keyup', (event) => {
	keys.delete(event.code);
});

window.addEventListener('focus', () => {
	for (const key of keys) {
		keys.delete(key);
	}
});

export default keys;
