'use sctrict';

const IMG_SIZE = 256;
const IMG_PADDING = 16;
const MARGIN = 256;

const config = {
	type: Phaser.AUTO,
	width: IMG_SIZE * 4 + IMG_PADDING * 5,
	height: IMG_SIZE * 4 + IMG_PADDING * 5 + MARGIN * 2,
	scene: {
		preload: preload,
		create: create,
		update: update,
	},
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	backgroundColor: 'rgba(0,0,0,0)',
	transparent: true,
};

new Phaser.Game(config);
let game;

const cards = [];
let openedCard = null;
let completed = 0;
let globalBlocked = false;

class Card {
	constructor(num, x, y) {
		this.num = num;
		this.face = game.add.sprite(x, y, `card${num}`).setScale(0, 1);
		this.cover = game.add.sprite(x, y, 'cover').setInteractive();
		this.cover.on('pointerdown', this.onClick());
		this.blocked = false;
	}

	flip(toFace) {
		this.blocked = true;
		game.tweens.addCounter({
			from: toFace ? 1 : -1,
			to: toFace ? -1 : 1,
			duration: 382,
			onUpdate: tween => {
				this.face.setScale(-Math.min(tween.getValue(), 0), 1);
				this.cover.setScale(Math.max(tween.getValue(), 0), 1);
			},
			onComplete: () => {
				this.blocked = false;
			}
		});
	}
	
	onClick() {
		return (pointer) => {
			if (this.blocked || globalBlocked) {
				return;
			}
			this.flip(true);
			if (!openedCard) {
				openedCard = this;
			}
			else {
				if (openedCard.num !== this.num) {
					globalBlocked = true;
					setTimeout(() => {
						openedCard.flip(false);
						this.flip(false);
						globalBlocked = false;
						openedCard = null;
					}, 1000);
				}
				else {
					openedCard = null;
					completed++;
					if (completed == 8) {
						completed = 0;
						restart();
					}
				}
			}
		}
	}
}

function preload () {
	this.load.image('title', 'img/title.png');
	this.load.image('logo', 'img/logo.png');
	this.load.image('cover', 'img/cover.jpg');
	for (let i = 1; i <= 8; i++) {
		this.load.image(`card${i}`, `img/card${i}.jpg`);
	}
	game = this;
}

function create () {
	
	this.add.image(config.width / 2, 0, 'title').setOrigin(0.5, 0);

	const card_srites = new Array(8).fill(0);
	for (r = 0; r < 4; r++) {
		for (c = 0; c < 4; c++) {
			var cardX = IMG_PADDING + c * (IMG_SIZE + IMG_PADDING) + IMG_SIZE / 2;
			var cardY = MARGIN + IMG_PADDING + r * (IMG_SIZE + IMG_PADDING) + IMG_SIZE / 2;
			let num;
			do {
				num = Phaser.Math.Between(1, card_srites.length);
			} while (card_srites[num - 1] == 2);
			card_srites[num - 1]++;
			cards.push(new Card(num, cardX, cardY));
		}
	}

	const button = this.add.image(config.width / 2, config.height - MARGIN + 64, 'logo').setOrigin(0.5, 0).setInteractive();
	button.on('pointerup', () => {
		const url = 'https://instagram.com/brizz_art';
		const s = window.open(url, '_blank');
		if (s && s.focus) {
			s.focus();
		}
		else if (!s) {
			window.location.href = url;
		}
	});
}

function update () {
}

function restart() {
	globalBlocked = true;
	setTimeout(() => {
		let array = [];
		for (var i = 0; i < 16; i++) {
			array.push(i);
		}
		const interval = setInterval(() => {
			const idx = Phaser.Math.Between(0, array.length - 1);
			cards[array[idx]].flip(false);
			array.splice(idx, 1);
			if (array.length == 0) {
				clearInterval(interval);
				setTimeout(() => {
					shuffle();
					globalBlocked = false;
				}, 400);
			}
		}, 100);
	}, 1000);
}

function shuffle() {
	function swap(sprite1, sprite2) {
		let tmp = { x: sprite1.x, y: sprite1.y };
		sprite1.setPosition(sprite2.x, sprite2.y);
		sprite2.setPosition(tmp.x, tmp.y);
	}
	for (let i = 0; i < 16; i++) {
		const rnd = Phaser.Math.Between(0, 15);
		swap(cards[i].face, cards[rnd].face);
		swap(cards[i].cover, cards[rnd].cover);
	}
}