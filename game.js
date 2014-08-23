var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO);

var mainState = {

    preload: function() {
        game.stage.backgroundColor = 0x4488cc;
        game.load.spritesheet('player', 'img/player.gif', 50, 50, 11);
        game.load.tilemap('map', 'maps/1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('level', 'img/tilemap.png');
    },
    create: function() {
        // World
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.map = game.add.tilemap('map');
        this.map.addTilesetImage('level');
        this.layer = this.map.createLayer('Tile Layer 1');
        this.map.setCollisionBetween(0, 100);
        this.layer.resizeWorld();
        // layer.debug = true;

        // Player
        this.p1 = this.game.add.sprite(64/2, this.game.world.height-64, 'player');
        game.physics.arcade.enable(this.p1);
        game.camera.follow(this.p1, Phaser.Camera.FOLLOW_PLATFORMER);
        this.p1.body.setSize(25,50,0,0);
        this.p1.body.gravity.y = 1000;
        this.p1.body.maxVelocity.setTo(200,9999);
        this.p1.body.drag.setTo(1000,-100);
        this.p1.body.collideWorldBounds = true;
        this.p1.anchor.setTo(0.5, 0.5);

        // Controls
        this.cursor = this.game.input.keyboard.createCursorKeys();
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.cursor.up.onDown.add(this.jump, this);

        // Animations
        this.p1.animations.add('walk',[1,2,3,4,5,6,7,8]);
        this.p1.animations.add('jump',[9]);
        this.p1.animations.add('crouch',[10]);

        // Globals
        this.maxJumps = 2;
        this.jumps = 0;
    },
    update: function() {
        this.physics.arcade.collide(this.p1, this.layer);
        this.move();
        this.game.debug.body(this.p1);
    },
    render: function () {

    },

    // In Game Functions
    move: function () {
        var animation = 'walk';
        var drag = 1000;
        var stillFrame = 0;
        var width = 25;
        var height = 50;
        var yoffset = 0;
        var xoffset = 0;
        var acceleration = 500;
        var jumps = 0;
        var maxJumps = 2;
        var onTheGround = this.p1.body.onFloor();

        if (!onTheGround) {
            animation = 'jump';
            stillFrame = 9;
            drag = 0;
        } else {
            this.jumps = 0;
        }
        if (this.cursor.down.isDown) {
            acceleration = 0;
            animation = 'crouch';
            stillFrame = 10;
            height = 38;
            yoffset = 6;
        }

        this.p1.body.drag.setTo(drag, 0);
        this.p1.body.setSize(width,height,xoffset,yoffset);

        if (this.cursor.right.isDown) {
            this.p1.scale.x = 1;
            this.p1.play(animation, 14, true);
            this.p1.body.acceleration.x = acceleration;
        }
        else if (this.cursor.left.isDown) {
            this.p1.scale.x = -1;
            this.p1.play(animation, 14, true);
            this.p1.body.acceleration.x = -acceleration;
        }
        else {
             this.p1.body.acceleration.x = 0;
             this.p1.frame = stillFrame;
         }
    },
    jump: function() {
        if (this.jumps < this.maxJumps) {
            this.p1.body.velocity.y = -350;
            this.jumps++;
        }
    },
};

game.state.add('main', mainState);
game.state.start('main');
