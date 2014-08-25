var lol = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS);

lol.state.add('boot', boot);
lol.state.add('load', load);
lol.state.add('menu', menu);
lol.state.add('main', main);
lol.state.start('boot');
