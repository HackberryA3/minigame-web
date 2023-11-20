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
        this._slot = slot;
        this._element = element;
        this._defaultAnimDuration = (_b = (_a = element.getAnimations()[0].effect) === null || _a === void 0 ? void 0 : _a.getTiming()) === null || _b === void 0 ? void 0 : _b.duration;
        this._defaultAnimDelay = (_d = (_c = element.getAnimations()[0].effect) === null || _c === void 0 ? void 0 : _c.getTiming()) === null || _d === void 0 ? void 0 : _d.delay;
        // このアニメーションを使い回すためにidをつける
        element.getAnimations()[0].id = 'reel';
    }
    get element() { return this._element; }
    getPlayback() {
        var _a;
        const anim = this._element.getAnimations().filter(anim => anim.id === 'reel')[0];
        return ((_a = anim.currentTime) === null || _a === void 0 ? void 0 : _a.valueOf()) - this._defaultAnimDelay;
    }
    getPlaybackRate() {
        return this.getPlayback() % this._defaultAnimDuration / this._defaultAnimDuration;
    }
    setPlaybackRate(playbackRate) {
        const anim = this._element.getAnimations().filter(anim => anim.id === 'reel')[0];
        const time = this._defaultAnimDuration * playbackRate;
        // アニメーションが適用されないことがあるので、requestAnimationFrameで呼び出す
        requestAnimationFrame(() => setPlaybackRateCore(anim, time));
        // この関数はrequestAnimationFrameの中で呼ばれることを想定している
        function setPlaybackRateCore(anim, time) {
            anim.currentTime = time;
        }
    }
    start() {
        var _a;
        // クラスを変えると謎のアニメーションが追加され、pause()されていたアニメーションと2つになるので、アニメーションをキャンセルする
        this._element.getAnimations().filter(anim => anim.id !== 'reel').forEach(anim => anim.cancel());
        (_a = this._element.getAnimations().filter(anim => anim.id === 'reel')[0]) === null || _a === void 0 ? void 0 : _a.play();
    }
    stop() {
        var _a;
        (_a = this._element.getAnimations().filter(anim => anim.id === 'reel')[0]) === null || _a === void 0 ? void 0 : _a.pause();
    }
    waitUntil(playbackRate = 0.5) {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.getPlaybackRate() < playbackRate) {
                yield new Promise(resolve => setTimeout(resolve, 10));
            }
            return (this.getPlayback() + this._defaultAnimDelay) % this._defaultAnimDuration / this._defaultAnimDuration - (this.getPlaybackRate() - playbackRate);
        });
    }
}
export class Slot {
    constructor(slot) {
        this._current = null;
        this._isRunning = false;
        this._slot = slot;
        this._elements = Array.from(slot.getElementsByClassName('element')).map(element => new SlotElement(this, element));
        this.stop();
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
                const elementRate = element.getPlaybackRate();
                const nearestRate = (_a = nearest === null || nearest === void 0 ? void 0 : nearest.getPlaybackRate()) !== null && _a !== void 0 ? _a : Number.MAX_VALUE;
                if (elementRate <= 0.5 && Math.abs(elementRate - 0.5) < Math.abs(nearestRate - 0.5)) {
                    nearest = element;
                }
            }
            const rate = (_b = yield (nearest === null || nearest === void 0 ? void 0 : nearest.waitUntil())) !== null && _b !== void 0 ? _b : 0;
            this._elements.forEach(element => element.stop());
            this._elements.forEach(element => element.setPlaybackRate(rate));
            this._current = nearest;
            this._isRunning = false;
        });
    }
}
