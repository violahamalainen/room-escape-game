export function formatTime(seconds) { 
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

// tekee klikattavan napin, sama tyyli kaikkialla
export function createButton(scene, x, y, label, onClick, fontSize = 36) {
    const button = scene.add.text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: `${fontSize}px`,
        color: '#ffffff',
        backgroundColor: '#444444',
        padding: { x: 28, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#666666' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#444444' }));
    button.on('pointerdown', onClick);
    return button;
}

// häivyttää mustaan ja vaihtaa sceneen, scenen pitää asettaa this.leaving = false init-funktiossa
export function fadeToScene(scene, key, data) {
    if (scene.leaving) return; // estää tuplaklikkauksen
    scene.leaving = true;

    scene.cameras.main.fadeOut(400, 0, 0, 0);
    scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        scene.scene.start(key, data);
    });
}

// näyttää tekstirivit yksi kerrallaan hitaasti esiin, palauttaa rivit ja kokonaisajan millisekunteina
export function revealLines(scene, lines, firstY, gap, style, stepMs = 1900, fadeMs = 800) {
    const texts = lines.map((line, i) => {
        const t = scene.add.text(scene.scale.width / 2, firstY + i * gap, line, style).setOrigin(0.5).setAlpha(0); // alussa näkymätön
        scene.tweens.add({ targets: t, alpha: 1, duration: fadeMs, delay: 600 + i * stepMs }); // jokainen rivi alkaa omalla vuorollaan
        return t;
    });
    return { texts, totalMs: 600 + (lines.length - 1) * stepMs + fadeMs };
}