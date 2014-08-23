var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS);

var mainState = {

    preload: function() {
        game.time.advancedTiming = true;
        game.stage.backgroundColor = 0x4488cc;
        game.load.spritesheet('player', 'img/player.gif', 50, 50, 11);
        game.load.spritesheet('bullet', 'img/bullet.gif', 9, 6, 2);
        game.load.tilemap('map', 'maps/1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('level', 'img/tilemap.png');
    },
    create: function () {
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
        this.p1.anchor.setTo(0.5, 0.5);
        // this.p1.body.collideWorldBounds = true;

        // Bullets
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet', 0, false);
        this.bullets.setAll('anchor.x', -1);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('body.velocity.x', 100);

        // Controls
        this.cursor = this.game.input.keyboard.createCursorKeys();
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.cursor.up.onDown.add(this.jump, this);
        this.spaceKey.onDown.add(this.shoot, this);

        // Animations
        this.p1.animations.add('walk',[1,2,3,4,5,6,7,8]);
        this.p1.animations.add('jump',[9]);
        this.p1.animations.add('crouch',[10]);

        // Globals
        this.maxJumps = 2;
        this.jumps = 0;
        this.facingLeft = false;
        this.facingRight = true;
    },
    update: function () {
        this.physics.arcade.collide(this.p1, this.layer);
        game.physics.arcade.overlap(this.bullets, this.layer, this.bulletHitLayer, null, this);
        this.move();
    },
    render: function () {
        // this.game.debug.body(this.p1);
        // game.debug.text(game.time.fps +' fps' || '--', 2, 14, "#00ff00");

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
            animation = 'crouch';
            stillFrame = 10;
            height = 32;
            yoffset = 0;
            if (onTheGround) drag = 100, acceleration = 0;
        }

        this.p1.body.drag.setTo(drag, 0);
        this.p1.body.setSize(width,height,xoffset,yoffset);

        if (this.cursor.right.isDown) {
            this.facingRight = true;
            this.facingLeft = false;
            this.p1.scale.x = 1;
            this.p1.play(animation, 14, true);
            this.p1.body.acceleration.x = acceleration;
        }
        else if (this.cursor.left.isDown) {
            this.facingLeft = true;
            this.facingRight = false;
            this.p1.scale.x = -1;
            this.p1.play(animation, 14, true);
            this.p1.body.acceleration.x = -acceleration;
        }
        else {
             this.p1.body.acceleration.x = 0;
             this.p1.frame = stillFrame;
         }
    },
    jump: function () {
        if (this.jumps < this.maxJumps) {
            this.p1.body.velocity.y = -350;
            this.jumps++;
        }
    },
    shoot: function () {
        var vel = 500;
        var bullet = this.bullets.getFirstExists(false);
        if (this.facingRight) {
            bullet.anchor.x = -1;
            // bullet.scale.x = 1;
        } else if (this.facingLeft) {
            bullet.anchor.x = 1;
            // bullet.scale.x = -1;
            vel = -500;
        } else {

        }
        bullet.reset(this.p1.x, this.p1.y);
        bullet.body.velocity.x = this.p1.body.velocity.x + vel;
        bullet.frame = 0;
    },
    bulletHitLayer: function (bullet, layer) {
        bullet.frame = 1;
        setTimeout(function () {
            bullet.kill();
        }, 50)
    },
};

game.state.add('main', mainState);
game.state.start('main');
