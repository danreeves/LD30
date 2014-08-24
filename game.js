var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS);

var mainState = {

    preload: function() {
        game.load.image('bgcity', 'img/bg/city.gif');
        game.load.spritesheet('player', 'img/player.gif', 50, 50, 11);
        game.load.spritesheet('demon', 'img/demon.gif', 50, 50, 11);
        game.load.spritesheet('bullet', 'img/bullet.gif', 9, 6, 2);
        game.load.spritesheet('fireball', 'img/fireball.gif', 25, 25, 7);
        game.load.tilemap('map', 'maps/1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('level', 'img/tilemap.png');
        game.time.advancedTiming = true;
        // game.stage.backgroundColor = 0xff00ff;
    },
    create: function () {
        // World
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 1000;
        game.stage.smoothed = false;
        bg = game.add.tileSprite(0, 0, game.width, game.height, 'bgcity');
        bg.fixedToCamera = true;
        this.map = game.add.tilemap('map');
        this.map.addTilesetImage('level');
        this.layer3 = this.map.createLayer('Non-collidable Layer 1');
        this.layer2 = this.map.createLayer('Non-collidable Layer 2');
        this.layer1 = this.map.createLayer('Collidable Layer');
        this.map.setCollisionByExclusion([0], true, 'Collidable Layer', true);
        this.layer1.resizeWorld();

        // this.layer1.debug = true;
        this.Player = this.map.objects.Player[0];
        this.Demons = this.map.objects.Demons;


        // Player
        this.p1 = this.game.add.sprite(this.map.objects.Player[0].x, this.map.objects.Player[0].y, 'player');
        game.camera.follow(this.p1, Phaser.Camera.FOLLOW_PLATFORMER);
        game.physics.arcade.enable(this.p1);
        this.p1.body.setSize(25,50,0,0);
        this.p1.body.maxVelocity.setTo(200,9999);
        this.p1.body.drag.setTo(1000,-100);
        this.p1.body.velocity.y = 10;
        this.p1.anchor.setTo(0.5, 0.5);
        this.p1.outOfBoundsKill = true;
        this.p1.checkWorldBounds = true;
        this.p1.health = 10;
        this.p1.body.collideWorldBounds = true;
        this.p1.events.onKilled.add(function () {
            console.log("GAME OVER");
        }, this);

        // Demons
        this.demons = game.add.group();
        this.map.createFromObjects('Demons', 1, 'demon', 0, true, false, this.demons);
        this.demons.enableBody = true;
        this.demons.physicsBodyType = Phaser.Physics.ARCADE;
        game.physics.arcade.enable(this.demons);
        this.demons.setAll('anchor.x', 0.5, false, false, 0, true);
        this.demons.setAll('lastShot', game.time.now, false, false, 0, true);
        this.demons.setAll('health', 10);
        this.demons.forEach(function (demon) {
            demon.body.setSize(25,45, 0, 5);
            demon.body.velocity.y = 10;
            demon.events.onKilled.add(function () {
                var dead = this.game.add.sprite(demon.x, demon.y, 'demon');
                var die = dead.animations.add('die',[7, 8, 9, 10]);
                die.killOnComplete = true;
                dead.play('die', 3);
            }, this);
        }, this, true);

        // Bullets
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet', 0, false);
        this.bullets.setAll('anchor.x', -1);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('body.velocity.x', 100);
        this.bullets.setAll('body.gravity.y', -1000);
        this.bullets.setAll('hasCollided', false, false, false, 0, true);

        // Fireballs
        this.fireballs = game.add.group();
        this.fireballs.enableBody = true;
        this.fireballs.physicsBodyType = Phaser.Physics.ARCADE;
        this.fireballs.createMultiple(30, 'fireball', 0, false);
        this.fireballs.setAll('anchor.x', 0.5);
        this.fireballs.setAll('anchor.y', 0.5);
        this.fireballs.setAll('body.velocity.x', 100);
        this.fireballs.setAll('body.gravity.y', -1000);
        this.fireballs.setAll('hasCollided', false, false, false, 0, true);

        // Controls
        this.cursor = this.game.input.keyboard.createCursorKeys();
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.cursor.up.onDown.add(this.jump, this);
        this.spaceKey.onDown.add(this.shoot, this);

        // Animations
        this.p1.animations.add('walk',[1,2,3,4,5,6,7,8]);
        this.p1.animations.add('jump',[9]);
        this.p1.animations.add('crouch',[10]);

        this.fireballs.callAll('animations.add', 'animations', 'fireball.fly', [0, 1, 2, 3], 4, true);
        this.fireballs.callAll('animations.add', 'animations', 'fireball.hit', [5, 6, 7], 12, true);

        this.demons.callAll('animations.add', 'animations', 'demon.walk', [0, 1, 2, 3], 3, true);
        this.demons.callAll('animations.add', 'animations', 'demon.attack', [6, 5, 4], 3, false);
        this.demons.callAll('animations.add', 'animations', 'demon.die', [7, 8, 9, 10], 3, true);

        // Globals
        this.maxJumps = 2;
        this.jumps = 0;
        this.facingLeft = false;
        this.facingRight = true;

        // Front layer
        this.map2 = game.add.tilemap('map');
        this.map2.addTilesetImage('level');
        this.layer4 = this.map2.createLayer('Non-collidable Layer 3');
    },
    update: function () {
        this.physics.arcade.collide(this.p1, this.layer1);
        this.physics.arcade.collide(this.demons, this.layer1);
        this.physics.arcade.overlap(this.bullets, this.layer1, this.bulletHitLayer, null, this);
        this.physics.arcade.overlap(this.bullets, this.demons, this.bulletHitDemon, null, this);
        this.physics.arcade.overlap(this.fireballs, this.layer1, this.fireballHitLayer, null, this);
        this.physics.arcade.overlap(this.fireballs, this.p1, this.fireballHitPlayer, null, this);

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
        if (demon.alive === false) return;
        var stopDistance = 500;
        var viewDistance = game.width/2 + 100;
        // var viewDistance = 500;
        var shootingRange = false;
        var left;

        if (this.p1.position.x < demon.position.x) {
            // Player is left of demon
            left = true;
            shootingRange = ((demon.position.x - this.p1.position.x) < stopDistance);
            if ((demon.position.x - this.p1.position.x) < viewDistance) {
                if (!shootingRange) {
                    demon.body.velocity.x = -20;
                }
                else {
                    demon.body.velocity.x = 0;
                }
                demon.scale.x = 1;
            } else demon.body.velocity.x = 0;

        } else {
            // Player is right of demon
            left = false;
            shootingRange = ((this.p1.position.x - demon.position.x) < stopDistance);
            if ((this.p1.position.x - demon.position.x) < viewDistance) {
                if (!shootingRange) {
                    demon.body.velocity.x = 20;
                }
                else {
                    demon.body.velocity.x = 0;
                }
                demon.scale.x = -1;
            } else demon.body.velocity.x = 0;

        }
        if (demon.body.velocity.x !== 0) demon.play('demon.walk');
        else if (shootingRange) {
            if (game.time.now - demon.lastShot > 2000) {
                this.demonAttack(demon, left);
                demon.play('demon.attack');
            }
        }
        else demon.frame = 0;
    },
    demonAttack: function (demon, left) {
        demon.lastShot = game.time.now;
        var vel = 250;
        var fireball = this.fireballs.getFirstExists(false);
        fireball.hasCollided = false;
        if (!left) {
            fireball.scale.x = 1;
        } else if (left) {
            fireball.scale.x = -1;
            vel = -250;
        }
        fireball.reset(demon.x, demon.y+demon.body.height/4*3);
        fireball.body.velocity.x = vel;
        fireball.play('fireball.fly');
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
        bullet.lifespan = 1000;
        bullet.hasCollided = false;
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
        if (bullet.hasCollided) return;
        bullet.hasCollided = true;
        bullet.frame = 1;
        bullet.body.velocity.x = 0;
        setTimeout(function () {
            bullet.kill();
        }, 50);
    },
    bulletHitDemon: function (bullet, demon) {
        if (bullet.hasCollided) return;
        bullet.hasCollided = true;
        demon.damage(1);
        bullet.frame = 1;
        bullet.body.velocity.x = 0;
        setTimeout(function () {
            bullet.kill();
        }, 50);
    },
    fireballHitLayer: function (fireball, layer) {
        if (fireball.hasCollided) return;
        fireball.hasCollided = true;
        fireball.play('fireball.hit');
        fireball.body.velocity.x = 0;
        setTimeout(function () {
            fireball.kill();
        }, 200);
    },
    fireballHitPlayer: function (player, fireball) {
        if (fireball.hasCollided) return;
        fireball.hasCollided = true;
        fireball.play('fireball.hit');
        fireball.body.velocity.x = 0;
        setTimeout(function () {
            fireball.kill();
        }, 200);
        player.damage(1);
        console.log(player.health);
    },
};

game.state.add('main', mainState);
game.state.start('main');
