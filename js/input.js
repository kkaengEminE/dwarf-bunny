// Input handler - tracks keyboard + mouse state
const Input = {
    keys: {},
    justPressed: {},
    _previousKeys: {},

    // Mouse state
    mouseX: 0,
    mouseY: 0,
    mouseClicked: false,

    init() {
        window.addEventListener('keydown', (e) => {
            e.preventDefault();
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => {
            e.preventDefault();
            this.keys[e.code] = false;
        });

        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
            this.mouseClicked = true;
        });
    },

    update() {
        for (const key in this.keys) {
            this.justPressed[key] = this.keys[key] && !this._previousKeys[key];
        }
        Object.assign(this._previousKeys, this.keys);
    },

    // Call at end of frame to reset click
    postUpdate() {
        this.mouseClicked = false;
    },

    isDown(code) {
        return !!this.keys[code];
    },

    wasPressed(code) {
        return !!this.justPressed[code];
    },

    // Check if click is inside a rect {x, y, w, h}
    clickedInRect(rect) {
        if (!this.mouseClicked) return false;
        return this.mouseX >= rect.x && this.mouseX <= rect.x + rect.w &&
               this.mouseY >= rect.y && this.mouseY <= rect.y + rect.h;
    }
};
