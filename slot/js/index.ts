import { Slot } from './slot.js';
declare const confetti: any;

const rolls = [
	'🍒',
	'🍉',
	'7',
	'☠️',
	'🍒',
	'🍓',
	'🍒',
	'🍎',
]
const badRolls = [
	'☠️',
	'☠️',
	'☠️',
	'☠️',
	'☠️',
	'☠️',
	'☠️',
	'7',
]

const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const stopBtns = Array.from(document.getElementById('stopBtns')?.getElementsByClassName('stopBtn') as HTMLCollectionOf<HTMLButtonElement>);

const slotParent = document.getElementById('slots') as HTMLElement;
const slots = Array.from(slotParent.getElementsByClassName('slot') as HTMLCollectionOf<HTMLElement>).map(slot => new Slot(slot, rolls));

startBtn.addEventListener('click', startGame);

stopBtns.forEach((btn, i) => {
	// Initialize
	btn.disabled = true;

	// Event
	btn.addEventListener('click', async () => {
		stopBtns.forEach(btn => btn.disabled = true);
		await slots[i].stop();
		getRunningSlots().forEach(running => {
			slots.forEach((slot, i) => {
				if (running === slot)
					stopBtns[i].disabled = false;
			});
		});

		if (checkLose()) {
			getStoppedSlots().forEach(slot => slot.current?.element.classList.add('lose'));
			endGame();
			return;
		}

		if (isLastOne() && !checkLose()) {
			getStoppedSlots().forEach(slot => slot.current?.element.classList.add('lastOne'));
			return;
		}

		if (slots.every(slot => !slot.isRunning)) {
			const isWin = checkWin();
			if (isWin) {
				const reward = calcReward(slots[0].current?.element.textContent ?? '');
				if (0 < reward) {
					getStoppedSlots().forEach(slot => slot.current?.element.classList.add('win'));
					showConfetti(2);
				}
				else
				{
					getStoppedSlots().forEach(slot => slot.current?.element.classList.add('bad'));
				}
				await setCoin(currentCoin() + reward, 1);
			}

			endGame();
			return;
		}

		if (slots[i].current?.element.textContent === '☠️') {
			stopBtns.forEach(btn => btn.disabled = true);
			while (1 < getRunningSlots().length) {
				await getRunningSlots()[0].stopAt('☠️');
			}
			getRunningSlots()[0].setRolls(badRolls);
			getRunningSlots().forEach(running => {
				slots.forEach((slot, i) => {
					if (running === slot)
						stopBtns[i].disabled = false;
				});
			});

			getStoppedSlots().forEach(slot => slot.current?.element.classList.add('bad'));
		}
	});
});

function checkWin() {
	const element = slots[0].current?.element.textContent;
	return slots.every(slot => slot.current?.element.textContent === element)
}
function checkLose() {
	const stopped = getStoppedSlots();
	const element = stopped[0].current?.element.textContent;
	return stopped.some(slot => slot.current?.element.textContent !== element);
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
async function endGame() {
	stopBtns.forEach(btn => {
		btn.disabled = true;
	});

	await new Promise(resolve => setTimeout(resolve, 1500));

	// console.log(getStoppedSlots().map(slot => slot.current?.element.getAnimations()));
	getStoppedSlots().forEach(slot => slot.current?.element.classList.remove('lastOne'));
	getStoppedSlots().forEach(slot => slot.current?.element.classList.remove('win'));
	getStoppedSlots().forEach(slot => slot.current?.element.classList.remove('lose'));
	getStoppedSlots().forEach(slot => slot.current?.element.classList.remove('bad'));
	// console.log(getStoppedSlots().map(slot => slot.current?.element.getAnimations()));

	// バッドチャンスをリセットする
	slots.forEach(slot => {
		if(slot.rolls === badRolls)
			slot.setRolls(rolls);
	});

	startBtn.disabled = false;
}

async function showConfetti(sec: number) {
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

	await new Promise(resolve => setTimeout(resolve, sec * 1000));
}



/* Coin */
const coinElement = document.getElementById('coin') as HTMLElement;
function currentCoin() {
	return Number(coinElement.textContent);
}

async function setCoin(coin: number, sec: number) {
	const current = currentCoin();
	const diff = coin - current;
	const frame = 50;
	const step = diff / sec / (1000 / frame);

	for (let i = 1; i <= sec * (1000 / frame); i++) {
		coinElement.textContent = (current + step * i).toFixed(0);
		await new Promise(resolve => setTimeout(resolve, frame));
	}
}

function calcReward(roll: string) {
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