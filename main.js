window.addEventListener('load', () => {
	// canvas setup
	const canvas = document.getElementById('canvas');
	canvas.height = 500;
	canvas.width = (500 * 16) / 10; // 16 : 10 aspect ratio

	// get 2d context
	const ctx = canvas.getContext('2d');

	class InputHandler {
		constructor(game) {
			this.game = game;

			window.addEventListener('keydown', (e) => {
				if (
					(e.key === 'w' || e.key == 'x' || e.key === 'a' || e.key === 'd') &&
					this.game.keys.indexOf(e.key) === -1 // make sure the key is not present in the key array
				) {
					// console.log('down');
					this.game.keys.push(e.key);
				}

				// enabling debug mode
				if (e.key === 'q') this.game.debug = !this.game.debug;

				// handling space !! Special Case !!
				if (e.key === ' ') {
					this.game.player.shootTop();
					if (this.game.player.powerUp) {
						this.game.player.shootBottom();
					}
				}

				// logging key array
				// console.log(this.game.keys);
			});

			window.addEventListener('keyup', (e) => {
				// remove index of key that is just released
				const index = this.game.keys.indexOf(e.key);
				if (index > -1) {
					// console.log('up');
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
				ctx.arc(
					this.x + this.width / 2,
					this.y + this.height / 2,
					this.width * 0.7,
					this.height,
					0,
					2 * Math.PI
				);
				ctx.fillStyle = '#ffffff';

				ctx.fill();
				ctx.restore();
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

	class Layer {
		constructor(game, image, speedModifier) {
			this.game = game;
			this.image = image;
			this.speedModifier = speedModifier;
			this.width = 1768;
			this.height = 500;
			this.x = 0;
			this.y = 0;
		}

		update() {
			if (this.x <= -this.width) this.x = 0;
			this.x -= this.game.gameSpeed * this.speedModifier;
		}

		draw(context) {
			context.drawImage(this.image, this.x, this.y);
			context.drawImage(this.image, this.x + this.width, this.y);
		}
	}

	class Background {
		constructor(game) {
			this.game = game;
			this.image1 = document.getElementById('layer-1');
			this.image2 = document.getElementById('layer-2');
			this.image3 = document.getElementById('layer-3');
			this.image4 = document.getElementById('layer-4');

			this.layer1 = new Layer(this.game, this.image1, 0.2);
			this.layer2 = new Layer(this.game, this.image2, 0.4);
			this.layer3 = new Layer(this.game, this.image3, 1);
			this.layer4 = new Layer(this.game, this.image4, 1.3);

			this.layers = [this.layer1, this.layer2, this.layer3];
		}

		update() {
			this.layers.forEach((layer) => layer.update());
		}

		draw(context) {
			this.layers.forEach((layer) => {
				layer.draw(context);
			});
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

			// console.log(this.enemies);

			// updating enemies
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

						// animating gears
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
						} else {
							// simple enemy and projectile collsion
							console.log('collide', Math.random());
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

			// draw the front layer
			this.background.layer4.draw(context);
		}

		addEnemy() {
			const enemyTypes = [Angler1, Angler2, Lucky];

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
		game.update(deltaTime);
		game.draw(ctx);
		requestAnimationFrame(animate);
	}
	animate(0);
});
