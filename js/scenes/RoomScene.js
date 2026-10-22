import { GAME_WIDTH, GAME_HEIGHT, MAX_HEARTS } from '../config.js';
import { ROOMS } from '../data/rooms.js';
import Player from '../entities/Player.js';
import Closet from '../entities/Closet.js';
import Rush from '../entities/Rush.js';
import Pickup from '../entities/Pickup.js';
import Health from '../systems/Health.js';
import gameState from '../systems/GameState.js';
import Screech from '../entities/Screech.js';
import Eyes from '../entities/Eyes.js';

const WALL = 40;

export default class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
    }

    init(data) { 
        this.roomIndex = (data && data.roomIndex) || 0; // kertoo mikä huone rakennetaan, jos ei dataa -> oletuksena huone 1
        this. arriveSide = (data && data.arriveSide) || 'start'; // kertoo mistä pelaaja tulee huoneeseen, oletuksena "start" (vasen puoli)
        this.room = ROOMS[this.roomIndex]; // valitsee huoneen datan, jonka jälkeen create() rakentaa huoneen sen perusteella
        this.isFinalGate = this.roomIndex === ROOMS.length - 1; // tarkistaa onko pelaaja viimeisessä huoneessa

        this.changingRoom = false; 
        this.hiding = false; 
        this.key = null;
        this.backDoor = null;
        this.messageTimer = null;
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);  // huoneitten välinen fade efekti

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, this.room.floorColor);

        this.walls = this.physics.add.staticGroup(); // seinät ei liiku (staticGroup)
        this.buildBorder();
        this.room.walls.forEach(([x, y, w, h]) => this.addWall(x, y, w, h));

        this.createDoors();
        this.createKey();
        this.createClosets();
        this.createPickups();
        this.createEyes();

        const spawn = this.getSpawn(); // määrittää pelaajan spawn pointin riippuen siitä, mistä hän tulee huoneeseen
        this.player = new Player(this, spawn.x, spawn.y);
        this.health = new Health(this, gameState.hearts); 

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
        this.screech = this.room.screech ? new Screech(this, this.room.screech) : null; // luodaan screech vain jos huoneessa on screech asetukset


        // collision physics: mitä käy kun osutaan seinään, oveen yms.
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.door, () => this.onDoorTouched());
        if (this.backDoor) {
            this.physics.add.collider(this.player, this.backDoor, () => this.onBackDoorTouched());
        }
        if (this.key) {
            this.physics.add.overlap(this.player, this.key, () => this.collectKey());
        }

        this.input.keyboard.on('keydown-E', () => this.toggleHide());
        this.input.keyboard.on('keydown-ZERO', () => this.scene.start('FinalRoomScene')); // TESTI !!!! POISTA
    }

    // -----------------------------------------------------------
    //                      HUONEEN RAKENNUS
    // -----------------------------------------------------------

    buildBorder() { // huoneen reunat, niitten ulkopuolille ei voi liikkua
        this.addWall(GAME_WIDTH / 2, WALL / 2, GAME_WIDTH, WALL);
        this.addWall(GAME_WIDTH / 2, GAME_HEIGHT - WALL / 2, GAME_WIDTH, WALL);
        this.buildSideWall(WALL / 2, this.room.backDoor);
        this.buildSideWall(GAME_WIDTH - WALL / 2, this.room.door);
    }

    buildSideWall(x, doorData) { // rako ovelle
        if (!doorData) {
            this.addWall(x, GAME_HEIGHT / 2, WALL, GAME_HEIGHT);
            return;
        }

        const gapTop = doorData.y - doorData.height / 2;
        const gapBottom = doorData.y + doorData.height / 2;

        this.addWall(x, gapTop / 2, WALL, gapTop);
        this.addWall(x, (gapBottom + GAME_HEIGHT) / 2, WALL, GAME_HEIGHT - gapBottom);
    }

    addWall(x, y, width, height) { 
        const wall = this.add.rectangle(x, y, width, height, 0x6d6d6d);
        this.walls.add(wall);
    }

    createDoors() { // määritellään ovi ja mahdollinen takaovi
        const d = this.room.door;
        this.door = this.add.rectangle(GAME_WIDTH - WALL / 2, d.y, WALL, d.height, 0x8d6e63);
        this.physics.add.existing(this.door, true);
        this.updateDoorColor();

        if (this.room.backDoor) {
            const b = this.room.backDoor;
            this.backDoor = this.add.rectangle(WALL / 2, b.y, WALL, b.height, 0x66bb6a);
            this.physics.add.existing(this.backDoor, true);
        }
    }

    createKey() { 
        if (gameState.roomState(this.roomIndex).key) return;

        const k = this.room.key;
        this.key = this.add.rectangle(k.x, k.y, 22, 22, 0xffd54f);
        this.physics.add.existing(this.key, true);
    }

    createClosets() { 
        this.closets = this.room.closets.map(([x, y]) => new Closet(this, x, y));
    }

    createPickups() { 
        const s = gameState.roomState(this.roomIndex);
        this.pickups = [];

        if (this.room.object && !s.object) {
            this.pickups.push(new Pickup(this, 'object', this.room.object));
        }
        if (this.room.note && !s.note) {
            this.pickups.push(new Pickup(this, 'note', this.room.note));
        }
    }

    createEyes() {
        this.eyes = (this.room.eyes || []).map((data) => new Eyes(this, data));
    }

    eyesBusy() {
        return this.eyes.some((e) => e.isBusy());
    }


    getSpawn() { // määritellään spawn point, taka vai etuovi
        if (this.arriveSide === 'right') {
            return { x: GAME_WIDTH - 110, y: this.room.door.y };
        }
        if (this.arriveSide === 'left' && this.room.backDoor) {
            return { x: 110, y: this.room.backDoor.y };
        }
        return this.room.playerStart;
    }



