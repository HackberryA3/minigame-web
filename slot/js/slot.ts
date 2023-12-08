export class SlotElement {
	constructor(slot: Slot, element: HTMLElement) {
		this._slot = slot;
		this._element = element;

		this._defaultAnimDuration = element.getAnimations()[0].effect?.getTiming()?.duration as number;
		this._defaultAnimDelay = element.getAnimations()[0].effect?.getTiming()?.delay as number;
		// このアニメーションを使い回すためにidをつける
		element.getAnimations()[0].id = 'reel';

		// コールバック
		(function callback(_this: SlotElement) {
			let prevProg = 0;
			setInterval(() => {
				if (0.95 < prevProg && _this.getProgress() < 0.05) {
					_this.onended();
				}
				prevProg = _this.getProgress();
			}, 10);
		})(this);
	}

	private _slot: Slot;
	private _element: HTMLElement;
	public get element() { return this._element; }

	private _defaultAnimDuration: number;
	private _defaultAnimDelay: number;

	public onended: () => void = () => { };

	public getPlayback() {
		const anim = this._element.getAnimations().filter(anim => anim.id === 'reel')[0];
		return anim.currentTime?.valueOf() as number - this._defaultAnimDelay;
	}
	public getProgress() {
		return this.getPlayback() % this._defaultAnimDuration / this._defaultAnimDuration;
	}
	public setProgress(progress: number) {
		const anim = this._element.getAnimations().filter(anim => anim.id === 'reel')[0];
		const time = this._defaultAnimDuration * progress;
		// アニメーションが適用されないことがあるので、requestAnimationFrameで呼び出す
		requestAnimationFrame(() => setProgressCore(anim, time));

		// この関数はrequestAnimationFrameの中で呼ばれることを想定している
		function setProgressCore(anim: Animation, time: number) {
			anim.currentTime = time;
		}
	}

	public start() {
		this._element.getAnimations().filter(anim => anim.id === 'reel')[0]?.play();
	}
	public stop() {
		this._element.getAnimations().filter(anim => anim.id === 'reel')[0]?.pause();
	}

	public async waitUntil(playbackRate: number = 0.5) {
		while (this.getProgress() < playbackRate) {
			await new Promise(resolve => setTimeout(resolve, 10));
		}

		return (this.getPlayback() + this._defaultAnimDelay) % this._defaultAnimDuration / this._defaultAnimDuration - (this.getProgress() - playbackRate);
	}
}

export class Slot {
	constructor(slot: HTMLElement, rolls: string[]) {
		this._slot = slot;
		this._elements = Array.from(slot.getElementsByClassName('element') as HTMLCollectionOf<HTMLElement>).map(element => new SlotElement(this, element));
		this._rolls = rolls;

		// 下の方が先に回るため、逆順で初期化する
		this.setRolls(rolls);
		this._elements.forEach(element => {
			element.onended = () => {
				element.element.textContent = this.nextRoll();
			}
		});
		this.stop();
	}

	private _slot: HTMLElement;
	private _elements: SlotElement[];

	private _rolls: string[];
	public get rolls() { return this._rolls; }
	private _rollIndex: number = 0;
	private nextRoll() {
		this._rollIndex = (this._rollIndex + 1) % this._rolls.length;
		return this._rolls[this._rollIndex];
	}
	public setRolls(rolls: string[]) {
		this._rolls = rolls;
		this._rollIndex = 0;
		this._elements.reverse().forEach(element => {
			element.element.textContent = this.nextRoll();
		});
	}

	private _current: SlotElement | null = null;
	public get current() { return this._current; }

	private _isRunning: boolean = false;
	public get isRunning() { return this._isRunning; }

	public start() {
		this._elements.forEach(element => element.start());
		this._isRunning = true;
	}
	public async stop() {
		let nearest: SlotElement | null = null;
		for (const element of this._elements) {
			const elementProg = element.getProgress();
			const nearestProg = nearest?.getProgress() ?? Number.MAX_VALUE;
			if (elementProg <= 0.5 && Math.abs(elementProg - 0.5) < Math.abs(nearestProg - 0.5)) {
				nearest = element;
			}
		}

		const prog = await nearest?.waitUntil() ?? 0;
		this._elements.forEach(element => element.stop());
		this._elements.forEach(element => element.setProgress(prog));

		this._current = nearest;
		this._isRunning = false;
	}
	public async stopAt(roll: string) {
		while (!this._elements.some(element => element.element.textContent === roll && 0.05 < element.getProgress() && element.getProgress() < 0.4)) {
			await new Promise(resolve => setTimeout(resolve, 10));
		}

		const target = this._elements.filter(element => element.element.textContent === roll)[0];

		const prog = await target.waitUntil();
		this._elements.forEach(element => element.stop());
		this._elements.forEach(element => element.setProgress(prog));

		this._current = target;
		this._isRunning = false;
	}
}