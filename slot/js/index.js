var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { Slot } from './slot.js';
const startBtn = document.getElementById('startBtn');
const stopBtns = Array.from((_a = document.getElementById('stopBtns')) === null || _a === void 0 ? void 0 : _a.getElementsByClassName('stopBtn'));
const slotParent = document.getElementById('slots');
const slots = Array.from(slotParent.getElementsByClassName('slot')).map(slot => new Slot(slot));
startBtn.addEventListener('click', startGame);
stopBtns.forEach((btn, i) => {
    // Initialize
    btn.disabled = true;
    // Event
    btn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        btn.disabled = true;
        yield slots[i].stop();
        if (checkLose()) {
            getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.add('lose'); });
            endGame();
            return;
        }
        if (IsLastOne() && !checkLose()) {
            getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.add('lastOne'); });
            return;
        }
        if (slots.every(slot => !slot.isRunning)) {
            const isWin = checkWin();
            if (isWin) {
                getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.add('win'); });
                yield showConfetti(2);
            }
            endGame();
            return;
        }
    }));
});
function checkWin() {
    var _a;
    const element = (_a = slots[0].current) === null || _a === void 0 ? void 0 : _a.element.textContent;
    return slots.every(slot => { var _a; return ((_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.textContent) === element; });
}
function checkLose() {
    var _a;
    const stopped = getStoppedSlots();
    const element = (_a = stopped[0].current) === null || _a === void 0 ? void 0 : _a.element.textContent;
    return stopped.some(slot => { var _a; return ((_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.textContent) !== element; });
}
function IsLastOne() {
    return getStoppedSlots().length === slots.length - 1;
}
function getStoppedSlots() {
    return slots.filter(slot => !slot.isRunning);
}
function startGame() {
    startBtn.disabled = true;
    slots.forEach(slot => slot.start());
    stopBtns.forEach(btn => {
        btn.disabled = false;
    });
}
function endGame() {
    return __awaiter(this, void 0, void 0, function* () {
        stopBtns.forEach(btn => {
            btn.disabled = true;
        });
        yield new Promise(resolve => setTimeout(resolve, 1500));
        // console.log(getStoppedSlots().map(slot => slot.current?.element.getAnimations()));
        getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.remove('lastOne'); });
        getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.remove('win'); });
        getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.remove('lose'); });
        // console.log(getStoppedSlots().map(slot => slot.current?.element.getAnimations()));
        startBtn.disabled = false;
    });
}
function showConfetti(sec) {
    return __awaiter(this, void 0, void 0, function* () {
        const end = Date.now() + sec * 1000;
        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.35 },
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.35 },
            });
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
        yield new Promise(resolve => setTimeout(resolve, sec * 1000));
    });
}
