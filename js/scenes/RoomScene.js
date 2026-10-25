import { GAME_WIDTH, GAME_HEIGHT, MAX_HEARTS } from '../config.js';
import { ROOMS } from '../data/rooms.js';
import { TEXTS } from '../data/texts.js';
import Player from '../entities/Player.js';
import Closet from '../entities/Closet.js';
import Rush from '../entities/Rush.js';
import Pickup from '../entities/Pickup.js';
import Health from '../systems/Health.js';
import gameState from '../systems/GameState.js';
import Screech from '../entities/Screech.js';
import Eyes from '../entities/Eyes.js';
import Director from '../systems/Director.js';
import { buildFloor, paintWall, addDecor, drawKey } from '../systems/Art.js';

const WALL = 40;

export default class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
    }

    init(data) { 
        this.roomIndex = (data && data.roomIndex) || 0; // kertoo mikä huone rakennetaan, jos ei dataa -> oletuksena huone 1
        this.arriveSide = (data && data.arriveSide) || 'start'; // kertoo mistä pelaaja tulee huoneeseen, oletuksena "start" (vasen puoli)
        this.room = ROOMS[this.roomIndex]; // valitsee huoneen datan, jonka jälkeen create() rakentaa huoneen sen perusteella
        this.isFinalGate = this.roomIndex === ROOMS.length - 1; // tarkistaa onko pelaaja viimeisessä huoneessa

        this.changingRoom = false; 
        this.hiding = false; 
        this.hidingCloset = null; // missä kaapissa pelaaja on piilossa
        this.key = null;
        this.keyArt = null; // avaimen piirretty kuva
        this.backDoor = null;
        this.messageTimer = null;
        this.lastCause = 'unknown'; // mikä viimeksi satutti pelaajaa, game over -ruutu käyttää tätä
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);  // huoneitten välinen fade efekti
        this.director = new Director(this); // huoneen ohjaaja: vain yksi pelottava tapahtuma kerrallaan
        gameState.startClock(); // kello käy vain kun pelaaja on huoneessa
        this.events.once('shutdown', () => gameState.stopClock()); // kello pysähtyy kun scene päättyy

        buildFloor(this, this.room.floorColor); // lattia kuvana, huoneen väri läpinäkyvänä päällä
        addDecor(this); // soihdut ja kynttilät

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

        // puhekupla: pelaajan ajatukset näkyy pelaajan pään päällä ja seuraa pelaajaa
        this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
            fontFamily: 'Arial', fontSize: '22px', fontStyle: 'italic', color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.75)', padding: { x: 12, y: 8 },
            wordWrap: { width: 460 }, align: 'center'
        }).setOrigin(0.5, 1).setDepth(30).setVisible(false);

        if (this.roomIndex === 0) { // ohjevihje vain huoneessa 1
            this.add.text(20, 38, TEXTS.controlsHint, {
                fontFamily: 'Arial', fontSize: '18px', color: '#9e9e9e'
            }).setDepth(30);
        }

        this.updateHud(); 

        this.rush = new Rush(this, this.room.rush);
        this.screech = this.room.screech ? new Screech(this, this.room.screech) : null; // luodaan screech vain jos huoneessa on screech asetukset
        if (this.eyes.length > 0 && this.director.firstTime('eyes')) { // silmien ensimmäinen kupla vain kerran koko pelissä
            this.time.delayedCall(1200, () => this.showMessage(TEXTS.eyesFirst, 4500));
        }


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

        // TEMPORARY: paina 0 niin hyppäät suoraan viimeiseen huoneeseen testausta varten, poistetaan ennen palautusta
        this.input.keyboard.on('keydown-ZERO', () => this.scene.start('FinalRoomScene'));
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
        wall.setVisible(false); // fysiikkalaatikko jää, mutta sitä ei piirretä
        this.walls.add(wall);
        paintWall(this, x, y, width, height); // seinän kuva samaan kohtaan
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
        this.key.setVisible(false); // fysiikkalaatikko jää, mutta sitä ei piirretä
        this.physics.add.existing(this.key, true);
        this.keyArt = drawKey(this, k.x, k.y); // piirretty avain leijuu samassa paikassa
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

    createEyes() { // tekee yhden Eyes-olion jokaista huoneen eyes-listan alkiota kohden
        this.eyes = (this.room.eyes || []).map((data) => new Eyes(this, data)); // jos huoneessa ei ole silmiä, lista on tyhjä
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
        this.keyArt.destroy(); // piirretty avain pois
        this.updateDoorColor();
        this.updateHud();
        this.showMessage(TEXTS.key);
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
            this.showMessage(TEXTS.object);
        } else {
            s.note = true;
            this.showMessage(TEXTS.note);
        }

        pickup.destroy();
        this.updateDoorColor();
        this.updateHud();
    }

    toggleHide() { // pelaaja voi piiloutua kaappiin, jos on tarpeeksi lähellä sitä
        if (this.changingRoom) return;

        if (this.hiding) { // ulos kaapista
            this.hiding = false;
            this.hidingCloset = null;
            this.player.setVisible(true);
            return;
        }

        const closet = this.closets.find((c) => c.isNear(this.player)); // tarkistetaan onko pelaaja tarpeeksi lähellä kaappia, jos ei -> ei tehdä mitään
        if (!closet) return;

        this.hiding = true;
        this.hidingCloset = closet; // muistetaan mikä kaappi, jotta sen teksti voidaan vaihtaa
        this.player.body.reset(closet.x, closet.y);
        this.player.setVisible(false);
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

    onDoorTouched() { // kun pelaaja koskee ovee, tarkistetaan sen kamat
        if (this.changingRoom) return;

        if (!gameState.roomState(this.roomIndex).key) {
            this.showMessage(TEXTS.doorLocked, 2500);
            return;
        }

        if (!this.canOpenExit()) {
            this.showMessage(TEXTS.gateLocked, 3000);
            return;
        }

        if (this.isFinalGate) { // kaikki kerätty -> viimeinen huone, ovi lukittuu perässä
            this.changingRoom = true;
            this.player.body.setVelocity(0, 0);
            this.showMessage(TEXTS.gateClosing, 0);

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

    hurtPlayer(cause = 'unknown') { // cause kertoo mikä satutti: 'rush', 'screech' tai 'eyes'
        if (this.changingRoom) return; // jos huonetta vaihdetaan, ei oteta damagee
        if (!this.health.takeDamage()) return; // jos pelaaja on invulnerable tai kuollut, ei oteta damagee

        this.lastCause = cause; // muistetaan syy, viimeinen osuma ratkaisee mitä game over näyttää

        this.updateHud();
        this.cameras.main.shake(150, 0.01, true);

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
            this.scene.start('GameOverScene', { roomIndex: this.roomIndex, cause: this.lastCause });
        });
    }

    // -----------------------------------------------------------
    //                      HUD JA PUHEKUPLA
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

    showMessage(text, duration = 3500) { // näytetään pelaajan ajatus puhekuplassa, esim. kun hän kerää avaimen
        this.messageText.setText(text).setVisible(text !== ''); // tyhjää tekstiä ei näytetä
        this.positionBubble(); // asetetaan heti oikeaan paikkaan, ettei kupla välähdä väärässä kohdassa
        if (this.messageTimer) this.messageTimer.remove(false); // jos on jo teksti, poistetaan vanha ajastin
        if (duration > 0) { // 0 = teksti pysyy kunnes se poistetaan
            this.messageTimer = this.time.delayedCall(Math.max(duration, 2500), () => this.clearMessage()); // jokainen kupla näkyy vähintään 2,5 s
        }
    }

    clearMessage() { 
        if (this.messageTimer) this.messageTimer.remove(false);
        this.messageText.setText('').setVisible(false);
    }

    positionBubble() { // kupla pelaajan pään päälle (tai kaapin päälle kun pelaaja piilossa), pysyy ruudun sisällä
        if (!this.player || !this.messageText.visible) return;

        const half = this.messageText.width / 2 + 10;
        const x = Phaser.Math.Clamp(this.player.x, half, GAME_WIDTH - half); // ei mene ruudun sivuille
        const offset = this.hiding ? 62 : 52; // kaappi on korkeampi kuin pelaaja
        const y = Math.max(this.player.y - offset, this.messageText.height + 60); // ei mene HUD:n päälle
        this.messageText.setPosition(x, y);
    }

    update() { // pelin update loop, tarkistetaan pelaajan liikkuminen, kerätyt esineet ja kaappiin piiloutuminen
        if (this.changingRoom) return;

        if (this.hiding) {
            this.player.body.setVelocity(0, 0);
        } else {
            this.player.update();
        }

        if (!this.hiding) this.collectNearbyPickups();

        this.closets.forEach((c) => { // kaapin teksti: piilossa ollessa vain sen kaapin päällä lukee "E: come out"
            if (this.hiding) {
                c.setPrompt('E: come out', c === this.hidingCloset);
            } else {
                c.setPrompt('E: hide', c.isNear(this.player));
            }
        });
        this.rush.update();
        if (this.screech) this.screech.update(); // screech tarkistaa piiloutuiko pelaaja
        this.eyes.forEach((e) => e.update()); // jokainen silmäpari tarkistaa liikkuuko pelaaja

        this.positionBubble(); // kupla seuraa pelaajaa
    }
}