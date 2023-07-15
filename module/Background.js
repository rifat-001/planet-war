import Layer from './Layer.js';

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

export default Background;
