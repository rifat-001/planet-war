const canvas = document.querySelector('canvas');
canvas.width = 500;
canvas.height = 500;
const ctx = canvas.getContext('2d');

const explosion = document.getElementById('explosion');
const hiveWhale = document.getElementById('hive-whale');
const octopusAttack = document.getElementById('octopus-attack');
const octopusHurt = document.getElementById('octopus-hurt');
const whaleDeath = document.getElementById('whale-death');
const whaleAttack = document.getElementById('whale-attack');
const whaleIdle = document.getElementById('whale-idle');
const whaleWalk = document.getElementById('whale-walk');
const whaleHurt = document.getElementById('whale-hurt');

console.log('playground');
function drawFire(ctx, frame) {
	const fireImage = document.getElementById('fire-explosion');

	const maxFrame = 8;
	const spriteWidth = 200;
	const spriteHeight = 200;
	const canvasX = 20;
	const canvasY = 20;
	const scale = 0.5;
	const visibleWidth = spriteWidth * scale;
	const visibleHeight = spriteHeight * scale;

	const frameX = frame % maxFrame;
	const frameY = 0;
	ctx.drawImage(
		fireImage,
		spriteWidth * frameX, // sprite X position
		spriteHeight * frameY, // sprite Y position
		spriteWidth,
		spriteHeight,
		canvasX,
		canvasY,
		visibleWidth,
		visibleHeight
	);
	frame++;
	return frame % maxFrame;
}

function drawExplosion(ctx, image, frame) {
	const explosion = image;

	const maxFrame = 9;
	let spriteWidth = 460;
	let spriteHeight = 305;
	let canvasX = 20;
	let canvasY = 20;
	let scale = 1;
	let visibleWidth = spriteWidth * scale;
	let visibleHeight = spriteHeight * scale;

	let row = 3;
	let col = 3;
	let frameX = frame % col;
	let frameY = parseInt(frame / row);
	// console.log(frameX, frameY);

	ctx.drawImage(
		explosion,
		spriteWidth * frameX, // sprite X position
		spriteHeight * frameY, // sprite Y position
		spriteWidth,
		spriteHeight,
		canvasX,
		canvasY,
		visibleWidth,
		visibleHeight
	);
	frame++;
	// console.log(frame);
	return frame % maxFrame;
}

function buildSprite(data, frame) {
	const image = data.image;
	const ctx = data.ctx;
	const spriteWidth = data.spriteWidth;
	const spriteHeight = data.spriteHeight;
	const canvasX = data.canvasX;
	const canvasY = data.canvasY;
	const scale = data.scale;
	const rowCount = data.rowCount;
	const colCount = data.colCount;

	const visibleWidth = spriteWidth * scale;
	const visibleHeight = spriteHeight * scale;
	const maxFrame = rowCount * colCount;

	// parsing matrix representation of sprite frame from linear frame value
	const frameX = frame % colCount;
	const frameY = parseInt(frame / colCount);
	console.log(frameX, frameY);

	console.log(spriteWidth * frameX, spriteHeight * frameY);
	ctx.drawImage(
		image,
		spriteWidth * frameX, // sprite X position
		spriteHeight * frameY, // sprite Y position
		spriteWidth,
		spriteHeight,
		canvasX,
		canvasY,
		visibleWidth,
		visibleHeight
	);
	frame++;
	return frame % maxFrame;
}

const hiveWhaleData = {
	image: hiveWhale,
	ctx,
	spriteWidth: 400,
	spriteHeight: 227,
	rowCount: 1,
	colCount: 39,
	scale: 1,
	canvasX: 50,
	canvasY: 50,
};

const octopusAttackData = {
	image: octopusAttack,
	ctx,
	spriteWidth: 48,
	spriteHeight: 48,
	rowCount: 1,
	colCount: 6,
	scale: 3,
	canvasX: 50,
	canvasY: 50,
};

const octopusHurtData = {
	image: octopusHurt,
	ctx,
	spriteWidth: 48,
	spriteHeight: 48,
	rowCount: 1,
	colCount: 2,
	scale: 3,
	canvasX: 200,
	canvasY: 50,
};

const whaleDeathData = {
	image: whaleDeath,
	ctx,
	spriteWidth: 48,
	spriteHeight: 48,
	rowCount: 1,
	colCount: 6,
	scale: 3,
	canvasX: 200,
	canvasY: 50,
};

const whaleHurtData = {
	image: whaleHurt,
	ctx,
	spriteWidth: 48,
	spriteHeight: 48,
	rowCount: 1,
	colCount: 2,
	scale: 3,
	canvasX: 50,
	canvasY: 50,
};
let f1 = 0;
let f2 = 0;

// frame = buildSprite(hiveWhaleData, 1);
const interval = setInterval(() => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//frame = drawFire(ctx, frame);
	f1 = buildSprite(whaleHurtData, f1);
	f2 = buildSprite(whaleDeathData, f2);
	//frame = drawExplosion(ctx, explosion, frame);
}, 150);
