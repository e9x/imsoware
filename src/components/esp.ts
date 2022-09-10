import { toplevelComponent, useEffect } from '../hooks';
import { useObject } from '../loader';

toplevelComponent(() => {
	useEffect(() => {
		const canvas = useObject('canvas');

		if (!canvas) return;

		console.log(canvas);
	}, []);
});
