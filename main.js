window.addEventListener('load', () => {
	// canvas setup
	const canvas = document.getElementById('canvas');
	canvas.height = 400;
	canvas.width = (500 * 16) / 10; // 16 : 10 aspect ratio

	// get 2d context
	const ctx = canvas.getContext('2d');

	class InputHandler {
		constructor(game) {
			this.game = game;

			window.addEventListener('keydown', (e) => {
				if (
					(e.key === 'ArrowUp' ||
						e.key == 'ArrowDown' ||
						e.key === 'ArrowLeft' ||
						e.key === 'ArrowRight') &&
					this.game.keys.indexOf(e.key) === -1 // make sure the key is not present in the key array
				) {
					this.game.keys.push(e.key);
				}

				// handling space !! Special Case !!
				if (e.key === ' ') {
					this.game.player.shootTop();
				}

				// logging key array
				console.log(this.game.keys);
			});

			window.addEventListener('keyup', (e) => {
				// remove index of key that is just released
				const index = this.game.keys.indexOf(e.key);
				if (index > -1) {
					this.game.keys.splice(index, 1);
				}
			});
		}
	}

	class Projectile {
		constructor(game, x, y) {
			this.game = game;
			this.x = x;
			this.y = y;
			this.width = 10;
			this.height = 3;
			this.speed = 5;
			this.markForDeletion = false;
		}

		update() {
			this.x += this.speed;
			if (this.x > this.game.width * 0.8) this.markForDeletion = true;
		}

		draw(context) {
			context.fillStyle = 'red';
			context.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	class Particle {}

	class Player {
		constructor(game) {
			this.game = game;
			this.width = 120;
			this.height = 190;
			this.x = 20;
			this.y = 100;
			this.speedY = 0;
			this.speedX = 0;
			this.speed = 4;

			this.projectiles = [];
		}

		update() {
			// controlling verticle movement
			if (this.game.keys.includes('ArrowUp')) this.speedY = -this.speed;
			else if (this.game.keys.includes('ArrowDown')) this.speedY = this.speed;
			else this.speedY = 0;

			// controlling horizontal movement
			if (this.game.keys.includes('ArrowLeft')) this.speedX = -this.speed;
			else if (this.game.keys.includes('ArrowRight')) this.speedX = this.speed;
			else this.speedX = 0;

			// updating position
			this.y += this.speedY;
			this.x += this.speedX;

			// updating projectile position
			this.projectiles.forEach((projectile) => {
				projectile.update();
			});

			// remove projectile which should be deleted
			this.projectiles = this.projectiles.filter(
				(projectile) => !projectile.markForDeletion
			);

			// console.log(this.projectiles);
		}

		draw(context) {
			context.fillStyle = 'blue';
			context.fillRect(this.x, this.y, this.width, this.height);

			// drawing projectile
			this.projectiles.forEach((projectile) => projectile.draw(context));
		}

		shootTop() {
			if (this.game.ammo > 0) {
				const x = this.x + this.width; // horizontal axis starting point
				const y = this.y + 5; // vertical axis of starting point
				const projectile = new Projectile(this.game, x, y);
				this.projectiles.push(projectile);

				this.game.ammo--;
			}
		}
	}

	class Enemy {
		constructor(game) {
			this.game = game;
			this.x = this.game.width;
			this.speedX = Math.random() * -1.5 - 0.5;
			this.markForDeletion = false;
			this.lives = 5;
			this.score = this.lives;
		}

		update() {
			this.x += this.speedX;
			if (this.x + this.width < 0) this.markForDeletion = true;
		}

		draw(context) {
			context.fillStyle = 'red';
			context.fillRect(this.x, this.y, this.width, this.height);
			context.font = '20px Helvetica';
			context.fillText(this.lives, this.x, this.y);
		}
	}

	class Angler extends Enemy {
		constructor(game) {
			super(game);
			this.width = 228 * 0.2;
			this.height = 169 * 0.2;
			this.y = Math.random() * (this.game.height * 0.9 - this.height);
		}
	}

	class Layer {}

	class Background {}

	class UI {
		constructor(game) {
			this.game = game;
			this.fontSize = 25;
			this.fontFamily = 'Helvetica';
			this.color = 'green';
		}

		draw(context) {
			context.save();

			// game ammo indicator
			for (let i = 0; i < this.game.ammo; i++) {
				context.fillStyle = 'red';
				context.fillRect(20 + 5 * i, 50, 3, 20);
			}

			// game score
			context.fillStyle = this.color;
			context.font = `${this.fontSize}px ${this.fontFamily}`;
			context.fillText(`Score : ${this.game.score}`, 20, 40);

			// game Timer
			context.fillStyle = 'black';
			context.font = `${this.fontSize - 5}px ${this.fontFamily}`;
			context.fillText(
				`Time : ${(this.game.gameTimer / 1000).toFixed(1)}`,
				20,
				100
			);

			// gameover message
			if (this.game.gameOver) {
				let message1, message2;
				context.textAlign = 'center';

				if (this.game.score > this.game.winningScore) {
					context.fillStyle = 'green';
					message1 = 'You win!';
					message2 = 'Well done!';
				} else {
					context.fillStyle = 'red';
					message1 = 'You lose!';
					message2 = 'Try again next time!';
				}

				context.font = '50px' + this.fontFamily;
				context.fillText(
					message1,
					this.game.width * 0.5,
					this.game.height * 0.5
				);
				context.fillText(
					message2,
					this.game.width * 0.5,
					this.game.height * 0.5 + 40
				);
			}
			context.restore();
		}
	}

	class Game {
		constructor(width, height) {
			this.width = width;
			this.height = height;
			this.player = new Player(this);
			this.input = new InputHandler(this);
			this.ui = new UI(this);
			this.keys = [];

			// enemies data
			this.enemies = [];
			this.enemyTimer = 0;
			this.enemyInterVal = 2000;
			this.maxEnemyOnScreen = 7;

			// player ammo data
			this.ammo = 20;
			this.maxAmmo = 50;
			this.ammoTimer = 0;
			this.ammoInterval = 500;

			// game state
			this.gameOver = false;
			this.score = 0;
			this.gameTimer = 0;
			this.gameMaxTime = 1000 * 10;
			this.winningScore = 40;
		}

		update(deltaTime) {
			this.player.update();

			// recharging ammo after certain period of time
			if (this.ammoTimer > this.ammoInterval && this.ammo < this.maxAmmo) {
				this.ammo++;
				this.ammoTimer = 0;
			} else this.ammoTimer += deltaTime;

			// adding new Enemies
			if (
				this.enemyTimer > this.enemyInterVal &&
				this.enemies.length < this.maxEnemyOnScreen &&
				!this.gameOver
			) {
				this.addEnemy();
				this.enemyTimer = 0;
			} else this.enemyTimer += deltaTime;

			// console.log(this.enemies);

			// updating enemies
			this.enemies.forEach((enemy) => {
				enemy.update();

				// checking collision of projectile and enemies
				this.player.projectiles.forEach((projectile) => {
					if (this.checkCollision(projectile, enemy)) {
						enemy.lives--;
						// if game is not over only then update the score
						if (!this.gameOver) this.score += enemy.score;

						if (enemy.lives == 0) enemy.markForDeletion = true;
						projectile.markForDeletion = true;
					}
				});
			});

			// filtering enemies
			this.enemies = this.enemies.filter((enemy) => !enemy.markForDeletion);

			// checking if time is over for the game
			if (this.gameTimer > this.gameMaxTime) {
				this.gameOver = true;
			}

			// updating game time
			if (!this.gameOver) this.gameTimer += deltaTime;
		}

		draw(context) {
			this.player.draw(context);
			this.ui.draw(context);

			// drawing enemies
			this.enemies.forEach((enemy) => enemy.draw(context));
		}

		addEnemy() {
			this.enemies.push(new Angler(this));
		}

		checkCollision(r1, r2) {
			return (
				r1.x < r2.x + r2.width &&
				r2.x < r1.x + r1.width &&
				r1.y < r2.y + r2.height &&
				r2.y < r1.y + r1.height
			);
		}
	}

	const game = new Game(canvas.width, canvas.height);

	let lastTime = 0;
	// animate
	function animate(timeStamp) {
		const deltaTime = timeStamp - lastTime; // time between two frames
		lastTime = timeStamp;
		// console.log(deltaTime);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.update(deltaTime);
		game.draw(ctx);
		requestAnimationFrame(animate);
	}
	animate(0);
});
