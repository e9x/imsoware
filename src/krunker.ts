import type { Object3D, PerspectiveCamera, Vector3 } from 'three';
import type THREE from 'three';

export interface Config {
	gameVersion: string;
}

export type Util = unknown;

export type Canvas = unknown;

export interface Socket {
	ahNum: number;
	socket: WebSocket;
	connected: boolean;
	socketId: number;
	sendQueue: unknown[];
	trackPacketStats: boolean;
	ingressPacketCount: number;
	ingressDataSize: number;
	egressPacketCount: number;
	egressDataSize: number;
	captchaHolder: HTMLElement | null;
}

export class Renderer {
	THREE: typeof THREE;
	camera: PerspectiveCamera;
	fpsCamera: PerspectiveCamera;
	fov: number;
}

// thanks typehole ...
export class World {
	binds: Binds;
	scrollToSwap: boolean;
	toggleSets: number[];
	chatMessages: string[];
	camRot: boolean;
	freeMouse: boolean;
	UsePointerLock: boolean;
	camOffset: boolean;
	spect: Spect;
	camType: CamType;
	scaleMap: ScaleMap;
	isMobile: boolean;
	gamepad: Gamepad2;
	hasPointerlock: boolean;
	isn: number;
	tmpInpts: number[][];
	cntrlInput: CntrlInput;
	mblInput: MblInput;
	gpSetts: number;
	kbmInput: KbmInput;
	mouseAccel: boolean;
	toggleADS: boolean[];
	adsToggled: boolean;
	mouseSkipFix: boolean;
	flickClamp: number;
	masterLock: boolean;
	locked: boolean;
	enabled: boolean;
	idleTimer: number;
	mouseX: number;
	mouseY: number;
	pchObjc: Object3D;
	object: Object3D;
	inputType: null;
	xDr: number;
	yDr: number;
	xVel: number;
	yVel: number;
	zVel: number;
	moveDirs: number[][];
	mapping: Mapping;
	speedLmt: number;
}

export interface Mapping {
	button_1: Button1;
	button_2: Button1;
	button_3: Button1;
	shoulder_bottom_left: Button1;
	button_4: Button1;
	shoulder_top_left: Button1;
	shoulder_top_right: Button1;
	shoulder_bottom_right: Shoulderbottomright;
	select: Button1;
	d_pad_up: Button1;
	d_pad_down: Button1;
	d_pad_left: Button1;
	d_pad_right: Button1;
}

export interface Shoulderbottomright {
	THRES: boolean;
	KEY: string;
}

export interface Button1 {
	KEY: string;
}

export interface KbmInput {
	aimX: number[];
	aimY: number[];
	sensX: number[];
	sensY: number[];
	invert: boolean[];
	scroll: number[];
}

export interface MblInput {
	sensX: number;
	sensY: number;
	aimX: number;
	aimY: number;
	invert: boolean;
	vibration: boolean;
	vibrationMlt: number;
	gradSpeed: boolean;
}
export interface CntrlInput {
	sensX: number;
	sensY: number;
	aimX: number;
	aimY: number;
	deadZoneR: number;
	deadZoneL: number;
	invert: boolean;
	vibration: boolean;
	vibrationMlt: number;
	triggerThres: number;
	gradSpeed: boolean;
}

export interface Gamepad2 {
	_connected: boolean;
	active: boolean;
	idleTime: number;
	_gamepad: null;
	disabled: boolean;
	_events: Events;
	_keyMapping: KeyMapping;
	_threshold: number;
	_listeners: Listener[];
}

export interface Listener {
	type: string;
	button: string;
}

export interface KeyMapping {
	gamepad: Gamepad;
	axes: Axes;
}

export interface Axes {
	stick_axis_left: number[];
	stick_axis_right: number[];
}

export interface Gamepad {
	button_1: number;
	button_2: number;
	button_3: number;
	button_4: number;
	shoulder_top_left: number;
	shoulder_top_right: number;
	shoulder_bottom_left: number;
	shoulder_bottom_right: number;
	select: number;
	start: number;
	stick_button_left: number;
	stick_button_right: number;
	d_pad_up: number;
	d_pad_down: number;
	d_pad_left: number;
	d_pad_right: number;
	vendor: number;
}

export interface CamType {
	isNormal: boolean;
	isTop: boolean;
	isSideX: boolean;
	isSideZ: boolean;
}

