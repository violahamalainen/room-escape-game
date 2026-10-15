import { GAME_WIDTH, GAME_HEIGHT, MAX_HEARTS } from '../config.js';
import { ROOMS } from '../data/rooms.js';
import Player from '../entities/Player.js';
import Closet from '../entities/Closet.js';
import Rush from '../entities/Rush.js';
import Health from '../systems/Health.js';

const WALL = 40;

export default class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
    }

    init(data) { 
        this.roomIndex = (data && data.roomIndex) || 0; // kertoo mikä huone rakennetaan, jos ei dataa -> oletuksena huone 1
        this.room = ROOMS[this.roomIndex]; // valitsee huoneen datan, jonka jälkeen create() rakentaa huoneen sen perusteella
        this.startHearts = (data && data.hearts !== undefined) ? data.hearts : MAX_HEARTS; // jos dataa ei ole, pelaajalla on oletuksena MAX_HEARTS sydäntä
        this.hasKey = false; // avain resetataan aina kun huone vaihtuu
        this.changingRoom = false;
        this.hiding = false; // onko pelaaja kaapissa, hyökkäys ei voi osua häneen
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);  // huoneitten välinen fade efekti

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, this.room.floorColor);

        this.walls = this.physics.add.staticGroup(); // seinät ei liiku (staticGroup)
        this.buildBorder();
        this.room.walls.forEach(([x, y, w, h]) => this.addWall(x, y, w, h));

        this.createDoor();
        this.createKey();
        this.createClosets();

        this.player = new Player(this, this.room.playerStart.x, this.room.playerStart.y);
        this.health = new Health(this, this.startHearts);

        this.hudText = this.add.text(20, 8, '', { // teksti kertoo pelaajalle huoneen numeron ja onko avain saatu
            fontFamily: 'Arial', fontSize: '22px', color: '#ffffff'
        }).setDepth(30);
        this.heartsText = this.add.text(GAME_WIDTH - 20, 4, '', {
            fontFamily: 'Arial', fontSize: '30px', color: '#ff5252'
        }).setOrigin(1, 0).setDepth(30);
        this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, '', {
            fontFamily: 'Arial', fontSize: '22px', color: '#ffd54f'
        }).setOrigin(0.5).setDepth(30);
        this.updateHud(); 

        this.rush = new Rush(this, this.room.rush); 


        // mitä käy kun pelaaja osuu seinään, oveen tai avaimeen:
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.door, () => this.onDoorTouched());
        this.physics.add.overlap(this.player, this.key, () => this.collectKey());

        
        this.input.keyboard.on('keydown-E', () => this.toggleHide());
    }

    buildBorder() {
        const gapTop = this.room.door.y - this.room.door.height / 2;
        const gapBottom = this.room.door.y + this.room.door.height / 2;

        this.addWall(GAME_WIDTH / 2, WALL / 2, GAME_WIDTH, WALL);
        this.addWall(GAME_WIDTH / 2, GAME_HEIGHT - WALL / 2, GAME_WIDTH, WALL);
        this.addWall(WALL / 2, GAME_HEIGHT / 2, WALL, GAME_HEIGHT);
        // jätetään seinään aukko ovelle:
        this.addWall(GAME_WIDTH - WALL / 2, gapTop / 2, WALL, gapTop);
        this.addWall(GAME_WIDTH - WALL / 2, (gapBottom + GAME_HEIGHT) / 2, WALL, GAME_HEIGHT - gapBottom);
    }

    addWall(x, y, width, height) {
        const wall = this.add.rectangle(x, y, width, height, 0x6d6d6d);
        this.walls.add(wall);
    }

    createDoor() {
        const d = this.room.door;
        this.door = this.add.rectangle(GAME_WIDTH - WALL / 2, d.y, WALL, d.height, 0x8d6e63);
        this.physics.add.existing(this.door, true);
    }

    createKey() {
        const k = this.room.key;
        this.key = this.add.rectangle(k.x, k.y, 22, 22, 0xffd54f);
        this.physics.add.existing(this.key, true);
    }

    createClosets() {
        this.closets = this.room.closets.map(([x, y]) => new Closet(this, x, y));
    }

    collectKey() {
        if (this.hasKey) return; // jos avain on jo kerätty, ei tehdä mitään
        this.hasKey = true;
        this.key.destroy();
        this.door.setFillStyle(0x66bb6a);
        this.updateHud();
        this.showMessage('You got the key!');
    }

    toggleHide() { // pelaaja voi piiloutua kaappiin, jos on tarpeeksi lähellä sitä
        if (this.changingRoom) return;

        if (this.hiding) {
            this.hiding = false;
            this.player.setVisible(true);
            this.clearMessage();
            return;
        }

        const closet = this.closets.find((c) => c.isNear(this.player)); // tarkistetaan onko pelaaja tarpeeksi lähellä kaappia, jos ei -> ei tehdä mitään
        if (!closet) return;

        this.hiding = true;
        this.player.body.reset(closet.x, closet.y);
        this.player.setVisible(false);
        this.showMessage('Hiding... press E to come out', 0);
    }

    onDoorTouched() { // kun pelaaja koskettaa ovea, tarkistetaan onko hänellä avain
        if (this.changingRoom) return; 

        if (!this.hasKey) {
            this.showMessage('The door is locked. You must find the key first.');
            return;
        }

        this.changingRoom = true;
        this.player.body.setVelocity(0, 0);

        // tää poistuu: vikan huoneen jälkeen takas huone 1
        const next = (this.roomIndex + 1) % ROOMS.length;

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.restart({ roomIndex: next, hearts: this.health.hearts }); // restart huone, mutta säilytetään sydämet
        });
    }

    hurtPlayer() {
        if (this.changingRoom) return; // jos huonetta vaihdetaan, ei oteta damagee
        if (!this.health.takeDamage()) return; // jos pelaaja on invulnerable tai kuollut, ei oteta damagee

        this.updateHud();
        this.cameras.main.shake(150, 0.01);

        this.tweens.add({ // pelaaja vilkkuu kun ottaa damagee
            targets: this.player,
            alpha: 0.2,
            duration: 100,
            yoyo: true, 
            repeat: 6,
            onComplete: () => this.player.setAlpha(1)
        });

        if (this.health.isDead()) { // jos pelaaja kuolee, mennään game over sceneen
            this.gameOver();
        }
    }

    gameOver() {
        this.changingRoom = true; // estetään pelaajaa liikkumasta kun game over tapahtuu
        this.player.body.setVelocity(0, 0);

        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('GameOverScene', { roomIndex: this.roomIndex });
        });
    }

    updateHud() {
        this.hudText.setText(
            `Room ${this.roomIndex + 1} of ${ROOMS.length}    Key: ${this.hasKey ? 'yes' : 'no'}`
        );
        const full = '♥'.repeat(this.health.hearts);
        const empty = '♡'.repeat(MAX_HEARTS - this.health.hearts);
        this.heartsText.setText(full + empty);
    }

    showMessage(text, duration = 1500) { // näytetään pelaajalle teksti, esim. kun hän kerää avaimen
        this.messageText.setText(text);
        if (this.messageTimer) this.messageTimer.remove(false); // jos on jo teksti, poistetaan se ennen uuden näyttämistä
        if (duration > 0) {
            this.messageTimer = this.time.delayedCall(duration, () => this.messageText.setText('')); // teksti poistetaan tietyn ajan kuluttua
        }
    }

    clearMessage() { 
        if (this.messageTimer) this.messageTimer.remove(false);
        this.messageText.setText('');
    }
    
    

    update() { 
        if (this.changingRoom) return;

        if (!this.hiding) this.player.update();

        this.closets.forEach((c) => c.setPromptVisible(!this.hiding && c.isNear(this.player)));
        this.rush.update();
    }
}