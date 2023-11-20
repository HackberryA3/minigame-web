export class SlotElement {
	constructor(slot: Slot, element: HTMLElement) {
		this._slot = slot;
		this._element = element;

		this._defaultAnimDuration = element.getAnimations()[0].effect?.getTiming()?.duration as number;
		this._defaultAnimDelay = element.getAnimations()[0].effect?.getTiming()?.delay as number;
		// このアニメーションを使い回すためにidをつける
		element.getAnimations()[0].id = 'reel';
	}

	private _slot: Slot;
	private _element: HTMLElement;
	public get element() { return this._element; }

	private _defaultAnimDuration: number;
	private _defaultAnimDelay: number;

	public getPlayback() {
		const anim = this._element.getAnimations().filter(anim => anim.id === 'reel')[0];
		return anim.currentTime?.valueOf() as number - this._defaultAnimDelay;
	}
	public getPlaybackRate() {
		return this.getPlayback() % this._defaultAnimDuration / this._defaultAnimDuration;
	}
	public setPlaybackRate(playbackRate: number) {
		const anim = this._element.getAnimations().filter(anim => anim.id === 'reel')[0];
		const time = this._defaultAnimDuration * playbackRate;
		// アニメーションが適用されないことがあるので、requestAnimationFrameで呼び出す
		requestAnimationFrame(() => setPlaybackRateCore(anim, time));

		// この関数はrequestAnimationFrameの中で呼ばれることを想定している
		function setPlaybackRateCore(anim : Animation, time: number) {
			anim.currentTime = time;
		}
	}

	public start() {
		// クラスを変えると謎のアニメーションが追加され、pause()されていたアニメーションと2つになるので、アニメーションをキャンセルする
		this._element.getAnimations().filter(anim => anim.id !== 'reel').forEach(anim => anim.cancel());
		this._element.getAnimations().filter(anim => anim.id === 'reel')[0]?.play();
	}
	public stop() {
		this._element.getAnimations().filter(anim => anim.id === 'reel')[0]?.pause();
	}

	public async waitUntil(playbackRate: number = 0.5) {
		while (this.getPlaybackRate() < playbackRate) {
			await new Promise(resolve => setTimeout(resolve, 10));
		}

		return (this.getPlayback() + this._defaultAnimDelay) % this._defaultAnimDuration / this._defaultAnimDuration - (this.getPlaybackRate() - playbackRate);
	}
}

export class Slot {
	constructor(slot: HTMLElement) {
		this._slot = slot;
		this._elements = Array.from(slot.getElementsByClassName('element') as HTMLCollectionOf<HTMLElement>).map(element => new SlotElement(this, element));
		this.stop();
	}

	private _slot: HTMLElement;
	private _elements: SlotElement[];
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
			const elementRate = element.getPlaybackRate();
			const nearestRate = nearest?.getPlaybackRate() ?? Number.MAX_VALUE;
			if (elementRate <= 0.5 && Math.abs(elementRate - 0.5) < Math.abs(nearestRate - 0.5)) {
				nearest = element;
			}
		}

		const rate = await nearest?.waitUntil() ?? 0;
		this._elements.forEach(element => element.stop());
		this._elements.forEach(element => element.setPlaybackRate(rate));

		this._current = nearest;
		this._isRunning = false;
	}
}