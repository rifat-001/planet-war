import Projectile from './Projectile.js';

class Player {
	constructor(game) {
		this.game = game;
		this.width = 120;
		this.height = 190;
		this.x = 20;
		this.y = 100;
		this.speedY = 0;
		this.speedX = 2;
		this.speed = 4;

		this.scale = 1; // it will scale the cropped image from the sprite sheet

		// player sprite image
		this.image = document.getElementById('player');

		// sprite navigator
		this.frameX = 0;
		this.frameY = 0;
		this.maxFrame = 37;

		this.projectiles = [];

		// powers
		this.powerUp = false;
		this.powerUpTimer = 0;
		this.powerUpLimit = 5000;
	}

	update(deltaTime) {
		// controlling verticle movement
		if (this.game.keys.includes('w')) this.speedY = -this.speed;
		else if (this.game.keys.includes('x')) this.speedY = this.speed;
		else this.speedY = 0;

		// controlling horizontal movement
		if (this.game.keys.includes('a')) this.speedX = -this.speed;
		else if (this.game.keys.includes('d')) this.speedX = this.speed;
		else this.speedX = 0;

		// updating position
		this.y = Math.min(
			Math.max(0, this.speedY + this.y),
			this.game.height - this.height * 0.25
		);

		this.x += this.speedX;

		// updating projectile position
		this.projectiles.forEach((projectile) => {
			projectile.update();
		});

		// remove projectile which should be deleted
		this.projectiles = this.projectiles.filter(
			(projectile) => !projectile.markForDeletion
		);

		// updating sprite animation
		this.frameX = (this.frameX + 1) % this.maxFrame;

		// updating power up timer
		if (this.powerUp) {
			if (this.powerUpTimer > this.powerUpLimit) {
				this.powerUp = false;
				this.powerUpTimer = 0;
				this.frameY = 0;
			} else {
				this.powerUpTimer += deltaTime;
				this.frameY = 1;
				if (this.game.ammo < this.game.maxAmmo) {
					this.game.ammo += 0.1;
				}
			}
		}
	}

	increasePower() {
		this.powerUp = true;
		this.powerUpTimer = 0;
	}

	draw(context) {
		// debug mode
		if (this.game.debug) {
			context.strokeRect(this.x, this.y, this.width, this.height);
		}

		// power up circle
		if (this.powerUp) {
			context.save();
			context.beginPath();
			context.filter = 'blur(12px)';
			context.globalAlpha = 0.9;
			context.arc(
				this.x + this.width / 2,
				this.y + this.height / 2,
				this.width * 0.7,
				this.height,
				0,
				2 * Math.PI
			);
			context.fillStyle = '#ffffff';

			context.fill();
			context.restore();
		}

		/* drawing player sprite image
		 * drawImage(imageElement, imageX, imageY, imgeWidth, imageHeight, canvasX, canvasY, canvasWidth, canvasHeight)
		 */
		context.drawImage(
			this.image,
			this.width * this.frameX,
			this.height * this.frameY,
			this.width,
			this.height,
			this.x,
			this.y,
			this.width * this.scale,
			this.height * this.scale
		);

		// drawing projectile
		this.projectiles.forEach((projectile) => projectile.draw(context));
	}

	shootTop() {
		if (this.game.ammo > 0) {
			// horizontal axis starting point
			// it will be started from the 80% of the width
			const x = this.x + this.width * this.scale * 0.8;

			// vertical axis of starting point
			// it will be started fromt the 18% of the height
			const y = this.y + this.height * this.scale * 0.18;
			const projectile = new Projectile(this.game, x, y);
			this.projectiles.push(projectile);

			this.game.ammo--;
		}
	}

	shootBottom() {
		if (this.game.ammo > 0) {
			// horizontal axis starting point
			// it will be started from the 80% of the width
			const x = this.x + this.width * this.scale * 0.8;

			// vertical axis of starting point
			// it will be started fromt the 18% of the height
			const y = this.y + this.height * this.scale * 0.9;

			const projectile = new Projectile(this.game, x, y);
			this.projectiles.push(projectile);
		}
	}
}

export default Player;
