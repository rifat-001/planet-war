window.addEventListener('load', () => {
	// canvas setup
	const canvas = document.getElementById('canvas');
	canvas.height = 400;
	canvas.width = (500 * 16) / 10; // 16 : 10 aspect ratio

	// get 2d context
	const ctx = canvas.getContext('2d');

	class InputHandler {}

	class Projectile {}

	class Particle {}

	class Player {
		constructor(game) {
			this.game = game;
			this.width = 120;
			this.height = 190;
			this.x = 20;
			this.y = 100;
			this.speedY = 0.1;
		}

		update() {
			this.y += this.speedY;
		}

		draw(context) {
			context.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	class Enemy {}

	class Layer {}

	class Background {}

	class UI {}

	class Game {
		constructor(width, height) {
			this.width = width;
			this.height = height;
			this.player = new Player(this);
		}

		update() {
			this.player.update();
		}

		draw(context) {
			this.player.draw(context);
		}
	}

	const game = new Game(canvas.width, canvas.height);

	// animate
	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.update();
		game.draw(ctx);
		requestAnimationFrame(animate);
	}
	animate();
});
