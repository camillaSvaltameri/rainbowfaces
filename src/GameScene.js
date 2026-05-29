class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('red_body', 'assets/red_body_circle.png');
        this.load.image('yellow_body', 'assets/yellow_body_circle.png');
        this.load.image('green_body', 'assets/green_body_circle.png');
        this.load.image('blue_body', 'assets/blue_body_circle.png');
        this.load.image('pink_body', 'assets/pink_body_circle.png');
        this.load.image('purple_body', 'assets/purple_body_circle.png');

        this.load.image('face_smile', 'assets/face_smile_open_eye.png');
        this.load.image('face_frown', 'assets/face_frown_open_eye.png');
        this.load.image('face_grimace', 'assets/face_grimace_open_eye.png');
    }

    create() {
        this.RAINBOW = ['purple', 'blue', 'green', 'yellow', 'pink', 'red'];
        this.COLORS = ['red', 'yellow', 'green', 'blue', 'pink', 'purple'];
        this.slots = [];
        this.moves = 0;
        this.won = false;

        this.add.text(400, 35, 'Rainbow Faces', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 75, 'Click a face to change its color. Arrange them in rainbow order!', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#666'
        }).setOrigin(0.5);

        this.add.text(400, 100, 'Purple  \u2192  Blue  \u2192  Green  \u2192  Yellow  \u2192  Pink  \u2192  Red', {
            fontSize: '13px',
            fontFamily: 'Arial',
            color: '#999'
        }).setOrigin(0.5);

        this.add.text(400, 130, 'Smile = correct    Grimace = close    Frown = wrong', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#aaa'
        }).setOrigin(0.5);

        const startX = 115;
        const spacing = 120;
        const y = 310;

        for (let i = 0; i < this.RAINBOW.length; i++) {
            const x = startX + i * spacing;

            const targetLabel = this.add.text(x, y + 90, this.RAINBOW[i], {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#bbb'
            }).setOrigin(0.5);

            const body = this.add.image(x, y, '').setInteractive();
            const face = this.add.image(x, y, '').setInteractive();

            const slot = { index: i, currentColor: '', body, face, x, y, targetLabel };
            this.slots.push(slot);

            const clickHandler = () => this.handleClick(slot);
            body.on('pointerdown', clickHandler);
            face.on('pointerdown', clickHandler);

            const overHandler = () => {
                if (!this.won) this.tweens.add({ targets: [body, face], scaleX: 1.1, scaleY: 1.1, duration: 100 });
            };
            const outHandler = () => {
                this.tweens.add({ targets: [body, face], scaleX: 1, scaleY: 1, duration: 100 });
            };
            body.on('pointerover', overHandler);
            body.on('pointerout', outHandler);
            face.on('pointerover', overHandler);
            face.on('pointerout', outHandler);
        }

        this.movesText = this.add.text(400, 530, 'Moves: 0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#333'
        }).setOrigin(0.5);

        this.winText = this.add.text(400, 490, '', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#ff6600',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const resetBtn = this.add.text(710, 560, 'Reset', {
            fontSize: '15px',
            fontFamily: 'Arial',
            color: '#0066cc',
            backgroundColor: '#e8e8e8',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        resetBtn.on('pointerdown', () => this.resetGame());
        resetBtn.on('pointerover', () => resetBtn.setStyle({ color: '#004499', backgroundColor: '#d0d0d0' }));
        resetBtn.on('pointerout', () => resetBtn.setStyle({ color: '#0066cc', backgroundColor: '#e8e8e8' }));

        this.randomizeSlots();
    }

    randomizeSlots() {
        let colors;
        do {
            colors = this.slots.map(() => Phaser.Utils.Array.GetRandom(this.COLORS));
        } while (colors.every((c, i) => c === this.RAINBOW[i]));

        this.slots.forEach((slot, i) => {
            slot.currentColor = colors[i];
            slot.body.setTexture(colors[i] + '_body');
            slot.face.setTexture(this.getExpression(colors[i], i));
        });
    }

    getExpression(color, targetIndex) {
        if (color === this.RAINBOW[targetIndex]) return 'face_smile';
        const colorPos = this.RAINBOW.indexOf(color);
        if (Math.abs(colorPos - targetIndex) === 1) return 'face_grimace';
        return 'face_frown';
    }

    handleClick(slot) {
        if (this.won) return;

        let newColor;
        do {
            newColor = Phaser.Utils.Array.GetRandom(this.COLORS);
        } while (newColor === slot.currentColor);

        slot.currentColor = newColor;
        slot.body.setTexture(newColor + '_body');
        slot.face.setTexture(this.getExpression(newColor, slot.index));

        this.tweens.add({
            targets: [slot.body, slot.face],
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 80,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });

        this.moves++;
        this.movesText.setText('Moves: ' + this.moves);

        this.checkWin();
    }

    checkWin() {
        if (!this.slots.every(s => s.currentColor === this.RAINBOW[s.index])) return;

        this.won = true;
        this.winText.setText('All Smiling! You did it in ' + this.moves + ' moves!');

        this.slots.forEach((slot, i) => {
            this.tweens.add({
                targets: [slot.body, slot.face],
                y: slot.y - 25,
                duration: 250,
                delay: i * 80,
                yoyo: true,
                repeat: 3,
                ease: 'Sine.easeInOut'
            });
        });

        this.createConfetti();
    }

    createConfetti() {
        const confettiColors = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0066ff, 0x8800ff];
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(50, 750);
            const color = Phaser.Utils.Array.GetRandom(confettiColors);
            const particle = this.add.rectangle(x, -20, 8, 8, color);

            this.tweens.add({
                targets: particle,
                y: 650,
                x: x + Phaser.Math.Between(-80, 80),
                angle: Phaser.Math.Between(0, 720),
                duration: Phaser.Math.Between(1500, 3000),
                delay: Phaser.Math.Between(0, 800),
                ease: 'Cubic.easeIn',
                onComplete: () => particle.destroy()
            });
        }
    }

    resetGame() {
        this.moves = 0;
        this.won = false;
        this.movesText.setText('Moves: 0');
        this.winText.setText('');

        this.slots.forEach(slot => {
            slot.body.setScale(1);
            slot.face.setScale(1);
            slot.body.y = slot.y;
            slot.face.y = slot.y;
            this.tweens.killTweensOf([slot.body, slot.face]);
        });

        this.randomizeSlots();
    }
}
