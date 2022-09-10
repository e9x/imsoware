// Currently junk:

/*export function deg2rad(deg) {
	return (deg * Math.PI) / 180;
}
export function dist_center(pos) {
	return Math.hypot(
		window.innerWidth / 2 - pos.x,
		window.innerHeight / 2 - pos.y
	);
}
export function distanceTo(vec1, vec2) {
	return Math.hypot(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
}
export function applyMatrix4(pos, t) {
	var e = pos.x,
		n = pos.y,
		r = pos.z,
		i = t.elements,
		a = 1 / (i[3] * e + i[7] * n + i[11] * r + i[15]);
	return (
		(pos.x = (i[0] * e + i[4] * n + i[8] * r + i[12]) * a),
		(pos.y = (i[1] * e + i[5] * n + i[9] * r + i[13]) * a),
		(pos.z = (i[2] * e + i[6] * n + i[10] * r + i[14]) * a),
		pos
	);
}
export function project3d(pos, camera) {
	return this.applyMatrix4(
		this.applyMatrix4(pos, camera.matrixWorldInverse),
		camera.projectionMatrix
	);
}
export function update_frustum() {
	objects.world!.frustum.setFromProjectionMatrix(
		new THREE.Matrix4().multiplyMatrices(
			objects.world.camera.projectionMatrix,
			objects.world.camera.matrixWorldInverse
		)
	);
}
export function updateCamera() {
	objects.world.camera.updateMatrix();
	objects.world.camera.updateMatrixWorld();
}

export function pos2d(pos, offset_y = 0) {
	if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) return { x: 0, y: 0 };

	pos = { x: pos.x, y: pos.y, z: pos.z };

	pos.y += offset_y;

	updateCamera();

	this.project3d(pos, objects.world.camera);

	return {
		x: ((pos.x + 1) / 2) * objects.ctx.canvas.width,
		y: ((-pos.y + 1) / 2) * objects.ctx.canvas.height,
	};
}
export function obstructing(target) {
	var wallbang =
			objects.wallbangs &&
			(!objects.localPlayer ||
				(objects.localPlayer.weapon && objects.localPlayer.weapon.pierce)),
		view = this.camera_world() || new Vector3(),
		d3d = this.getD3D(view.x, view.y, view.z, target.x, target.y, target.z),
		dir = this.getDir(view.z, view.x, target.z, target.x),
		dist_dir = this.getDir(
			this.getDistance(view.x, view.z, target.x, target.z),
			target.y,
			0,
			view.y
		),
		ad = 1 / (d3d * Math.sin(dir - Math.PI) * Math.cos(dist_dir)),
		ae = 1 / (d3d * Math.cos(dir - Math.PI) * Math.cos(dist_dir)),
		af = 1 / (d3d * Math.sin(dist_dir));
	// comments were for if the player object wasnt a camera
	// view_y = player.y + (player.height || 0) - 1.15; // 1.15 = config.cameraHeight

	// iterate through game objects
	for (let obj of objects.game.map.manager.objects)
		if (!obj.noShoot && obj.active && (wallbang ? !obj.penetrable : true)) {
			var in_rect = this.lineInRect(
				view.x,
				view.z,
				view.y,
				ad,
				ae,
				af,
				obj.x - Math.max(0, obj.width),
				obj.z - Math.max(0, obj.length),
				obj.y - Math.max(0, obj.height),
				obj.x + Math.max(0, obj.width),
				obj.z + Math.max(0, obj.length),
				obj.y + Math.max(0, obj.height)
			);

			if (in_rect && 1 > in_rect) return in_rect;
		}

	// iterate through game terrain
	if (objects.game.map.terrain) {
		var ray = objects.game.map.terrain.raycast(
			view.x,
			-view.z,
			view.y,
			1 / ad,
			-1 / ae,
			1 / af
		);

		if (ray) return this.getD3D(view.x, view.y, view.z, ray.x, ray.z, -ray.y);
	}
}
export function getDistance(x1, y1, x2, y2) {
	return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
}
export function getD3D(x1, y1, z1, x2, y2, z2) {
	var dx = x1 - x2,
		dy = y1 - y2,
		dz = z1 - z2;

	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
export function getXDire(x1, y1, z1, x2, y2, z2) {
	return (
		Math.asin(Math.abs(y1 - y2) / this.getD3D(x1, y1, z1, x2, y2, z2)) *
		(y1 > y2 ? -1 : 1)
	);
}
export function getDir(x1, y1, x2, y2) {
	return Math.atan2(y1 - y2, x1 - x2);
}
export function lineInRect(lx1, lz1, ly1, dx, dz, dy, x1, z1, y1, x2, z2, y2) {
	var t1 = (x1 - lx1) * dx,
		t2 = (x2 - lx1) * dx,
		t3 = (y1 - ly1) * dy,
		t4 = (y2 - ly1) * dy,
		t5 = (z1 - lz1) * dz,
		t6 = (z2 - lz1) * dz,
		tmin = Math.max(
			Math.max(Math.min(t1, t2), Math.min(t3, t4)),
			Math.min(t5, t6)
		),
		tmax = Math.min(
			Math.min(Math.max(t1, t2), Math.max(t3, t4)),
			Math.max(t5, t6)
		);

	return tmax < 0 || tmin > tmax ? false : tmin;
}
export function getAngleDst(a1, a2) {
	return Math.atan2(Math.sin(a2 - a1), Math.cos(a1 - a2));
}
export function contains_point(point) {
	for (let plane of objects.world.frustum.planes)
		if (plane.distanceToPoint(point) < 0) return false;
	return true;
}
export function camera_world() {
	var matrix_copy = objects.world.camera.matrixWorld.clone(),
		pos = objects.world.camera[vars.getWorldPosition]();

	objects.world.camera.matrixWorld.copy(matrix_copy);
	objects.world.camera.matrixWorldInverse.copy(matrix_copy).invert();

	return pos.clone();
}
*/
