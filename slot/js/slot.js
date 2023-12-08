var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class SlotElement {
    constructor(slot, element) {
        var _a, _b, _c, _d;
        this.onended = () => { };
        this._slot = slot;
        this._element = element;
        this._defaultAnimDuration = (_b = (_a = element.getAnimations()[0].effect) === null || _a === void 0 ? void 0 : _a.getTiming()) === null || _b === void 0 ? void 0 : _b.duration;
        this._defaultAnimDelay = (_d = (_c = element.getAnimations()[0].effect) === null || _c === void 0 ? void 0 : _c.getTiming()) === null || _d === void 0 ? void 0 : _d.delay;
        // このアニメーションを使い回すためにidをつける
        element.getAnimations()[0].id = 'reel';
        // コールバック
        (function callback(_this) {
            let prevProg = 0;
            setInterval(() => {
                if (0.95 < prevProg && _this.getProgress() < 0.05) {
                    _this.onended();
                }
                prevProg = _this.getProgress();
            }, 10);
        })(this);
    }
    get element() { return this._element; }
    getPlayback() {
        var _a;
        const anim = this._element.getAnimations().filter(anim => anim.id === 'reel')[0];
        return ((_a = anim.currentTime) === null || _a === void 0 ? void 0 : _a.valueOf()) - this._defaultAnimDelay;
    }
    getProgress() {
        return this.getPlayback() % this._defaultAnimDuration / this._defaultAnimDuration;
    }
    setProgress(progress) {
        const anim = this._element.getAnimations().filter(anim => anim.id === 'reel')[0];
        const time = this._defaultAnimDuration * progress;
        // アニメーションが適用されないことがあるので、requestAnimationFrameで呼び出す
        requestAnimationFrame(() => setProgressCore(anim, time));
        // この関数はrequestAnimationFrameの中で呼ばれることを想定している
        function setProgressCore(anim, time) {
            anim.currentTime = time;
        }
    }
    start() {
        var _a;
        (_a = this._element.getAnimations().filter(anim => anim.id === 'reel')[0]) === null || _a === void 0 ? void 0 : _a.play();
    }
    stop() {
        var _a;
        (_a = this._element.getAnimations().filter(anim => anim.id === 'reel')[0]) === null || _a === void 0 ? void 0 : _a.pause();
    }
    waitUntil(playbackRate = 0.5) {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.getProgress() < playbackRate) {
                yield new Promise(resolve => setTimeout(resolve, 10));
            }
            return (this.getPlayback() + this._defaultAnimDelay) % this._defaultAnimDuration / this._defaultAnimDuration - (this.getProgress() - playbackRate);
        });
    }
}
export class Slot {
    constructor(slot, rolls) {
        this._rollIndex = 0;
        this._current = null;
        this._isRunning = false;
        this._slot = slot;
        this._elements = Array.from(slot.getElementsByClassName('element')).map(element => new SlotElement(this, element));
        this._rolls = rolls;
        // 下の方が先に回るため、逆順で初期化する
        this.setRolls(rolls);
        this._elements.forEach(element => {
            element.onended = () => {
                element.element.textContent = this.nextRoll();
            };
        });
        this.stop();
    }
    get rolls() { return this._rolls; }
    nextRoll() {
        this._rollIndex = (this._rollIndex + 1) % this._rolls.length;
        return this._rolls[this._rollIndex];
    }
    setRolls(rolls) {
        this._rolls = rolls;
        this._rollIndex = 0;
        this._elements.reverse().forEach(element => {
            element.element.textContent = this.nextRoll();
        });
    }
    get current() { return this._current; }
    get isRunning() { return this._isRunning; }
    start() {
        this._elements.forEach(element => element.start());
        this._isRunning = true;
    }
    stop() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let nearest = null;
            for (const element of this._elements) {
                const elementProg = element.getProgress();
                const nearestProg = (_a = nearest === null || nearest === void 0 ? void 0 : nearest.getProgress()) !== null && _a !== void 0 ? _a : Number.MAX_VALUE;
                if (elementProg <= 0.5 && Math.abs(elementProg - 0.5) < Math.abs(nearestProg - 0.5)) {
                    nearest = element;
                }
            }
            const prog = (_b = yield (nearest === null || nearest === void 0 ? void 0 : nearest.waitUntil())) !== null && _b !== void 0 ? _b : 0;
            this._elements.forEach(element => element.stop());
            this._elements.forEach(element => element.setProgress(prog));
            this._current = nearest;
            this._isRunning = false;
        });
    }
    stopAt(roll) {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this._elements.some(element => element.element.textContent === roll && element.getProgress() < 0.3)) {
                yield new Promise(resolve => setTimeout(resolve, 10));
            }
            const target = this._elements.filter(element => element.element.textContent === roll)[0];
            const prog = yield target.waitUntil();
            this._elements.forEach(element => element.stop());
            this._elements.forEach(element => element.setProgress(prog));
            this._current = target;
            this._isRunning = false;
        });
    }
}
