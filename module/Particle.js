class Particle {
	constructor(game, x, y) {
		this.game = game;
		this.x = x;
		this.y = y;
		this.image = document.getElementById('gears');

		this.width = 50;
		this.height = 50;

		// sprite Data
		this.frameX = Math.floor(Math.random() * 3);
		this.frameY = Math.floor(Math.random() * 3);

		this.sizeModifier = Math.random() * 0.5 + 0.5;
		this.size = this.width * this.sizeModifier;

		// physics
		this.velocityX = Math.random() * 6 - 3;
		this.velocityY = Math.random() * -15;
		this.gravity = 0.5;
		this.angle = 0;
		this.va = Math.random() * 0.2 - 0.1;
		this.bounced = 0;
		this.maxBounceCount = Math.floor(Math.random() * 1 + 2);
		this.bounceBoundary = this.game.height * (Math.random() * 0.1 + 0.7);
	}

	update() {
		this.angle += this.va;

		// updating velocity
		this.velocityY += this.gravity;

		// simulate bouncing
		if (this.y >= this.bounceBoundary && this.bounced < this.maxBounceCount) {
			this.bounced++;
			this.velocityY = -(this.velocityY * 0.7);
		}

		// updating position
		this.x -= this.velocityX + this.game.gameSpeed;
		this.y += this.velocityY;

		if (this.y > this.game.height || this.x < -this.size)
			this.markForDeletion = true;
	}

	draw(context) {
		// rotating canvas
		context.save();
		context.translate(this.x, this.y);
		context.rotate(this.angle);
		if (this.game.debug) {
			// because we translate the canvas to this.x and this.y
			// now (0, 0) means (this.x, this.y)
			context.strokeRect(0, 0, this.size, this.size);
			context.font = '20px Helvetica';
			context.fillText(`${this.frameX}, ${this.frameY}`, this.x, this.y);
		}

		context.drawImage(
			this.image,
			this.width * this.frameX,
			this.height * this.frameY,
			this.width,
			this.height,
			this.size * -0.5,
			this.size * -0.5,
			this.size,
			this.size
		);
		context.restore();
	}
}

export default Particle;
