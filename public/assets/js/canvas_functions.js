/**
 * Created by sascha on 21-11-16.
 */
(function () {
    var ctx = document.getElementById("ctx").getContext("2d");
    ctx.fillText('Click to start a new game', 200, 250);
    ctx.font = '25px Arial';
    ctx.fillStyle = '#e1002d';

    var HEIGHT = 523;
    var WIDTH = 788;
    var isPaused = false;
    var timeWhenGameStarted = Date.now();	//return time in ms

    var frameCount = 0;

    var score = 0;
    var player;
    var enemy;
    var docent;
    var timer = 0;

    var versnelling = -4;
    var modulesDocent = 150;
    var modulesEnemy = 130;

    var uploadUserScore = true;

    var sources = {
        player: '/assets/images/player_sprite.png',
        enemy1: '/assets/images/php1.png',
        enemy2: '/assets/images/php2.png',
        enemy3: '/assets/images/php3.png',
        docent1: '/assets/images/javascript1.png',
        docent2: '/assets/images/javascript2.png',
        docent3: '/assets/images/javascript3.png',
        hearth: '/assets/images/hearth.png'
    };

    var images = {};
    var preLoad = function () {
        for (var img in sources) {
            if (!images[img]) {
                images[img] = new Image();
                images[img].src = sources[img];
            }
        }
    };

    var shift = 0;
    var frameWidth = 44;
    var frameHeight = 50;
    var totalFrames = 7;
    var currentFrame = 0;
    var fps = 20;

    var animate = function () {
        if (currentFrame === totalFrames) {
            shift = 0;
            currentFrame = 0;
        }

        currentFrame++;
        shift += frameWidth;
    };

    var parseImg = function (ctx, a) {
        var img = images[a.img];

            if (images['player'] === img) {
                ctx.clearRect(a.x, a.y, frameWidth, frameHeight);
                ctx.drawImage(img, shift, 0, frameWidth, frameHeight, a.x, a.y, frameWidth, frameHeight);
            }
        else {
            ctx.drawImage(img, a.x, a.y, img.width, img.height);
        }
    };

    var parseHearth = function (ctx, x, y) {
        var img = images['hearth'];
        ctx.drawImage(img, x, y, 45, 38);
    };


    Entity = function (type, id, x, y, spdX, spdY, width, height, color, img) {
        var self = {
            type: type,
            x: x,
            spdX: spdX,
            y: y,
            spdY: spdY,
            width: width,
            height: height,
            color: color,
            img: img
        };
        self.update = function () {
            self.updatePosition();
            self.draw();
        };
        self.updatePosition = function () {
            if (self.type === 'player') {
                if (self.pressingDown) {
                    self.y += 106;
                    self.pressingDown = false;
                }

                if (self.pressingUp) {
                    self.y -= 106;
                    self.pressingUp = false;
                }

                if (self.y < 120) {
                    self.y = 120;
                }
                if (self.y > HEIGHT - 60 - self.height / 2) {
                    self.y = HEIGHT - 60 - self.height / 2;
                }

            } else {
                self.x += self.spdX;
                self.y += self.spdY;

                if (self.x < 0 || self.x > WIDTH) {
                    self.spdX = -self.spdX;
                }
                if (self.y < 0 || self.y > HEIGHT) {
                    self.spdY = -self.spdY;
                }
            }
        };
        self.getDistance = function (entity2) {	//return distance (number)
            var vx = self.x - entity2.x;
            var vy = self.y - entity2.y;
            return Math.sqrt(vx * vx + vy * vy);
        };
        self.testCollision = function (entity2) {	//return if colliding (true/false)
            if (typeof entity2 === "undefined") {
                return;
            }

            var rect1 = {
                x: self.x - self.width / 2,
                y: self.y - self.height / 2,
                width: self.width,
                height: self.height
            };
            var rect2 = {
                x: entity2.x - entity2.width / 2,
                y: entity2.y - entity2.height / 2,
                width: entity2.width,
                height: entity2.height
            };
            return testCollisionRectRect(rect1, rect2);
        };
        self.draw = function () {
            ctx.save();

            parseImg(ctx, self);

            ctx.restore();
        };
        return self;
    };

    Actor = function (type, id, x, y, spdX, spdY, width, height, color, img) {
        var self = Entity(type, id, x, y, spdX, spdY, width, height, color, img);
        return self;
    };

    Player = function () {
        var p = Actor('player', 'myId', 50, 120, 102, 5, 50, 50, 'green', 'player');
        p.pressingDown = false;
        p.pressingUp = false;
        return p;
    };

    var enemyList = {};

    Enemy = function (id, x, y, spdX, spdY, width, height) {
        var self = Actor('enemy', id, x, y, spdX, spdY, width, height, 'red', 'enemy' + (Math.floor(Math.random() * 3) + 1));


        enemyList[id] = self;
    };

    randomlyGenerateEnemy = function () {
        //Math.random() returns a number between 0 and 1
        var randomY = Array(120, 226, 332, 438);
        var x = WIDTH - 25;
        var y = randomY[Math.floor(Math.random() * randomY.length)];
        var height = 10 + Math.random() * 30;	//between 10 and 40
        var width = 10 + Math.random() * 30;
        var id = Math.random();
        var spdX = versnelling;
        var spdY = 0;
        Enemy(id, x, y, spdX, spdY, width, height);

    };

    var docentList = {};

    Docent = function (id, x, y, spdX, spdY, width, height) {
        var self = Actor('docent', id, x, y, spdX, spdY, width, height, 'green', "docent" + (Math.floor(Math.random() * 3) + 1));
        docentList[id] = self;
    };

    randomlyGenerateDocent = function () {
        //Math.random() returns a number between 0 and 1
        var randomY = Array(120, 226, 332, 438);
        var x = WIDTH - 25;
        var y = randomY[Math.floor(Math.random() * randomY.length)];
        var height = 10 + Math.random() * 30;	//between 10 and 40
        var width = 10 + Math.random() * 30;
        var id = Math.random();
        var spdX = versnelling;
        var spdY = 0;
        Docent(id, x, y, spdX, spdY, width, height);
    };

    var hearthList = {};

    hearth = function (id, x, y, spdX, spdY, width, height) {
        var self = Actor('hearth', id, x, y, spdX, spdY, width, height, 'green', "hearth");
        hearthList[id] = self;
    };

    randomlyGenerateHearth = function () {
        //Math.random() returns a number between 0 and 1
        var randomY = Array(120, 226, 332, 438);
        var x = WIDTH - 25;
        var y = randomY[Math.floor(Math.random() * randomY.length)];
        var height = 10 + Math.random() * 30;	//between 10 and 40
        var width = 10 + Math.random() * 30;
        var id = Math.random();
        var spdX = versnelling;
        var spdY = 0;
        hearth(id, x, y, spdX, spdY, width, height);
    };

    testCollisionRectRect = function (rect1, rect2) {
        return rect1.x <= rect2.x + rect2.width
            && rect2.x <= rect1.x + rect1.width
            && rect1.y <= rect2.y + rect2.height
            && rect2.y <= rect1.y + rect1.height;
    };

    var playerHP = function () {
        for (var i = 0; i < player.hp; i++) {
            parseHearth(ctx, 600 + (45 * i), 25);
        }
    };

    document.oncontextmenu = function (mouse) {
        mouse.preventDefault();
    };


    document.onkeydown = function (event) {
        if (event.keyCode === 83)	//s
            player.pressingDown = true;
        else if (event.keyCode === 87) // w
            player.pressingUp = true;
    };

    document.onkeyup = function (event) {
        if (event.keyCode === 83)	//s
            player.pressingDown = false;
        else if (event.keyCode === 87) // w
            player.pressingUp = false;
    };

    update = function () {
        if (modulesDocent > 40) {
            if (frameCount % 200 === 0) {
                modulesDocent -= 10;
                // console.log(modulesDocent);
            }
        }
        if (modulesEnemy > 60) {
            if (frameCount % 200 === 0) {
                modulesEnemy -= 10;
                // console.log(modulesEnemy);
            }
        }
        if (versnelling > -6) {
            if (frameCount % 150 === 0) {
                versnelling -= 0.1;
                // console.log(versnelling);
            }
        }
        if (isPaused) {
            // ctx.clearRect(0, 0, WIDTH, HEIGHT);
            // ctx.fillText('Game over! Klik om opnieuw te beginnen!', 200, 250);
            // document.getElementById("ctx").addEventListener("click", clickCanvas);
            //Upload user score
            if(uploadUserScore){
                $.get( '/insert_score/'+ score, function() {});
                uploadUserScore = false;
            }
            location.reload();
            // function clickCanvas() {
            //     if(isPaused){
            //         location.reload();
            //         isPaused = false;
            //         startNewGame();
            //         document.getElementById("ctx").removeEventListener('click', clickCanvas);
            //     }
            // }

            return;
        }

        else {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            frameCount++;
            timer++;
            score++;

            playerHP();

            if (frameCount % 3 === 0) {
                requestAnimationFrame(animate);
            }

            if (frameCount % 500 === 0) {
                randomlyGenerateHearth();
            }

            if (frameCount % modulesDocent === 0) {
                randomlyGenerateDocent();
            }
            if (frameCount % modulesEnemy === 0) {
                randomlyGenerateEnemy();
            }

            player.attackCounter += player.atkSpd;

            for (var key in docentList) {
                docentList[key].update();
                if (docentList[key].x < 0) {
                    delete docentList[key];
                }

                var isColliding = player.testCollision(docentList[key]);
                if (isColliding) {
                    player.hp -= 1;
                    delete docentList[key];
                }
            }

            for (var key in enemyList) {
                enemyList[key].update();
                if (enemyList[key].x < 0) {
                    delete enemyList[key];
                }

                var isColliding = player.testCollision(enemyList[key]);
                if (isColliding) {
                    score += 1000;
                    delete enemyList[key];
                }
            }

            for (var key in hearthList) {
                hearthList[key].update();
                if (hearthList[key].x < 0) {
                    delete hearthList[key];
                }

                var isColliding = player.testCollision(hearthList[key]);
                if (isColliding) {
                    player.hp += 1;
                    delete hearthList[key];
                }
            }


            if (player.hp <= 0) {
                var timeSurvived = Date.now() - timeWhenGameStarted;
                isPaused = true;
                // startNewGame();
            }
            if (player.hp > 3) {
                player.hp = 3;
            }

            player.update();
            ctx.fillText('Score: ' + score, 350, 55);
        }
        ;
    };

    startNewGame = function () {
        preLoad();
        player.hp = 3;
        timeWhenGameStarted = Date.now();
        frameCount = 0;
        score = 0;
        enemyList = {};
        docentList = {};
        isPaused = false;
        versnelling = -4;
        modulesDocent = 150;
        modulesEnemy = 130;
        document.getElementById("ctx").removeEventListener('click', startNewGame);
        setInterval(update,40);
    };

    player = Player();
    enemy = Enemy();
    docent = Docent();
    document.getElementById("ctx").addEventListener("click", startNewGame);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillText('Click to start a new game', 200, 250);

})();