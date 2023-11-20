import { Slot } from './slot.js';
declare const confetti: any;

const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const stopBtns = Array.from(document.getElementById('stopBtns')?.getElementsByClassName('stopBtn') as HTMLCollectionOf<HTMLButtonElement>);

const slotParent = document.getElementById('slots') as HTMLElement;
const slots = Array.from(slotParent.getElementsByClassName('slot') as HTMLCollectionOf<HTMLElement>).map(slot => new Slot(slot));

startBtn.addEventListener('click', startGame);

stopBtns.forEach((btn, i) => {
	// Initialize
	btn.disabled = true;

	// Event
	btn.addEventListener('click', async () => {
		btn.disabled = true;
		await slots[i].stop();

		if (checkLose()) {
			getStoppedSlots().forEach(slot => slot.current?.element.classList.add('lose'));
			endGame();
			return;
		}

		if (IsLastOne() && !checkLose()) {
			getStoppedSlots().forEach(slot => slot.current?.element.classList.add('lastOne'));
			return;
		}

		if (slots.every(slot => !slot.isRunning)) {
			const isWin = checkWin();
			if (isWin) {
				getStoppedSlots().forEach(slot => slot.current?.element.classList.add('win'));
				await showConfetti(2);
			}

			endGame();
			return;
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
async function endGame() {
	stopBtns.forEach(btn => {
		btn.disabled = true;
	});

	await new Promise(resolve => setTimeout(resolve, 1500));

	// console.log(getStoppedSlots().map(slot => slot.current?.element.getAnimations()));
	getStoppedSlots().forEach(slot => slot.current?.element.classList.remove('lastOne'));
	getStoppedSlots().forEach(slot => slot.current?.element.classList.remove('win'));
	getStoppedSlots().forEach(slot => slot.current?.element.classList.remove('lose'));
	// console.log(getStoppedSlots().map(slot => slot.current?.element.getAnimations()));
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