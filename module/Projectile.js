class Projectile {
	constructor(game, x, y) {
		this.game = game;
		this.x = x;
		this.y = y;
		this.width = 10;
		this.height = 3;
		this.speed = 5;
		this.image = document.getElementById('projectile');
		this.markForDeletion = false;
	}

	update() {
		this.x += this.speed;
		if (this.x > this.game.width * 0.8) this.markForDeletion = true;
	}

	draw(context) {
		// debug
		if (this.game.debug) {
			context.fillStyle = 'red';
			context.fillRect(this.x, this.y, this.width, this.height);
		}
		context.drawImage(this.image, this.x, this.y);
	}
}

export default Projectile;
