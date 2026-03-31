// Inventory & Player Stats System
const Inventory = {
    // Player carrots (carried)
    carrots: 0,

    // Storage per location (separate chests)
    storage: {
        farm: { carrots: 0 },
        city: { carrots: 0 }
    },

    // Player stats
    stats: {
        level: 1,
        exp: 0,
        expToNext: 10,
        hp: 20,
        maxHp: 20,
        attack: 3,
        defense: 1,
        speed: 2
    },

    // UI state
    showInventory: false,
    showStats: false,
    showStorage: false,
    currentStorage: null, // 'farm' or 'city'

    // Add carrots
    addCarrots(amount) {
        this.carrots += amount;
        this._checkLevelUp();
    },

    // Remove carrots (returns false if not enough)
    removeCarrots(amount) {
        if (this.carrots >= amount) {
            this.carrots -= amount;
            return true;
        }
        return false;
    },

    // Deposit carrots into storage
    depositCarrot(location) {
        if (this.carrots > 0) {
            this.carrots--;
            this.storage[location].carrots++;
            return true;
        }
        return false;
    },

    // Withdraw carrots from storage
    withdrawCarrot(location) {
        if (this.storage[location].carrots > 0) {
            this.storage[location].carrots--;
            this.carrots++;
            return true;
        }
        return false;
    },

    // Gain exp from harvesting
    gainExp(amount) {
        this.stats.exp += amount;
        this._checkLevelUp();
    },

    _checkLevelUp() {
        while (this.stats.exp >= this.stats.expToNext) {
            this.stats.exp -= this.stats.expToNext;
            this.stats.level++;
            this.stats.expToNext = Math.floor(this.stats.expToNext * 1.5);
            this.stats.maxHp += 5;
            this.stats.hp = this.stats.maxHp;
            this.stats.attack += 1;
            this.stats.defense += 1;
        }
    },

    // Toggle inventory display
    toggleInventory() {
        this.showInventory = !this.showInventory;
        if (this.showInventory) {
            this.showStats = false;
            this.showStorage = false;
        }
    },

    // Toggle stats display
    toggleStats() {
        this.showStats = !this.showStats;
        if (this.showStats) {
            this.showInventory = false;
            this.showStorage = false;
        }
    },

    // Toggle storage display
    toggleStorage(location) {
        this.currentStorage = location;
        this.showStorage = !this.showStorage;
        if (this.showStorage) {
            this.showInventory = false;
            this.showStats = false;
        }
    },

    closeAll() {
        this.showInventory = false;
        this.showStats = false;
        this.showStorage = false;
    },

    update() {
        // I key toggles inventory
        if (Input.wasPressed('KeyI')) {
            this.toggleInventory();
        }
        // C key toggles stats
        if (Input.wasPressed('KeyC')) {
            this.toggleStats();
        }

        // Storage key handling when storage is open
        if (this.showStorage && this.currentStorage) {
            // Q to deposit
            if (Input.wasPressed('KeyQ')) {
                this.depositCarrot(this.currentStorage);
            }
            // R to withdraw
            if (Input.wasPressed('KeyR')) {
                this.withdrawCarrot(this.currentStorage);
            }
        }
    },

    // Render inventory overlay
    renderInventory(ctx) {
        if (!this.showInventory) return;

        const w = 240, h = 180;
        const x = (Game.width - w) / 2;
        const y = (Game.height - h) / 2;

        // Background
        ctx.fillStyle = 'rgba(20, 15, 10, 0.92)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#aa8855';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Title
        ctx.fillStyle = '#ffcc66';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('인벤토리 (I)', x + 70, y + 24);

        // Carrot item slot
        const slotX = x + 30, slotY = y + 50;
        const slotSize = 48;

        // Slot background
        ctx.fillStyle = 'rgba(60, 50, 30, 0.8)';
        ctx.fillRect(slotX, slotY, slotSize, slotSize);
        ctx.strokeStyle = '#886633';
        ctx.lineWidth = 1;
        ctx.strokeRect(slotX, slotY, slotSize, slotSize);

        // Draw carrot icon
        if (this.carrots > 0) {
            ctx.save();
            ctx.translate(slotX + 8, slotY + 4);
            ctx.scale(2, 2);
            ObjectSprites.draw(ctx, 'carrot', 0, 0);
            ctx.restore();

            // Count at bottom-right of slot
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(this.carrots, slotX + slotSize - 3, slotY + slotSize - 4);
            ctx.textAlign = 'left';
        }

        // Label
        ctx.fillStyle = '#ccaa77';
        ctx.font = '11px monospace';
        ctx.fillText('당근', slotX + 12, slotY + slotSize + 16);

        // Instructions
        ctx.fillStyle = '#888866';
        ctx.font = '10px monospace';
        ctx.fillText('I 키로 닫기', x + 75, y + h - 14);
    },

    // Render stats overlay
    renderStats(ctx) {
        if (!this.showStats) return;

        const w = 260, h = 240;
        const x = (Game.width - w) / 2;
        const y = (Game.height - h) / 2;

        // Background
        ctx.fillStyle = 'rgba(10, 15, 30, 0.92)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#5577aa';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Title
        ctx.fillStyle = '#88bbff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('토끼 스탯 (C)', x + 72, y + 24);

        // Stats
        const s = this.stats;
        ctx.font = '12px monospace';
        const lines = [
            { label: '레벨', value: s.level, color: '#ffdd66' },
            { label: 'HP', value: `${s.hp} / ${s.maxHp}`, color: '#66ff88' },
            { label: '공격력', value: s.attack, color: '#ff8866' },
            { label: '방어력', value: s.defense, color: '#66aaff' },
            { label: '속도', value: s.speed, color: '#ffaa66' },
            { label: '경험치', value: `${s.exp} / ${s.expToNext}`, color: '#cc88ff' },
        ];

        let ly = y + 52;
        for (const line of lines) {
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText(line.label, x + 30, ly);
            ctx.fillStyle = line.color;
            ctx.fillText(String(line.value), x + 130, ly);
            ly += 28;
        }

        // Instructions
        ctx.fillStyle = '#666688';
        ctx.font = '10px monospace';
        ctx.fillText('C 키로 닫기', x + 82, y + h - 14);
    },

    // Render storage overlay
    renderStorage(ctx) {
        if (!this.showStorage || !this.currentStorage) return;

        const loc = this.currentStorage;
        const stored = this.storage[loc].carrots;

        const w = 280, h = 220;
        const x = (Game.width - w) / 2;
        const y = (Game.height - h) / 2;

        // Background
        ctx.fillStyle = 'rgba(25, 18, 10, 0.92)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#aa7744';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        const locName = loc === 'farm' ? '농장 창고' : '도시 창고';
        ctx.fillStyle = '#ffcc66';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(locName, x + (w - ctx.measureText(locName).width) / 2, y + 24);

        // My carrots
        ctx.fillStyle = '#ccaa77';
        ctx.font = '12px monospace';
        ctx.fillText('소지 당근:', x + 30, y + 56);
        ctx.fillStyle = '#ff8833';
        ctx.fillText(`${this.carrots}`, x + 140, y + 56);

        // Storage slot
        const slotX = x + 30, slotY = y + 75;
        const slotSize = 48;

        ctx.fillStyle = 'rgba(60, 50, 30, 0.8)';
        ctx.fillRect(slotX, slotY, slotSize, slotSize);
        ctx.strokeStyle = '#886633';
        ctx.lineWidth = 1;
        ctx.strokeRect(slotX, slotY, slotSize, slotSize);

        if (stored > 0) {
            ctx.save();
            ctx.translate(slotX + 8, slotY + 4);
            ctx.scale(2, 2);
            ObjectSprites.draw(ctx, 'carrot', 0, 0);
            ctx.restore();

            // Count at bottom-right
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(stored, slotX + slotSize - 3, slotY + slotSize - 4);
            ctx.textAlign = 'left';
        }

        ctx.fillStyle = '#ccaa77';
        ctx.font = '11px monospace';
        ctx.fillText('보관 당근', slotX + 2, slotY + slotSize + 16);

        // Key instructions
        ctx.fillStyle = '#aaaa88';
        ctx.font = '11px monospace';
        ctx.fillText('Q : 당근 넣기', x + 30, y + h - 44);
        ctx.fillText('R : 당근 빼기', x + 30, y + h - 26);

        ctx.fillStyle = '#888866';
        ctx.font = '10px monospace';
        ctx.fillText('Z 키로 닫기', x + 170, y + h - 14);
    },

    // Check if any overlay is open
    isOverlayOpen() {
        return this.showInventory || this.showStats || this.showStorage;
    }
};
