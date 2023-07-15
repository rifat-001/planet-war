import Player from './module/Player.js';
import InputHandler from './module/InputHandler.js';
import Particle from './module/Particle.js';
import Background from './module/Background.js';

window.addEventListener('load', () => {
	// canvas setup
	const canvas = document.getElementById('canvas');
	canvas.height = 500;
	canvas.width = (500 * 16) / 10; // 16 : 10 aspect ratio

	// get 2d context
	const ctx = canvas.getContext('2d');

	class Enemy {
		constructor(game) {
			this.game = game;
			this.x = this.game.width;
			this.speedX = Math.random() * -1.5 - this.game.gameSpeed - 0.3;
			this.markForDeletion = false;
			this.lives = 5;
			this.score = this.lives;
		}

		update() {
			this.x += this.speedX;
			// console.log(this.game.gameSpeed);
			if (this.x + this.width < 0) this.markForDeletion = true;

			// updating frame
			this.frameX = (this.frameX + 1) % this.maxFrame;
		}

		draw(context) {
			// debug mode
			if (this.game.debug) {
				context.fillStyle = 'red';
				context.strokeRect(this.x, this.y, this.width, this.height);
				context.font = '20px Helvetica';
				context.fillText(`${this.lives}`, this.x, this.y);
			}

			// console.log(this.image);
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
		}
	}

	class Angler1 extends Enemy {
		constructor(game) {
			super(game);
			this.width = 228;
			this.height = 169;
			this.y = Math.random() * (this.game.height * 0.9 - this.height);

			this.image = document.getElementById('angler-1');
			// console.log(this.image);

			// sprite data
			this.maxFrame = 39;
			this.frameX = 0;
			this.frameY = Math.floor(Math.random() * 3);
			this.scale = 1;

			this.lives = 2;
			this.score = this.lives;
		}
	}

	class Angler2 extends Enemy {
		constructor(game) {
			super(game);
			this.width = 213;
			this.height = 165;
			this.y = Math.random() * (this.game.height * 0.9 - this.height);

			this.image = document.getElementById('angler-2');

			// sprite data
			this.maxFrame = 39;
			this.frameX = 0;
			this.frameY = Math.floor(Math.random() * 2);
			this.scale = Math.random() * 0.5 + 0.8;

			this.lives = 3;
			this.score = this.lives;
		}
	}

	class Lucky extends Enemy {
		constructor(game) {
			super(game);
			this.width = 99;
			this.height = 95;
			this.y = Math.random() * (this.game.height * 0.9 - this.height);

			this.image = document.getElementById('lucky');

			// sprite data
			this.maxFrame = 39;
			this.frameX = 0;
			this.frameY = Math.floor(Math.random() * 2);
			this.scale = Math.random() * 0.5 + 0.8;

			this.lives = 3;
			this.score = this.lives;

			this.type = 'powerup';
		}
	}

	class Hive extends Enemy {
		constructor(game) {
			super(game);
			this.width = 400;
			this.height = 227;
			this.y = Math.random() * (this.game.height * 0.9 - this.height);

			this.image = document.getElementById('hive-whale');

			// sprite data
			this.maxFrame = 39;
			this.frameX = 0;
			this.frameY = 0;
			this.scale = Math.random() * 0.5 + 0.8;

			this.lives = 15;
			this.score = this.lives;
			this.type = 'hive';

			// override
			this.speedX = Math.random() * -1.2 - 0.2;
		}
	}

	class Drone extends Enemy {
		constructor(game, x, y) {
			super(game);
			this.width = 115;
			this.height = 95;

			this.x = x;
			this.y = y;

			this.image = document.getElementById('drone');

			// sprite data
			this.maxFrame = 39;
			this.frameX = 0;
			this.frameY = Math.floor(Math.random() * 2);
			this.scale = Math.random() * 0.5 + 0.8;

			this.lives = 2;
			this.score = this.lives;
			this.type = 'drone';

			// override
			this.speedX = Math.random() * -4.2 - 0.5;
		}
	}

	class Effect {
		constructor(game, x, y) {
			this.game = game;
			this.x = x;
			this.y = y;
			this.markForDeletion = false;
			// sprite data
			this.image;
			this.frameX;
			this.frameY;
			this.maxFrame;

			this.width;
			this.height;
			this.scale;

			this.fps = 60;
			this.timer = 0;
			this.interval = 1000 / this.fps;
		}

		update(deltaTime) {
			// move the smoke with the game speed
			this.y -= this.game.gameSpeed;

			if (this.timer >= this.interval) {
				this.timer = 0;
				this.frameX = this.frameX + 1;
			} else this.timer += deltaTime;
			if (this.frameX === this.maxFrame) this.markForDeletion = true;
		}

		draw(context) {
			context.drawImage(
				this.image,
				this.width * this.frameX,
				this.y * this.frameY,
				this.width,
				this.height,
				this.x,
				this.y,
				this.width * this.scale,
				this.height * this.scale
			);
		}
	}

	class Smoke extends Effect {
		constructor(game, x, y) {
			super(game, x, y);
			this.image = document.getElementById('smoke-explosion');

			this.width = 200;
			this.height = 200;

			// sprite data
			this.frameX = 0;
			this.frameY = 0;
			this.maxFrame = 8;
			this.scale = 1;
		}
	}

	class UI {
		constructor(game) {
			this.game = game;
			this.fontSize = 25;
			this.fontFamily = 'Helvetica';
			this.color = 'white';
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
			this.background = new Background(this);
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
			this.gameMaxTime = 1000 * 1000;
			this.winningScore = 40;
			this.gameSpeed = 1;
			this.debug = false;

			// particles
			this.particles = [];

			// effect
			this.effects = [];
		}

		update(deltaTime) {
			this.background.update();
			this.player.update(deltaTime);
			this.background.layer4.update(); // player will be bellow this layer

			// updating all the particles
			this.particles.forEach((particle) => particle.update());
			this.particles = this.particles.filter(
				(particle) => !particle.markForDeletion
			);

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

			// updating effect array
			this.effects.forEach((effect) => effect.update(deltaTime));
			this.effects = this.effects.filter((effect) => !effect.markForDeletion);

			// updating enemies and collsion check
			this.enemies.forEach((enemy) => {
				enemy.update();

				// player and enemy collsion
				if (this.checkCollision(this.player, enemy)) {
					if (enemy.type == 'powerup') {
						this.player.increasePower();
						enemy.markForDeletion = true;
					} else {
						// if player collide with general type enmy
						this.score = Math.max(0, --this.score);
					}
				}

				// checking collision of projectile and enemies
				this.player.projectiles.forEach((projectile) => {
					if (this.checkCollision(projectile, enemy)) {
						enemy.lives--;
						// if game is not over only then update the score
						if (!this.gameOver) this.score += enemy.score;

						if (enemy.lives == 0) enemy.markForDeletion = true;
						projectile.markForDeletion = true;

						// animating gears and spawning creatures if necessary
						if (enemy.markForDeletion) {
							// if enemy is destroyed
							// 10 particles will be spreaded from the enemy
							for (let i = 0; i < 10; i++) {
								this.particles.push(
									new Particle(
										this,
										enemy.x + enemy.width * 0.5,
										enemy.y + enemy.height * 0.5
									)
								);
							}

							// if enemy type is hive then spawn 3-5 drone at the place of hive
							if (enemy.type === 'hive') {
								const droneCount = Math.floor(Math.random() * 3 + 1);
								for (let i = 0; i < droneCount; i++) {
									this.enemies.push(
										new Drone(
											this,
											enemy.x + enemy.width * Math.random(),
											enemy.y + enemy.height * 0.5
										)
									);
								}
							}

							// draw smoke at the place of death
							this.effects.push(new Smoke(this, enemy.x, enemy.y));
						} else {
							// simple enemy and projectile collsion

							// drop one gears from the enemy
							this.particles.push(
								new Particle(
									this,
									enemy.x + enemy.width * 0.5,
									enemy.y + enemy.height * 0.5
								)
							);
						}
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
			this.background.draw(context);
			this.player.draw(context);
			this.ui.draw(context);

			// drawing particles
			this.particles.forEach((particle) => particle.draw(context));

			// drawing enemies
			this.enemies.forEach((enemy) => enemy.draw(context));

			// drawing effects at the top of enemies and player
			this.effects.forEach((effect) => effect.draw(context));

			// draw the front layer
			this.background.layer4.draw(context);
		}

		addEnemy() {
			const enemyTypes = [Angler1, Angler2, Lucky, Hive];

			// random index between 0 and enemyTypes array
			const index = Math.floor(Math.random() * enemyTypes.length);

			// add randomly choosen indexed enemy to the enemies array
			this.enemies.push(new enemyTypes[index](this));
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
		game.draw(ctx);
		game.update(deltaTime);
		requestAnimationFrame(animate);
	}
	animate(0);
});