export interface Spect {
	target: null | Object3D;
	speed: number;
	followDis: number;
	minD: number;
	maxD: number;
}

export interface Binds {
	primary: Primary;
	reload: Primary;
	jump: Primary;
	playerList: Primary;
	scoreBoard: Primary;
	interact: Primary;
	confirm: Primary;
	secondaryInteract: Primary;
	reset: Primary;
	resetLast: Primary;
	pretend: Primary;
	spray: Primary;
	sprayWheel: Primary;
	inspect: Primary;
	swap: Primary;
	shoot: Primary;
	aim: Primary;
	crouch: Primary;
	melee: Primary;
	equip: Primary;
	chat: Primary;
	voiceChat: Primary;
	drop: Primary;
	wepVis: Primary;
	kickVoteY: Primary;
	kickVoteN: Primary;
	specFree: Primary;
	specObj: Primary;
	specFirst: Primary;
	specNames: Primary;
	kpdVoteY: Primary;
	kpdVoteN: Primary;
	specFocus: Primary;
	hidePlayers: Primary;
	prop: Primary;
	propRand: Primary;
	propRot: Primary;
	propRotR: Primary;
	noclipSB: Primary;
	godModeSB: Primary;
	killSB: Primary;
	streak: Primary[];
	taunt: Primary[];
	move: Primary[];
	toggle: Primary[];
	premium: Primary[];
	message: Primary[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ScaleMap {}

export interface Events {
	gamepad: ScaleMap;
	axes: ScaleMap;
}

export interface Primary {
	active: boolean;
	state: boolean;
	name: string;
	altName: string;
	def: number;
	altDef: number;
	val: number;
	altVal: number;
}

export class MapManager {}

export type Inputs = [];

export class Player {
	constructor(...args: unknown[]);
	isYTMP: boolean;
	objInstances: Object3D | null;
	maxHealth: number;
	health: number;
	isPlayer: true;
	inputs: Inputs;
	ammos: number[];
	onWall: number;
	onGround: boolean;
	airTime: number;
	x: number;
	y: number;
	z: number;
	velocity: Vector3;
}

export class PlayersManager {
	list: Player[];
	/**
	 * returns the existing player or creates a new instance
	 */
	add: (id: number, ...args: unknown[]) => Player;
}

interface GameConfig {
	cost: number;
	deltaMlt: number;
	maxPlayers: number;
	minPlayers: number;
	gameTime: number;
	warmupTime: number;
	gamRounds: number;
	intermTmr: number;
	forceSpawn: number;
	lives: number;
	scoreLimit: number;
	keepTScore: boolean;
	objtvTime: number;
	forceC: boolean;
	logTim: boolean;
	lstChkT: boolean;
	gravMlt: number;
	fallDmg: number;
	fallDmgThr: number;
	jumpMlt: number;
	fixMov: boolean;
	slidTime: number;
	slidSpd: number;
	impulseMlt: number;
	wallJP: number;
	strafeSpd: number;
	canSlide: boolean;
	airStrf: boolean;
	autoJump: boolean;
	bDrop: boolean;
	healthMlt: number;
	hitBoxPad: number;
	fiRat: number;
	reSpd: number;
	hpRegen: boolean;
	killRewards: boolean;
	headshotOnly: boolean;
	noSecondary: boolean;
	noStreaks: boolean;
	disableB: boolean;
	throwMel: boolean;
	chrgWeps: boolean;
	selTeam: boolean;
	frFire: boolean;
	nameTeam1: string;
	nameTeam2: string;
	nameTeam3: string;
	nameTeam4: string;
	nameTeam5: string;
	t1Dmg: number;
	t2Dmg: number;
	t3Dmg: number;
	t4Dmg: number;
	t5Dmg: number;
	allowSpect: boolean;
	thirdPerson: boolean;
	nameTags: boolean;
	nameTagsFR: boolean;
	kCams: boolean;
	aAnon: boolean;
	tmSize: number;
	noCosm: boolean;
	tstCmp: boolean;
	limitClasses: number;
	noDraws: boolean;
	bstOfR: boolean;
	maxPS: boolean;
	promServ: boolean;
	maps: number[];
	modes: null;
	classes: number[];
}

export class Game {
	THREE: typeof THREE;
	sid: number;
	config: GameConfig;
	isDestroyed: boolean;
	gameClosed: boolean;
	experimentalFeatures: boolean;
	map: MapManager;
	players: PlayersManager;
}
