// Title Scene - start screen with Start and Settings buttons
const TitleScene = {
    starPositions: [],
    bunnyFrame: 0,
    bunnyTimer: 0,

    // Button rects
    startBtn: { x: 300, y: 360, w: 200, h: 50 },
    settingsBtn: { x: 300, y: 430, w: 200, h: 50 },

    onEnter() {
        // Generate star positions once
        if (this.starPositions.length === 0) {
            for (let i = 0; i < 60; i++) {
                this.starPositions.push({
                    x: Math.random() * Game.width,
                    y: Math.random() * Game.height,
                    size: Math.random() * 2 + 0.5,
                    speed: Math.random() * 0.3 + 0.1
                });
            }
        }
    },

    onExit() {},

    update(dt) {
        // Animate bunny
        this.bunnyTimer += dt;
        if (this.bunnyTimer > 0.4) {
            this.bunnyTimer = 0;
            this.bunnyFrame = (this.bunnyFrame + 1) % 2;
        }

        // Button clicks
        if (Input.clickedInRect(this.startBtn)) {
            SceneManager.switchScene('city', { x: 400, y: 450 });
        }
        if (Input.clickedInRect(this.settingsBtn)) {
            SceneManager.switchScene('settings');
        }
    },

    render(ctx) {
        // Dark gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, Game.height);
        grad.addColorStop(0, '#0a0a2e');
        grad.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Game.width, Game.height);

        // Stars
        for (const star of this.starPositions) {
            const flicker = 0.5 + Math.sin(this.bunnyTimer * star.speed * 10) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }

        // Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px monospace';
        ctx.fillText('Dwarf Bunny', Game.width / 2, 160);

        ctx.fillStyle = '#aaaacc';
        ctx.font = '16px monospace';
        ctx.fillText('Between Carrots and Concrete', Game.width / 2, 195);

        // Bunny sprite (character mode, facing down)
        const sprite = PlayerSprites.getSprite('char', 'down', this.bunnyFrame);
        ctx.drawImage(sprite, 0, 0, 16, 16,
            Game.width / 2 - 24, 230, 48, 48);

        // Start button
        this._drawButton(ctx, this.startBtn, '시작하기', '#44aa55', '#55cc66');

        // Settings button
        this._drawButton(ctx, this.settingsBtn, '설정', '#555577', '#666688');

        // Footer
        ctx.fillStyle = '#555566';
        ctx.font = '10px monospace';
        ctx.fillText('Arrow keys: Move | Space: Mode Switch | Z: Interact', Game.width / 2, 540);

        ctx.textAlign = 'left';
    },

    _drawButton(ctx, btn, text, color, hoverColor) {
        // Check hover
        const isHover = Input.mouseX >= btn.x && Input.mouseX <= btn.x + btn.w &&
                         Input.mouseY >= btn.y && Input.mouseY <= btn.y + btn.h;

        ctx.fillStyle = isHover ? hoverColor : color;
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, btn.x + btn.w / 2, btn.y + btn.h / 2 + 6);
    }
};

// Settings Scene - placeholder with back button
const SettingsScene = {
    backBtn: { x: 300, y: 380, w: 200, h: 50 },

    onEnter() {},
    onExit() {},

    update(dt) {
        if (Input.clickedInRect(this.backBtn)) {
            SceneManager.switchScene('title');
        }
    },

    render(ctx) {
        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, Game.width, Game.height);

        // Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('설정', Game.width / 2, 200);

        // Coming soon message
        ctx.fillStyle = '#888899';
        ctx.font = '16px monospace';
        ctx.fillText('추후 제공', Game.width / 2, 300);

        // Back button
        ctx.fillStyle = '#555577';
        const btn = this.backBtn;
        const isHover = Input.mouseX >= btn.x && Input.mouseX <= btn.x + btn.w &&
                         Input.mouseY >= btn.y && Input.mouseY <= btn.y + btn.h;
        ctx.fillStyle = isHover ? '#666688' : '#555577';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('뒤로가기', btn.x + btn.w / 2, btn.y + btn.h / 2 + 6);

        ctx.textAlign = 'left';
    }
};
