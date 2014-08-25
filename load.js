boot = {
    preload: function () {
        this.game.load.image('loading', 'img/loader.gif');
    },
    create: function () {
        this.game.state.start('load');
    }
};

load = {
    preload: function () {
        bar = this.game.add.sprite(this.game.width/2 - 150, this.game.height/2, 'loading');
        this.game.load.setPreloadSprite(bar);

        this.game.load.image('bgcity', 'img/bg/city.gif');
        this.game.load.image('level', 'img/tilemap.png');
        this.game.load.spritesheet('player', 'img/player.gif', 50, 50, 11);
        this.game.load.spritesheet('demon', 'img/demon.gif', 50, 50, 11);
        this.game.load.spritesheet('bullet', 'img/bullet.gif', 9, 6, 2);
        this.game.load.spritesheet('fireball', 'img/fireball.gif', 25, 25, 7);
        this.game.load.spritesheet('portal', 'img/portal.gif', 90, 49, 5);
        this.game.load.tilemap('level1', 'maps/1.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tilemap('level2', 'maps/2.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.time.advancedTiming = true;
    },
    create: function () {
        this.game.levels = {};
        for (var level in this.game.cache._tilemaps) {
            this.game.levels[level] = false;
        }
        this.game.levels.level1 = true;
        this.game.state.start('menu');
    }
};
