var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS);

var mainState = {

    preload: function() {
        game.load.image('bgcity', 'img/bg/city.gif');
        game.load.spritesheet('player', 'img/player.gif', 50, 50, 11);
        game.load.spritesheet('demon', 'img/demon.gif', 50, 50, 4);
        game.load.spritesheet('bullet', 'img/bullet.gif', 9, 6, 2);
        game.load.tilemap('map', 'maps/1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('level', 'img/tilemap.png');
        game.time.advancedTiming = true;
        // game.stage.backgroundColor = 0xff00ff;
    },
    create: function () {
        // World
        game.physics.startSystem(Phaser.Physics.ARCADE);
        bg = game.add.tileSprite(0, 0, game.width, game.height, 'bgcity');
        bg.fixedToCamera = true;
        this.map = game.add.tilemap('map');
        this.map.addTilesetImage('level');
        this.layer = this.map.createLayer('Tile Layer 1');
        this.map.setCollisionBetween(0, 1000);
        this.layer.resizeWorld();

        game.physics.arcade.gravity.y = 1000;
        // this.layer.debug = true;
        this.Player = this.map.objects.Player[0];
        this.Demons = this.map.objects.Demons;


        // Player
        this.p1 = this.game.add.sprite(this.map.objects.Player[0].x, this.map.objects.Player[0].y, 'player');
        game.physics.arcade.enable(this.p1);
        game.camera.follow(this.p1, Phaser.Camera.FOLLOW_PLATFORMER);
        this.p1.body.setSize(25,50,0,0);
        this.p1.body.maxVelocity.setTo(200,9999);
        this.p1.body.drag.setTo(1000,-100);
        this.p1.anchor.setTo(0.5, 0.5);
        // this.p1.body.collideWorldBounds = true;

        // Demons
        this.demons = game.add.group();
        this.map.createFromObjects('Demons', 1, 'demon', 0, true, false, this.demons);
        this.demons.enableBody = true;
        this.demons.physicsBodyType = Phaser.Physics.ARCADE;
        this.demons.setAll('outOfBoundsKill', true);
        this.demons.setAll('checkWorldBounds', true);
        this.demons.callAll('animations.add', 'animations', 'demonwalk', [0, 1, 2, 3], 3, true);
        game.physics.arcade.enable(this.demons);
        this.demons.forEach(function (demon) {
            demon.body.setSize(25,50, 0, 0);
            demon.anchor.x = 0.5;
        }, this, true);

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
        this.bullets.setAll('body.gravity.y', -1000);

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
        game.physics.arcade.collide(this.demons, this.layer);
        game.physics.arcade.overlap(this.bullets, this.layer, this.bulletHitLayer, null, this);
        game.physics.arcade.overlap(this.bullets, this.demons, this.bulletHitDemon, null, this);


        this.move();
        this.demons.forEach(this.moveDemons, this, true);
    },
    render: function () {
        // this.game.debug.body(this.p1);
        // this.demons.forEach(function (demon) {
        //     this.game.debug.body(demon);
        // }, this, true);
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
    moveDemons: function (demon) {
        var stopDistance = 30;
        var viewDistance = 500;
        if (this.p1.position.x < demon.position.x) {
            // Player is left of demon
            if ((demon.position.x - this.p1.position.x) < viewDistance) {
                if ((demon.position.x - this.p1.position.x) > stopDistance) demon.body.velocity.x = -20;
                else demon.body.velocity.x = 0;
                demon.scale.x = 1;
            } else demon.body.velocity.x = 0;

        } else {
            // Player is right of demon
            if ((this.p1.position.x - demon.position.x) < viewDistance) {
                if ((this.p1.position.x - demon.position.x) > stopDistance) demon.body.velocity.x = 20;
                else demon.body.velocity.x = 0;
                demon.scale.x = -1;
            } else demon.body.velocity.x = 0;

        }
        if (demon.body.velocity.x !== 0) demon.play('demonwalk');
        else demon.frame = 0;
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
        } else if (this.facingLeft) {
            bullet.anchor.x = 1;
            vel = -500;
        } else {

        }
        bullet.reset(this.p1.x, this.p1.y);
        bullet.body.velocity.x = this.p1.body.velocity.x + vel;
        bullet.frame = 0;
    },
    bulletHitLayer: function (bullet, layer) {
        bullet.frame = 1;
        bullet.body.velocity.x = 0;
        setTimeout(function () {
            bullet.kill();
        }, 50);
    },
    bulletHitDemon: function (bullet, demon) {
        bullet.frame = 1;
        bullet.body.velocity.x = 0;
        setTimeout(function () {
            bullet.kill();
        }, 50);
        demon.body.velocity.x = 10;
    },
};

game.state.add('main', mainState);
game.state.start('main');
