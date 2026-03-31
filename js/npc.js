// NPC System - wandering rabbits with dialogue
const NPC = {
    // Dialogue options for NPCs
    dialogues: [
        '당근 좋아! 🥕',
        '오늘 날씨 좋다~',
        '여기 살기 좋아!',
        '안녕! 반가워!',
        '깡충깡충~',
        '배고프다...',
        '산책 중이야~',
        '뭐 하고 있어?',
        '당근 많이 모았어?',
        '조심해서 다녀!',
        '버스 타봤어?',
        '좋은 하루 보내!',
    ],

    // Create an NPC instance
    create(x, y, name) {
        return {
            x: x,
            y: y,
            name: name || 'NPC 토끼',
            direction: 'down',
            animFrame: 0,
            animTimer: 0,
            // Wandering AI
            moveTimer: 0,
            moveInterval: 2 + Math.random() * 3, // seconds between moves
            moveDuration: 0,
            moveDir: { dx: 0, dy: 0 },
            isMoving: false,
            speed: 0.8,
            // Boundaries (set per scene)
            bounds: { minX: 0, minY: 0, maxX: 780, maxY: 580 },
            // Dialogue
            lastDialogue: '',
        };
    },

    // Update a single NPC
    updateOne(npc, dt, tileMap, solidTiles) {
        // Animation
        if (npc.isMoving) {
            npc.animTimer += dt;
            if (npc.animTimer >= 0.2) {
                npc.animTimer -= 0.2;
                npc.animFrame = (npc.animFrame + 1) % 2;
            }
        } else {
            npc.animFrame = 0;
        }

        // Wandering AI
        npc.moveTimer += dt;

        if (npc.isMoving) {
            npc.moveDuration -= dt;
            if (npc.moveDuration <= 0) {
                npc.isMoving = false;
                npc.moveTimer = 0;
                npc.moveInterval = 1.5 + Math.random() * 3;
                return;
            }

            const nx = npc.x + npc.moveDir.dx * npc.speed;
            const ny = npc.y + npc.moveDir.dy * npc.speed;

            // Boundary check
            if (nx >= npc.bounds.minX && nx <= npc.bounds.maxX &&
                ny >= npc.bounds.minY && ny <= npc.bounds.maxY) {
                // Simple tile collision check
                const tileX = Math.floor((nx + 8) / 16);
                const tileY = Math.floor((ny + 20) / 16);
                if (tileMap && tileMap[tileY] && tileMap[tileY][tileX] !== undefined) {
                    if (!solidTiles || !solidTiles.has(tileMap[tileY][tileX])) {
                        npc.x = nx;
                        npc.y = ny;
                    } else {
                        npc.isMoving = false;
                    }
                } else {
                    npc.isMoving = false;
                }
            } else {
                npc.isMoving = false;
            }
        } else if (npc.moveTimer >= npc.moveInterval) {
            // Start new random movement
            const dirs = [
                { dx: 0, dy: -1, dir: 'up' },
                { dx: 0, dy: 1, dir: 'down' },
                { dx: -1, dy: 0, dir: 'left' },
                { dx: 1, dy: 0, dir: 'right' },
            ];
            const chosen = dirs[Math.floor(Math.random() * dirs.length)];
            npc.moveDir = { dx: chosen.dx, dy: chosen.dy };
            npc.direction = chosen.dir;
            npc.isMoving = true;
            npc.moveDuration = 0.5 + Math.random() * 1.5;
        }
    },

    // Render a single NPC (uses player sprites as base, tinted)
    renderOne(ctx, npc) {
        const sprite = PlayerSprites.getSprite('char', npc.direction, npc.animFrame);
        ctx.save();
        // Draw NPC at 2x scale like player
        ctx.drawImage(sprite, 0, 0, 16, 16, npc.x, npc.y, 32, 32);
        // Tint overlay to distinguish from player (pinkish)
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff88cc';
        ctx.fillRect(npc.x, npc.y, 32, 32);
        ctx.globalAlpha = 1;

        // Name tag
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '8px monospace';
        const nameW = ctx.measureText(npc.name).width;
        ctx.fillRect(npc.x + 16 - nameW / 2 - 2, npc.y - 10, nameW + 4, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(npc.name, npc.x + 16 - nameW / 2, npc.y - 2);
        ctx.restore();
    },

    // Get random dialogue
    getDialogue() {
        return this.dialogues[Math.floor(Math.random() * this.dialogues.length)];
    },

    // Create interactable for an NPC
    makeInteractable(npc) {
        return {
            get x() { return npc.x + 16; },
            get y() { return npc.y + 16; },
            type: 'npc',
            action: () => {
                const text = NPC.getDialogue();
                npc.lastDialogue = text;
                UI.showSpeechBubble(text, npc.x + 16, npc.y, 3);
            }
        };
    }
};
