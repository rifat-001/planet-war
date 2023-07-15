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

export default InputHandler;