// -----------------------------------------------------------
//                      PELAAJAN TOIMINNOT
// -----------------------------------------------------------


    collectKey() { // kun pelaaja kerää avaimen, se poistetaan näkyvistä ja HUD päivittyy
        const s = gameState.roomState(this.roomIndex);
        if (s.key) return; // jos avain on jo kerätty, ei tehdä mitään

        s.key = true;
        this.key.destroy();
        this.updateDoorColor();
        this.updateHud();
        this.showMessage('You got the key!');
    }
    
    collectNearbyPickups() { // tarkistaa onko pelaaja tarpeeksi lähellä esinettä, jos on -> kerätään se
        this.pickups = this.pickups.filter((p) => {
            if (!p.isNear(this.player)) return true;
            this.collectPickup(p);
            return false;
        });
    }

    collectPickup(pickup) { // kun pelaaja kerää esineen, se poistetaan näkyvistä ja HUD päivittyy
        const s = gameState.roomState(this.roomIndex);

        if (pickup.kind === 'object') {
            s.object = true;
            this.showMessage('you found an object.');
        } else {
            s.note = true;
            this.showMessage('you found a note. might be useful later...');
        }

        pickup.destroy();
        this.updateDoorColor();
        this.updateHud();
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


// -----------------------------------------------------------
//                      OVET JA HUONEET
// -----------------------------------------------------------

    canOpenExit() { // voidaanko avata ovi?
        if (!gameState.roomState(this.roomIndex).key) return false; // jos ei avainta, ovi ei aukea

        if (this.isFinalGate) { // jos pelaaja on viimeisessä huoneessa, tarkistetaan onko hän kerännyt kaikki kamat
            return gameState.countObjects() === gameState.totalObjects()
                && gameState.countNotes() === gameState.totalNotes();
        }
        return true; 
    }

    updateDoorColor() { // ovin väri eri kun pelaajalla on avain ja kaikki esineet ja notes kerätty
        this.door.setFillStyle(this.canOpenExit() ? 0x66bb6a : 0x8d6e63);
    }

    missingMessage() { // jos kaikkia kamoja ei ole, kerrotaan vain että kaikki pitää löytää
        return "The final door won't open. You must find all the objects and notes first.";
    }

    onDoorTouched() { // kun pelaaja koskee ovee, tarkistetaan sen kamat
        if (this.changingRoom) return;

        if (!gameState.roomState(this.roomIndex).key) {
            this.showMessage('The door is locked. You must find the key first.', 2500);
            return;
        }

        if (!this.canOpenExit()) {
            this.showMessage(this.missingMessage(), 3000);
            return;
        }

        if (this.isFinalGate) { // kaikki kerätty -> viimeinen huone, ovi lukittuu perässä
            this.changingRoom = true;
            this.player.body.setVelocity(0, 0);
            this.showMessage('The door locks behind you...', 0);

            this.cameras.main.fadeOut(700, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('FinalRoomScene');
            });
            return;
        }

        this.changeRoom(this.roomIndex + 1, 'left');
    }

    onBackDoorTouched() { // kun pelaaja koskee takaovee, mennään edelliseen huoneeseen
        if (this.changingRoom) return;
        this.changeRoom(this.roomIndex - 1, 'right');
    }

    changeRoom(nextIndex, arriveSide) { // kun pelaaja menee oveen, vaihdetaan huonetta
        this.changingRoom = true;
        this.player.body.setVelocity(0, 0);

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.restart({ roomIndex: nextIndex, arriveSide: arriveSide });
        });
    }



// -----------------------------------------------------------
//                      DAMAGE JA GAME OVER
// -----------------------------------------------------------  



    hurtPlayer() {
        if (this.changingRoom) return; // jos huonetta vaihdetaan, ei oteta damagee
        if (!this.health.takeDamage()) return; // jos pelaaja on invulnerable tai kuollut, ei oteta damagee

        this.updateHud();
        this.cameras.main.shake(150, 0.01);

        gameState.hearts = this.health.hearts; // päivitetään game state, jotta pelaajan sydämet säilyy huoneiden välillä

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


    // -----------------------------------------------------------
    //                           HUD
    // -----------------------------------------------------------      


    updateHud() {
        const s = gameState.roomState(this.roomIndex); // päivitetään HUD

        this.hudText.setText(
            `Room ${this.roomIndex + 1} of ${ROOMS.length}   Key: ${s.key ? 'yes' : 'no'}   Try ${gameState.tries}`
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
    
    

    update() { // pelin update loop, tarkistetaan pelaajan liikkuminen, kerätyt esineet ja kaappiin piiloutuminen
        if (this.changingRoom) return;

        if (this.hiding) {
            this.player.body.setVelocity(0, 0);
        } else {
            this.player.update();
        }

        if (!this.hiding) this.collectNearbyPickups();

        this.closets.forEach((c) => c.setPromptVisible(!this.hiding && c.isNear(this.player)));
        this.rush.update();
        if (this.screech) this.screech.update(); // screech tarkistaa piiloutuiko pelaaja
        this.eyes.forEach((e) => e.update()); // jokainen silmäpari tarkistaa liikkuuko pelaaja
    }
}