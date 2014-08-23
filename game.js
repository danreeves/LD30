var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO);

var mainState = {

    preload: function() {
        game.stage.backgroundColor = 0x4488cc;
        game.load.spritesheet('player', 'img/player.gif', 50, 50, 9);
    },
    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.p1 = this.game.add.sprite(100, 245, 'player');
        game.physics.arcade.enable(this.p1);
        this.p1.body.gravity.y = 1000;
        this.cursor = this.game.input.keyboard.createCursorKeys();
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.cursor.up.onDown.add(this.jump, this);
        this.p1.body.collideWorldBounds = true;
        game.camera.follow(this.p1, Phaser.Camera.FOLLOW_PLATFORMER);
        this.p1.anchor.setTo(0.5, 0.5);
        this.p1.animations.add('walk',[1,2,3,4,5,6,7,8,9]);

    },
    update: function() {
        this.move();
    },

    // In Game Functions
    move: function () {
        if (this.cursor.right.isDown) {

            this.p1.scale.x = 1;
            this.p1.play('walk', 14, true);

        }
        else if (this.cursor.left.isDown) {

            this.p1.scale.x = -1;
            this.p1.play('walk', 14, true);
        }
        else {
             this.p1.body.acceleration.x = 0;
             this.p1.frame = 0;
         }
    },
    jump: function() {
        this.p1.body.velocity.y = -350;
    },
};

game.state.add('main', mainState);
game.state.start('main');
