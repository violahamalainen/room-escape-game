import { GAME_WIDTH } from '../config.js';
import gameState from '../systems/GameState.js';
import { createButton, fadeToScene, formatTime } from '../systems/UI.js';

// oikea HTML-kenttä canvasin päällä, tyyli annetaan CSS-tekstinä
const INPUT_STYLE = 'width: 340px; height: 52px; font-size: 28px; text-align: center; color: #ffffff; background: #1b1b1b; border: 3px solid #8d8d8d; border-radius: 6px; outline: none;';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    init() {
        this.leaving = false;
    }

    create() {
        this.input.keyboard.clearCaptures(); // pelin nuolet ja WASD estäisivät muuten kirjoittamisen nimikenttään
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.add.text(GAME_WIDTH / 2, 130, 'ESCAPE GAME', {
            fontFamily: 'Arial', fontSize: '80px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 255, 'Enter your name', {
            fontFamily: 'Arial', fontSize: '26px', color: '#bbbbbb'
        }).setOrigin(0.5);

        this.nameInput = this.add.dom(GAME_WIDTH / 2, 315, 'input', INPUT_STYLE);
        const node = this.nameInput.node; // node on se oikea HTML-elementti
        node.type = 'text';
        node.maxLength = 12;
        node.placeholder = 'Your name';
        node.autocomplete = 'off';
        node.value = gameState.playerName; // edellisen pelin nimi säilyy
        node.addEventListener('input', () => this.refreshStartButton());
        node.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') this.startGame();
        });

        this.hint = this.add.text(GAME_WIDTH / 2, 365, '', { // virheilmoitus, esim. "Type a name first."
            fontFamily: 'Arial', fontSize: '22px', color: '#ff8a80'
        }).setOrigin(0.5);

        this.runInfo = this.add.text(GAME_WIDTH / 2, 392, '', { // tieto keskeneräisestä pelistä
            fontFamily: 'Arial', fontSize: '20px', color: '#9e9e9e'
        }).setOrigin(0.5);

        this.startButton = createButton(this, GAME_WIDTH / 2, 450, 'Start game', () => this.startGame());
        // kolme pienempää nappia samalla rivillä
        createButton(this, GAME_WIDTH / 2 - 260, 560, 'How to play', () => fadeToScene(this, 'HowToPlayScene'), 28);
        createButton(this, GAME_WIDTH / 2, 560, 'Scoreboard', () => fadeToScene(this, 'ScoreboardScene'), 28);
        createButton(this, GAME_WIDTH / 2 + 240, 560, 'Settings', () => fadeToScene(this, 'SettingsScene'), 28);

        this.refreshStartButton();
    }

    getName() { // nimi ilman ylimääräisiä välilyöntejä
        return this.nameInput.node.value.trim();
    }

    refreshStartButton() { // nappi, nappiteksti ja infoteksti päivittyvät nimen mukaan
        const name = this.getName();
        const hasName = name.length > 0;
        const continuing = gameState.canContinue(name); // onko tällä nimellä keskeneräinen peli

        this.startButton.setText(continuing ? 'Continue' : 'Start game');
        this.startButton.setAlpha(hasName ? 1 : 0.45); // himmeä kunnes nimi on kirjoitettu
        if (hasName) this.hint.setText('');

        if (continuing) {
            this.runInfo.setText(`Run in progress: try ${gameState.tries}, time ${formatTime(gameState.elapsedSeconds())}`);
        } else if (hasName && gameState.runActive) {
            this.runInfo.setText('A different name starts a new run. Your old run will be lost.');
        } else {
            this.runInfo.setText('');
        }
    }

    startGame() {
        if (this.leaving) return;

        const name = this.getName();
        if (name.length === 0) {
            this.hint.setText('Type a name first.');
            return;
        }

        if (gameState.canContinue(name)) {
            gameState.playerName = name; // jatketaan samaa peliä, suoraan huoneeseen 1 ilman alkutekstiä
            fadeToScene(this, 'RoomScene', { roomIndex: 0 });
        } else {
            gameState.beginRun(name); // uusi peli: yritykset ja kello nollataan, alkuteksti ensin
            fadeToScene(this, 'IntroScene');
        }
    }
}