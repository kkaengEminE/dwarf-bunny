// Room Scene - interior of house/cottage with storage chest
// Also handles special reward room (cottage2)
const RoomScene = {
    TILE_SIZE: 16,
    MAP_COLS: 20,
    MAP_ROWS: 15,
    tileMap: [],
    interactables: [],
    previousScene: 'city', // Where we came from: 'city', 'farm', or 'farm_cottage2'
    offsetX: 0,
    offsetY: 0,

    // Cottage2 reward room state
    rewardCarrots: [], // { x, y, collected }
    rewardNPC: null,
    rewardAllCollected: false,

    T: {
        FLOOR: 0,
        WALL: 1,
        CARPET: 2,
        DOOR: 3,
    },

    solidTiles: null,

    tileNames: ['floor', 'wall', 'carpet', 'door'],

    _buildMap() {
        const T = this.T;
        const map = [];

        for (let r = 0; r < this.MAP_ROWS; r++) {
            map[r] = [];
            for (let c = 0; c < this.MAP_COLS; c++) {
                let tile = T.FLOOR;

                // Walls around edges
                if (r === 0 || r === this.MAP_ROWS - 1 || c === 0 || c === this.MAP_COLS - 1) {
                    tile = T.WALL;
                }

                // Carpet in center
                if (r >= 6 && r <= 10 && c >= 7 && c <= 12) {
                    tile = T.CARPET;
                }

                // Door at bottom center
                if (r === this.MAP_ROWS - 1 && c >= 9 && c <= 10) {
                    tile = T.DOOR;
                }

                map[r][c] = tile;
            }
        }

        this.tileMap = map;
        this.solidTiles = new Set([T.WALL]);
    },

    _buildInteractables() {
        const ox = this.offsetX;
        const oy = this.offsetY;
        const isCottage2 = this.previousScene === 'farm_cottage2';

        this.interactables = [];

        // Door to exit
        this.interactables.push({
            x: ox + 9.5 * 16 + 8,
            y: oy + (this.MAP_ROWS - 1) * 16 + 8,
            type: 'door',
            action: () => {
                Inventory.closeAll();
                if (isCottage2) {
                    // Mark cottage2 as looted if all carrots collected
                    if (this.rewardAllCollected) {
                        FarmScene.cottage2Looted = true;
                    }
                    SceneManager.switchScene('farm', { x: 34 * 16, y: 32 * 16 });
                } else if (this.previousScene === 'farm') {
                    SceneManager.switchScene('farm', { x: 34 * 16, y: 14 * 16 });
                } else {
                    SceneManager.switchScene('city', { x: 8 * 16, y: 34 * 16 });
                }
            }
        });

        if (isCottage2) {
            // Reward room: 10 carrots on floor + NPC
            this._buildRewardInteractables();
        } else {
            // Normal room: storage chest
            const loc = this.previousScene; // 'farm' or 'city'
            this.interactables.push({
                x: ox + 17 * 16 + 8,
                y: oy + 2 * 16 + 12,
                type: 'chest',
                action: () => {
                    Inventory.toggleStorage(loc);
                }
            });
        }
    },

    _initRewardRoom() {
        const ox = this.offsetX;
        const oy = this.offsetY;

        // 10 carrots scattered on the floor
        this.rewardCarrots = [];
        const positions = [
            [3, 3], [5, 4], [7, 3], [9, 4], [11, 3],
            [4, 8], [6, 9], [8, 8], [10, 9], [12, 8]
        ];
        for (const [c, r] of positions) {
            this.rewardCarrots.push({
                x: ox + c * 16,
                y: oy + r * 16,
                collected: false
            });
        }
        this.rewardAllCollected = false;

        // NPC inside
        this.rewardNPC = NPC.create(ox + 15 * 16, oy + 6 * 16, '보상 토끼');
        this.rewardNPC.bounds = {
            minX: ox + 2 * 16,
            minY: oy + 2 * 16,
            maxX: ox + 17 * 16,
            maxY: oy + 12 * 16
        };
    },

    _buildRewardInteractables() {
        const ox = this.offsetX;
        const oy = this.offsetY;

        // Carrot interactables
        for (let i = 0; i < this.rewardCarrots.length; i++) {
            const carrot = this.rewardCarrots[i];
            if (!carrot.collected) {
                const idx = i;
                this.interactables.push({
                    x: carrot.x + 8,
                    y: carrot.y + 8,
                    type: 'carrot',
                    action: () => {
                        this.rewardCarrots[idx].collected = true;
                        Inventory.addCarrots(1);
                        Inventory.gainExp(3);
                        // Check if all collected
                        if (this.rewardCarrots.every(c => c.collected)) {
                            this.rewardAllCollected = true;
                            UI.showNotification('모든 당근을 수확했다! 밖으로 나가면 집이 사라집니다.', 4);
                        }
                        this._rebuildRewardInteractables();
                    }
                });
            }
        }

        // NPC interactable
        if (this.rewardNPC) {
            this.interactables.push({
                get x() { return RoomScene.rewardNPC.x + 16; },
                get y() { return RoomScene.rewardNPC.y + 16; },
                type: 'npc',
                action: () => {
                    UI.showSpeechBubble('잘했다!', this.rewardNPC.x + 16, this.rewardNPC.y, 3);
                }
            });
        }
    },

    _rebuildRewardInteractables() {
        // Keep door and NPC, rebuild carrot interactables
        this.interactables = this.interactables.filter(i => i.type !== 'carrot');
        this._buildRewardInteractables();
    },

    onEnter(data) {
        if (data && data.from) {
            this.previousScene = data.from;
        }

        this.offsetX = (Game.width - this.MAP_COLS * 16) / 2;
        this.offsetY = (Game.height - this.MAP_ROWS * 16) / 2;

        this._buildMap();

        if (this.previousScene === 'farm_cottage2') {
            this._initRewardRoom();
        } else {
            this.rewardCarrots = [];
            this.rewardNPC = null;
        }

        this._buildInteractables();

        // Start in center of room (in screen coords including offset)
        Player.setPosition(
            this.offsetX + (this.MAP_COLS / 2) * 16 - 16,
            this.offsetY + (this.MAP_ROWS / 2) * 16
        );
    },

    onExit() {
        Inventory.closeAll();
    },

    update(dt) {
        if (Inventory.isOverlayOpen()) {
            Inventory.update();
            // Allow closing storage with Z
            if (Inventory.showStorage && Input.wasPressed('KeyZ')) {
                Inventory.showStorage = false;
            }
            return;
        }
        Inventory.update();

        Player.update(dt, this.tileMap, this.solidTiles, this.offsetX, this.offsetY);
        Interaction.check(this.interactables);
        UI.update(dt);

        // Update reward NPC if in cottage2
        if (this.rewardNPC) {
            NPC.updateOne(this.rewardNPC, dt, this.tileMap, this.solidTiles);
        }
    },

    render(ctx) {
        const isCottage2 = this.previousScene === 'farm_cottage2';

        // Fill background with dark color
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, Game.width, Game.height);

        // Draw tile map at offset
        for (let r = 0; r < this.MAP_ROWS; r++) {
            for (let c = 0; c < this.MAP_COLS; c++) {
                const tile = this.tileMap[r][c];
                TileSprites.draw(ctx, this.tileNames[tile],
                    this.offsetX + c * 16, this.offsetY + r * 16);
            }
        }

        if (isCottage2) {
            // Draw reward carrots
            for (const carrot of this.rewardCarrots) {
                if (!carrot.collected) {
                    ObjectSprites.draw(ctx, 'carrot', carrot.x, carrot.y);
                }
            }
            // Draw reward NPC
            if (this.rewardNPC) {
                NPC.renderOne(ctx, this.rewardNPC);
            }
        } else {
            // Draw normal furniture
            ObjectSprites.draw(ctx, 'bed', this.offsetX + 2 * 16, this.offsetY + 2 * 16);
            ObjectSprites.draw(ctx, 'desk', this.offsetX + 10 * 16, this.offsetY + 2 * 16);
            ObjectSprites.draw(ctx, 'chest', this.offsetX + 16 * 16 + 4, this.offsetY + 2 * 16);

            // Label for chest
            ctx.fillStyle = '#aa8855';
            ctx.font = '8px monospace';
            const loc = this.previousScene === 'farm' ? '농장' : '도시';
            ctx.fillText(`${loc} 창고`, this.offsetX + 16 * 16, this.offsetY + 5 * 16 + 4);
        }

        // Door
        ObjectSprites.draw(ctx, 'door', this.offsetX + 9 * 16, this.offsetY + (this.MAP_ROWS - 1) * 16);

        // Draw player (screen coords)
        Player.render(ctx);

        // Draw UI
        UI.render(ctx);
    }
};
