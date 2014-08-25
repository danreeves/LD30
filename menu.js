

menu = {
    create: function () {
        var i = 0;
        console.log('Menu ', this.game.levels);
        for (var level in this.game.levels) {
            i += 40;
            if (this.game.levels[level] === true) {
                var text = this.game.add.text(40, i, level, {fill: '#fff'});
                text.inputEnabled = true;
                text.events.onInputDown.add(this.select, this);
            }
        }
    },
    select: function (item) {
        if (this.game.levels[item._text] === true) {
            this.game.currentLevel = item._text;
            this.game.state.start('main');
        }
    }
};
