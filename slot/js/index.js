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
const rolls = [
    '🍒',
    '🍉',
    '7',
    '☠️',
    '🍒',
    '🍓',
    '🍒',
    '🍎',
];
const badRolls = [
    '☠️',
    '☠️',
    '☠️',
    '☠️',
    '☠️',
    '☠️',
    '☠️',
    '7',
];
const startBtn = document.getElementById('startBtn');
const stopBtns = Array.from((_a = document.getElementById('stopBtns')) === null || _a === void 0 ? void 0 : _a.getElementsByClassName('stopBtn'));
const slotParent = document.getElementById('slots');
const slots = Array.from(slotParent.getElementsByClassName('slot')).map(slot => new Slot(slot, rolls));
startBtn.addEventListener('click', startGame);
stopBtns.forEach((btn, i) => {
    // Initialize
    btn.disabled = true;
    // Event
    btn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        stopBtns.forEach(btn => btn.disabled = true);
        yield slots[i].stop();
        getRunningSlots().forEach(running => {
            slots.forEach((slot, i) => {
                if (running === slot)
                    stopBtns[i].disabled = false;
            });
        });
        if (checkLose()) {
            getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.add('lose'); });
            endGame();
            return;
        }
        if (isLastOne() && !checkLose()) {
            getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.add('lastOne'); });
            return;
        }
        if (slots.every(slot => !slot.isRunning)) {
            const isWin = checkWin();
            if (isWin) {
                const reward = calcReward((_b = (_a = slots[0].current) === null || _a === void 0 ? void 0 : _a.element.textContent) !== null && _b !== void 0 ? _b : '');
                if (0 < reward) {
                    getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.add('win'); });
                    showConfetti(2);
                }
                else {
                    getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.add('bad'); });
                }
                yield setCoin(currentCoin() + reward, 1);
            }
            endGame();
            return;
        }
        if (((_c = slots[i].current) === null || _c === void 0 ? void 0 : _c.element.textContent) === '☠️') {
            stopBtns.forEach(btn => btn.disabled = true);
            while (1 < getRunningSlots().length) {
                yield getRunningSlots()[0].stopAt('☠️');
            }
            getRunningSlots()[0].setRolls(badRolls);
            getRunningSlots().forEach(running => {
                slots.forEach((slot, i) => {
                    if (running === slot)
                        stopBtns[i].disabled = false;
                });
            });
            getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.add('bad'); });
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
function isLastOne() {
    return getStoppedSlots().length === slots.length - 1;
}
function getStoppedSlots() {
    return slots.filter(slot => !slot.isRunning);
}
function getRunningSlots() {
    return slots.filter(slot => slot.isRunning);
}
function startGame() {
    startBtn.disabled = true;
    slots.forEach(slot => slot.start());
    stopBtns.forEach(btn => {
        btn.disabled = false;
    });
    setCoin(currentCoin() - 100, 0.5);
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
        getStoppedSlots().forEach(slot => { var _a; return (_a = slot.current) === null || _a === void 0 ? void 0 : _a.element.classList.remove('bad'); });
        // console.log(getStoppedSlots().map(slot => slot.current?.element.getAnimations()));
        // バッドチャンスをリセットする
        slots.forEach(slot => {
            if (slot.rolls === badRolls)
                slot.setRolls(rolls);
        });
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
/* Coin */
const coinElement = document.getElementById('coin');
function currentCoin() {
    return Number(coinElement.textContent);
}
function setCoin(coin, sec) {
    return __awaiter(this, void 0, void 0, function* () {
        const current = currentCoin();
        const diff = coin - current;
        const frame = 50;
        const step = diff / sec / (1000 / frame);
        for (let i = 1; i <= sec * (1000 / frame); i++) {
            coinElement.textContent = (current + step * i).toFixed(0);
            yield new Promise(resolve => setTimeout(resolve, frame));
        }
    });
}
function calcReward(roll) {
    switch (roll) {
        case '🍒':
            return 100;
        case '🍓':
            return 150;
        case '🍉':
            return 200;
        case '🍎':
            return 400;
        case '7':
            return 777;
        case '☠️':
            return -Math.max(0, currentCoin() / 2);
        default:
            throw new Error("Invalid element");
    }
}
