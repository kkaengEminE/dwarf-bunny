// Title Scene - start screen with Start and Settings buttons
const TitleScene = {
    starPositions: [],
    bunnyFrame: 0,
    bunnyTimer: 0,

    // Button rects
    startBtn: { x: 300, y: 340, w: 200, h: 50 },
    settingsBtn: { x: 300, y: 405, w: 200, h: 50 },
    loreBtn: { x: 300, y: 470, w: 200, h: 50 },

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
        if (Input.clickedInRect(this.loreBtn)) {
            SceneManager.switchScene('lore');
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

        // Lore button
        this._drawButton(ctx, this.loreBtn, '드워프 토끼란?', '#775544', '#886655');

        // Footer
        ctx.fillStyle = '#555566';
        ctx.font = '10px monospace';
        ctx.fillText('이동: 방향키 | Space: 모드전환 | Z: 상호작용 | I: 인벤토리 | C: 스탯', Game.width / 2, 540);

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

// Lore Scene - about dwarf bunnies with images
const LoreScene = {
    backBtn: { x: 15, y: 15, w: 40, h: 36 },
    img1: null,
    img2: null,
    img1Loaded: false,
    img2Loaded: false,

    onEnter() {
        // Load images if not already loaded
        if (!this.img1) {
            this.img1 = new Image();
            this.img1.onload = () => { this.img1Loaded = true; };
            this.img1.src = '드토1.jpg';
        }
        if (!this.img2) {
            this.img2 = new Image();
            this.img2.onload = () => { this.img2Loaded = true; };
            this.img2.src = '드토2.jpg';
        }
    },
    onExit() {},

    update(dt) {
        if (Input.clickedInRect(this.backBtn)) {
            SceneManager.switchScene('title');
        }
    },

    render(ctx) {
        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, Game.height);
        grad.addColorStop(0, '#1a0f0a');
        grad.addColorStop(1, '#2a1a10');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Game.width, Game.height);

        // Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffcc66';
        ctx.font = 'bold 26px monospace';
        ctx.fillText('🐰 드워프 토끼란?', Game.width / 2, 50);

        // Divider
        ctx.strokeStyle = '#554433';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(100, 65);
        ctx.lineTo(700, 65);
        ctx.stroke();

        // Description
        ctx.font = '13px monospace';
        const lines = [
            '드워프 토끼(Dwarf Rabbit)는 몸집이 매우 작은 토끼 품종입니다.',
            '성체가 되어도 1~2kg 정도로, 손바닥 위에 올라갈 만큼 작아요.',
            '둥글고 납작한 얼굴, 짧은 귀, 동글동글한 몸이 특징이며',
            '성격이 호기심 많고 활발해서 반려동물로 인기가 높습니다.',
            '',
            '네덜란드 드워프, 홀랜드 롭 등 다양한 품종이 있으며,',
            '평균 수명은 7~12년 정도입니다. 당근을 아주 좋아해요! 🥕',
        ];

        let y = 95;
        for (const line of lines) {
            ctx.fillStyle = line === '' ? 'transparent' : '#ccbb99';
            ctx.fillText(line, Game.width / 2, y);
            y += 22;
        }

        y += 10;

        // Images side by side
        const imgW = 200;
        const imgH = 200;
        const gap = 40;
        const totalW = imgW * 2 + gap;
        const startX = (Game.width - totalW) / 2;

        // Image 1
        if (this.img1Loaded && this.img1) {
            // Frame
            ctx.fillStyle = '#443322';
            ctx.fillRect(startX - 4, y - 4, imgW + 8, imgH + 8);
            ctx.strokeStyle = '#aa8855';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX - 4, y - 4, imgW + 8, imgH + 8);
            ctx.drawImage(this.img1, startX, y, imgW, imgH);
            // Label
            ctx.fillStyle = '#aa8855';
            ctx.font = '11px monospace';
            ctx.fillText('드토 1', startX + imgW / 2, y + imgH + 20);
        } else {
            ctx.fillStyle = '#333322';
            ctx.fillRect(startX, y, imgW, imgH);
            ctx.fillStyle = '#888866';
            ctx.font = '12px monospace';
            ctx.fillText('로딩 중...', startX + imgW / 2, y + imgH / 2);
        }

        // Image 2
        const img2X = startX + imgW + gap;
        if (this.img2Loaded && this.img2) {
            ctx.fillStyle = '#443322';
            ctx.fillRect(img2X - 4, y - 4, imgW + 8, imgH + 8);
            ctx.strokeStyle = '#aa8855';
            ctx.lineWidth = 2;
            ctx.strokeRect(img2X - 4, y - 4, imgW + 8, imgH + 8);
            ctx.drawImage(this.img2, img2X, y, imgW, imgH);
            ctx.fillStyle = '#aa8855';
            ctx.font = '11px monospace';
            ctx.fillText('드토 2', img2X + imgW / 2, y + imgH + 20);
        } else {
            ctx.fillStyle = '#333322';
            ctx.fillRect(img2X, y, imgW, imgH);
            ctx.fillStyle = '#888866';
            ctx.font = '12px monospace';
            ctx.fillText('로딩 중...', img2X + imgW / 2, y + imgH / 2);
        }

        // Back arrow button (top-left)
        this._renderBackArrow(ctx);

        ctx.textAlign = 'left';
    },

    _renderBackArrow(ctx) {
        const btn = this.backBtn;
        const isHover = Input.mouseX >= btn.x && Input.mouseX <= btn.x + btn.w &&
                         Input.mouseY >= btn.y && Input.mouseY <= btn.y + btn.h;
        ctx.fillStyle = isHover ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = isHover ? '#ffffff' : '#888888';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

        // Arrow <
        ctx.fillStyle = isHover ? '#ffffff' : '#aaaaaa';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('\u2190', btn.x + btn.w / 2, btn.y + btn.h / 2 + 7);
    }
};

