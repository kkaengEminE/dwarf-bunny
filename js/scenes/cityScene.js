// City Scene - urban area with TAX building, bus stop, bunny's house
const CityScene = {
    TILE_SIZE: 16,
    MAP_COLS: 50,
    MAP_ROWS: 38,
    tileMap: [],
    interactables: [],
    previousScene: null,

    // NPCs
    npcs: [],

    // Tile IDs
    T: {
        GRASS: 0,
        ROAD: 1,
        SIDEWALK: 2,
        BUILDING: 3,
        WALL: 4,
        ROOF: 5,
        DOOR: 6,    // walkable door tile
        DIRT: 7,
    },

    solidTiles: null,

    tileNames: ['grass', 'road', 'sidewalk', 'building', 'wall', 'roof', 'door', 'dirt'],

    _buildMap() {
        const T = this.T;
        const map = [];

        for (let r = 0; r < this.MAP_ROWS; r++) {
            map[r] = [];
            for (let c = 0; c < this.MAP_COLS; c++) {
                // Default: sidewalk
                let tile = T.SIDEWALK;

                // Roads (horizontal)
                if (r >= 18 && r <= 20) tile = T.ROAD;
                // Roads (vertical)
                if (c >= 24 && c <= 26) tile = T.ROAD;

                // Grass patches
                if (r <= 2 || r >= 36) tile = T.GRASS;
                if (c <= 1 || c >= 48) tile = T.GRASS;

                // --- TAX Building (top-left area) ---
                if (r >= 4 && r <= 7 && c >= 4 && c <= 14) tile = T.ROOF;
                if (r >= 8 && r <= 14 && c >= 4 && c <= 14) tile = T.BUILDING;
                if (r === 15 && c >= 4 && c <= 14) tile = T.WALL;
                // TAX door
                if (r === 15 && c >= 8 && c <= 10) tile = T.SIDEWALK;

                // --- Tall building 1 (top-right) ---
                if (r >= 3 && r <= 5 && c >= 30 && c <= 38) tile = T.ROOF;
                if (r >= 6 && r <= 14 && c >= 30 && c <= 38) tile = T.BUILDING;
                if (r === 15 && c >= 30 && c <= 38) tile = T.WALL;

                // --- Tall building 2 (middle-right) ---
                if (r >= 22 && r <= 24 && c >= 30 && c <= 42) tile = T.ROOF;
                if (r >= 25 && r <= 33 && c >= 30 && c <= 42) tile = T.BUILDING;
                if (r === 34 && c >= 30 && c <= 42) tile = T.WALL;

                // --- Bunny's house (bottom-left) ---
                if (r >= 24 && r <= 26 && c >= 4 && c <= 12) tile = T.ROOF;
                if (r >= 27 && r <= 32 && c >= 4 && c <= 12) tile = T.BUILDING;
                if (r === 33 && c >= 4 && c <= 12) tile = T.WALL;
                // House door
                if (r === 33 && c >= 7 && c <= 9) tile = T.DOOR;

                // --- Small shop (bottom-middle) ---
                if (r >= 24 && r <= 26 && c >= 16 && c <= 22) tile = T.ROOF;
                if (r >= 27 && r <= 32 && c >= 16 && c <= 22) tile = T.BUILDING;
                if (r === 33 && c >= 16 && c <= 22) tile = T.WALL;

                map[r][c] = tile;
            }
        }

        this.tileMap = map;
        this.solidTiles = new Set([T.BUILDING, T.WALL, T.ROOF]);
    },

    _buildInteractables() {
        this.interactables = [
            // Bus stop (right side of road)
            {
                x: 27 * 16 + 8,
                y: 17 * 16 + 8,
                type: 'busStop',
                action: () => {
                    SceneManager.switchScene('loading', { destination: 'farm' });
                }
            },
            // Bunny's house door
            {
                x: 8 * 16 + 8,
                y: 33 * 16 + 8,
                type: 'door',
                action: () => {
                    SceneManager.switchScene('room', { from: 'city' });
                }
            },
            // TAX building entrance - deducts 1 carrot as tax
            {
                x: 9 * 16 + 8,
                y: 15 * 16 + 8,
                type: 'taxBuilding',
                action: () => {
                    if (Inventory.carrots > 0) {
                        Inventory.removeCarrots(1);
                        UI.showSpeechBubble('세금 납부! 당근 -1', 9 * 16 + 8, 14 * 16, 3);
                    } else {
                        UI.showSpeechBubble('당근이 없어서 세금을 못 냅니다!', 9 * 16 + 8, 14 * 16, 3);
                    }
                }
            }
        ];

        // NPC interactables
        for (const npc of this.npcs) {
            this.interactables.push(NPC.makeInteractable(npc));
        }
    },

    _initNPCs() {
        this.npcs = [
            NPC.create(15 * 16, 16 * 16, '시민 토끼'),
            NPC.create(14 * 16, 22 * 16, '아기 토끼'),
            NPC.create(40 * 16, 16 * 16, '경비 토끼'),
            NPC.create(14 * 16, 34 * 16, '상인 토끼'),
        ];
        // Bounds per NPC - keep them in safe sidewalk/road areas
        // 시민 토끼: upper sidewalk area
        this.npcs[0].bounds = { minX: 2 * 16, minY: 16 * 16, maxX: 23 * 16, maxY: 17 * 16 };
        // 아기 토끼: middle sidewalk between buildings
        this.npcs[1].bounds = { minX: 2 * 16, minY: 21 * 16, maxX: 23 * 16, maxY: 23 * 16 };
        // 경비 토끼: right side near bus stop
        this.npcs[2].bounds = { minX: 27 * 16, minY: 16 * 16, maxX: 29 * 16, maxY: 17 * 16 };
        // 상인 토끼: bottom sidewalk
        this.npcs[3].bounds = { minX: 2 * 16, minY: 34 * 16, maxX: 23 * 16, maxY: 35 * 16 };
    },

    onEnter(data) {
        this._buildMap();

        if (this.npcs.length === 0) {
            this._initNPCs();
        }

        this._buildInteractables();

        if (data && data.x !== undefined) {
            Player.setPosition(data.x, data.y);
        } else {
            Player.setPosition(400, 450);
        }
    },

    onExit() {},

    update(dt) {
        if (Inventory.isOverlayOpen()) {
            Inventory.update();
            return;
        }
        Inventory.update();

        Player.update(dt, this.tileMap, this.solidTiles);
        Interaction.check(this.interactables);
        UI.update(dt);

        // Update NPCs
        for (const npc of this.npcs) {
            NPC.updateOne(npc, dt, this.tileMap, this.solidTiles);
        }
    },

    render(ctx) {
        const T = this.T;

        // Draw tile map
        for (let r = 0; r < this.MAP_ROWS; r++) {
            for (let c = 0; c < this.MAP_COLS; c++) {
                const tile = this.tileMap[r][c];
                const tileName = this.tileNames[tile];
                TileSprites.draw(ctx, tileName, c * 16, r * 16);
            }
        }

        // Draw object overlays
        // Bus stop sign
        ObjectSprites.draw(ctx, 'busStop', 27 * 16, 16 * 16);

        // TAX sign on building
        ObjectSprites.draw(ctx, 'taxSign', 6 * 16, 7 * 16);

        // House door
        ObjectSprites.draw(ctx, 'door', 7 * 16 + 8, 33 * 16);

        // Trees along edges
        for (let i = 0; i < 48; i += 6) {
            ObjectSprites.draw(ctx, 'tree', i * 16, 0);
            ObjectSprites.draw(ctx, 'tree', i * 16, 36 * 16);
        }

        // Draw NPCs
        for (const npc of this.npcs) {
            NPC.renderOne(ctx, npc);
        }

        // Draw player
        Player.render(ctx);

        // Draw UI
        UI.render(ctx);
    }
};
