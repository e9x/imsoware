import { setupHooks, useKrunker } from '../hooks';
import { objects } from '../loader';

setupHooks(() => {
	useKrunker(() => {
		if (!objects.canvas) return;

		const canvas = objects.canvas;
		canvas;
		console.log(canvas);
	}, [objects.canvas]);
});