// Settings Scene - game info + key guide
const SettingsScene = {
    backBtn: { x: 15, y: 15, w: 40, h: 36 },
    scrollY: 0,

    onEnter() {
        this.scrollY = 0;
    },
    onExit() {},

    update(dt) {
        if (Input.clickedInRect(this.backBtn)) {
            SceneManager.switchScene('title');
        }
    },

    render(ctx) {
        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, Game.height);
        grad.addColorStop(0, '#0a0a2e');
        grad.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Game.width, Game.height);

        // Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffcc66';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('게임 소개 & 조작법', Game.width / 2, 45);

        // Divider
        ctx.strokeStyle = '#444466';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(100, 58);
        ctx.lineTo(700, 58);
        ctx.stroke();

        // Game intro
        ctx.fillStyle = '#ccccdd';
        ctx.font = '13px monospace';
        const introLines = [
            '🐰 Dwarf Bunny: Between Carrots and Concrete',
            '',
            '당신은 작은 토끼! 농장에서 당근을 수확하고,',
            '도시에서 세금을 내며, 집에 당근을 보관하세요.',
            '버스를 타고 농장과 도시를 오갈 수 있습니다.',
            '농장의 당근은 버스를 타고 돌아오면 다시 자랍니다.',
            'NPC 토끼들에게 말을 걸어보세요!',
        ];

        let y = 85;
        for (const line of introLines) {
            ctx.fillStyle = line.startsWith('🐰') ? '#ffcc66' : '#aaaacc';
            ctx.fillText(line, Game.width / 2, y);
            y += 20;
        }

        // Divider
        y += 5;
        ctx.strokeStyle = '#444466';
        ctx.beginPath();
        ctx.moveTo(100, y);
        ctx.lineTo(700, y);
        ctx.stroke();
        y += 20;

        // Key guide title
        ctx.fillStyle = '#88bbff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('조작법', Game.width / 2, y);
        y += 28;

        // Key bindings
        ctx.font = '12px monospace';
        const keys = [
            { key: '방향키 / WASD', desc: '이동' },
            { key: 'Space', desc: '캐릭터 모드 / 동물 모드 전환' },
            { key: 'Z / Enter', desc: '상호작용 (NPC 대화, 문 열기, 수확 등)' },
            { key: 'I', desc: '인벤토리 열기/닫기' },
            { key: 'C', desc: '토끼 스탯 확인 (레벨, 공격력 등)' },
            { key: 'Q', desc: '창고에 당근 넣기 (창고 열린 상태)' },
            { key: 'R', desc: '창고에서 당근 빼기 (창고 열린 상태)' },
        ];

        for (const item of keys) {
            // Key box
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            const keyW = ctx.measureText(item.key).width + 16;
            ctx.fillRect(Game.width / 2 - 280, y - 12, keyW, 18);
            ctx.strokeStyle = '#556688';
            ctx.strokeRect(Game.width / 2 - 280, y - 12, keyW, 18);

            ctx.fillStyle = '#ffdd88';
            ctx.textAlign = 'left';
            ctx.fillText(item.key, Game.width / 2 - 272, y);

            ctx.fillStyle = '#aaaacc';
            ctx.fillText(item.desc, Game.width / 2 - 280 + keyW + 12, y);
            ctx.textAlign = 'center';

            y += 26;
        }

        // Tips
        y += 8;
        ctx.strokeStyle = '#444466';
        ctx.beginPath();
        ctx.moveTo(100, y);
        ctx.lineTo(700, y);
        ctx.stroke();
        y += 20;

        ctx.fillStyle = '#88ff88';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('💡 팁', Game.width / 2, y);
        y += 22;

        ctx.font = '11px monospace';
        ctx.fillStyle = '#99aa99';
        const tips = [
            '• 도시 TAX 건물에 가면 당근 1개가 세금으로 빠집니다',
            '• 농장과 도시의 집에는 각각 별도의 창고가 있습니다',
            '• 농장의 잠긴 집은 레벨 5 이상일 때 들어갈 수 있습니다',
        ];
        for (const tip of tips) {
            ctx.fillText(tip, Game.width / 2, y);
            y += 18;
        }

        // Back arrow button (top-left)
        this._renderBackArrow(ctx);

        ctx.textAlign = 'left';
    },

    _renderBackArrow(ctx) {
        const btn = this.backBtn;
        const isHover = Input.mouseX >= btn.x && Input.mouseX <= btn.x + btn.w &&
                         Input.mouseY >= btn.y && Input.mouseY <= btn.y + btn.h;
        ctx.fillStyle = isHover ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = isHover ? '#ffffff' : '#888888';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

        ctx.fillStyle = isHover ? '#ffffff' : '#aaaaaa';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('\u2190', btn.x + btn.w / 2, btn.y + btn.h / 2 + 7);
    }
};
