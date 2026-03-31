// UI system - mode indicator, speech bubbles, prompts, overlays
const UI = {
    speechBubble: null,
    speechTimer: 0,
    interactionPrompt: null,
    notification: null,
    notificationTimer: 0,

    showSpeechBubble(text, x, y, duration) {
        this.speechBubble = { text, x, y };
        this.speechTimer = duration || 3;
    },

    showPrompt(text, x, y) {
        this.interactionPrompt = { text, x, y };
    },

    clearPrompt() {
        this.interactionPrompt = null;
    },

    showNotification(text, duration) {
        this.notification = text;
        this.notificationTimer = duration || 2;
    },

    update(dt) {
        if (this.speechBubble) {
            this.speechTimer -= dt;
            if (this.speechTimer <= 0) {
                this.speechBubble = null;
            }
        }
        if (this.notification) {
            this.notificationTimer -= dt;
            if (this.notificationTimer <= 0) {
                this.notification = null;
            }
        }
    },

    // Menu button rect
    menuBtn: { x: 10, y: 40, w: 70, h: 22 },

    render(ctx) {
        const scene = SceneManager.currentName;
        // Skip game UI for title/settings/loading
        if (scene === 'title' || scene === 'settings' || scene === 'loading' || scene === 'lore') return;

        // Mode indicator
        this._renderModeIndicator(ctx);

        // Carrot counter (top-right)
        this._renderCarrotCounter(ctx);

        // Menu button
        this._renderMenuButton(ctx);

        // Speech bubble
        if (this.speechBubble) {
            this._renderSpeechBubble(ctx, this.speechBubble);
        }

        // Interaction prompt
        if (this.interactionPrompt) {
            this._renderPrompt(ctx, this.interactionPrompt);
        }

        // Notification (center screen)
        if (this.notification) {
            this._renderNotification(ctx);
        }

        // Inventory overlays
        if (typeof Inventory !== 'undefined') {
            Inventory.renderInventory(ctx);
            Inventory.renderStats(ctx);
            Inventory.renderStorage(ctx);
        }
    },

    checkMenuClick() {
        const scene = SceneManager.currentName;
        if (scene === 'title' || scene === 'settings' || scene === 'loading' || scene === 'lore') return;
        if (Input.clickedInRect(this.menuBtn)) {
            SceneManager.switchScene('title');
        }
    },

    _renderMenuButton(ctx) {
        const btn = this.menuBtn;

        const isHover = Input.mouseX >= btn.x && Input.mouseX <= btn.x + btn.w &&
                         Input.mouseY >= btn.y && Input.mouseY <= btn.y + btn.h;
        ctx.fillStyle = isHover ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.5)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = '#cccccc';
        ctx.font = '10px monospace';
        ctx.fillText('MENU', btn.x + 18, btn.y + 15);
    },

    _renderModeIndicator(ctx) {
        const x = 10, y = 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, 120, 24);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 120, 24);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        const mode = Player.isAnimalMode ? 'ANIMAL MODE' : 'CHARACTER MODE';
        const icon = Player.isAnimalMode ? '🐰' : '🧍';
        ctx.fillText(`${icon} ${mode}`, x + 4, y + 16);
    },

    _renderCarrotCounter(ctx) {
        if (typeof Inventory === 'undefined') return;

        // Always show carrot counter in top-right
        const text = `🥕 x${Inventory.carrots}`;
        const x = Game.width - 110, y = 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, 100, 24);
        ctx.strokeStyle = '#ff8833';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 100, 24);
        ctx.fillStyle = '#ff8833';
        ctx.font = '12px monospace';
        ctx.fillText(text, x + 4, y + 16);
    },

    _renderSpeechBubble(ctx, bubble) {
        const padding = 8;
        ctx.font = '11px monospace';
        const metrics = ctx.measureText(bubble.text);
        const w = metrics.width + padding * 2;
        const h = 24;
        const bx = bubble.x - w / 2;
        const by = bubble.y - h - 10;

        // Bubble background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx, by, w, h);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, w, h);

        // Arrow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(bubble.x - 4, by + h);
        ctx.lineTo(bubble.x + 4, by + h);
        ctx.lineTo(bubble.x, by + h + 6);
        ctx.fill();
        ctx.strokeStyle = '#333333';
        ctx.beginPath();
        ctx.moveTo(bubble.x - 4, by + h);
        ctx.lineTo(bubble.x, by + h + 6);
        ctx.lineTo(bubble.x + 4, by + h);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#333333';
        ctx.fillText(bubble.text, bx + padding, by + 16);
    },

    _renderPrompt(ctx, prompt) {
        ctx.font = '10px monospace';
        const text = prompt.text;
        const metrics = ctx.measureText(text);
        const w = metrics.width + 12;
        const h = 18;
        const px = prompt.x - w / 2;
        const py = prompt.y - 24;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(px, py, w, h);
        ctx.fillStyle = '#ffff88';
        ctx.fillText(text, px + 6, py + 13);
    },

    _renderNotification(ctx) {
        ctx.font = '14px monospace';
        const text = this.notification;
        const metrics = ctx.measureText(text);
        const w = metrics.width + 24;
        const h = 30;
        const x = (Game.width - w) / 2;
        const y = Game.height / 2 - 80;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#ffaa44';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = '#ffcc66';
        ctx.fillText(text, x + 12, y + 21);
    }
};
