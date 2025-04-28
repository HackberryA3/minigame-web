const BASE_COLOR = '#363a4f';
const TEXT_COLOR = '#cad3f5';
const ACCENT_COLOR = '#8aadf4';
const ACCENT_COLOR2 = '#ed8796';

const DEG360 = Math.PI * 2;
const DEG90 = Math.PI / 2;
const DEG30 = Math.PI / 6;
const DEG6 = Math.PI / 30;

const FONT = 'Iceberg';

interface TimeProvider {
	getHours(): number;
	getMinutes(): number;
	getSeconds(): number;
	getMilliseconds(): number;
}
class ClockProvider implements TimeProvider {
	getHours(): number {
		return new Date().getHours();
	}
	getMinutes(): number {
		return new Date().getMinutes();
	}
	getSeconds(): number {
		return new Date().getSeconds();
	}
	getMilliseconds(): number {
		return new Date().getMilliseconds();
	}
}
class StopwatchProvider implements TimeProvider {
	private startTime: number | null = null;
	private stopTime: number | null = null;

	get elapsedMilliseconds(): number {
		if (this.startTime == null) {
			return 0;
		}
		return (this.stopTime ?? new Date().getTime()) - this.startTime;
	}

	start() {
		this.startTime = new Date().getTime();
		this.stopTime = null;
	}
	stop() {
		this.stopTime = new Date().getTime();
	}

	getHours(): number {
		return Math.floor(this.elapsedMilliseconds / 1000 / 60 / 60) % 24;
	}
	getMinutes(): number {
		return Math.floor(this.elapsedMilliseconds / 1000 / 60) % 60;
	}
	getSeconds(): number {
		return Math.floor(this.elapsedMilliseconds / 1000) % 60;
	}
	getMilliseconds(): number {
		return this.elapsedMilliseconds % 1000;
	}
}

class Clock {
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private readonly radius: number;
	private readonly adjustedRadius: number;
	private provider : TimeProvider;

	public constructor(canvas: HTMLCanvasElement, provider: TimeProvider = new ClockProvider()) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d')!;
		this.radius = this.canvas.height / 2;
		this.ctx.translate(this.radius, this.radius);
		this.adjustedRadius = this.radius * 0.9;
		this.provider = provider;
		setInterval(() => this.drawClock(), 1);
	}
	public setProvider(provider: TimeProvider) {
		this.provider = provider;
	}

	private drawClock() {
		this.ctx.clearRect(-this.radius, -this.radius, this.canvas.width, this.canvas.height);
		this.drawFace(this.ctx, this.adjustedRadius);
		this.drawNumbers(this.ctx, this.adjustedRadius);
		this.drawTime(this.ctx, this.adjustedRadius);
	}

	private drawFace(ctx: CanvasRenderingContext2D, radius: number) {
		// 背景
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, DEG360);
		ctx.fillStyle = BASE_COLOR;
		ctx.fill();

		// 目盛り
		// 6度ごとに目盛りを描画
		for (let ang = 1; ang <= 60; ang++) {
			const len = ang % 5 == 0 ? 0.1 : 0.08;
			const width = ang % 5 == 0 ? 0.04 : 0.02;
			ctx.beginPath();
			const x1 = Math.cos(ang * DEG6) * radius;
			const y1 = Math.sin(ang * DEG6) * radius;
			const x2 = Math.cos(ang * DEG6) * radius * (1 - len);
			const y2 = Math.sin(ang * DEG6) * radius * (1 - len);
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.strokeStyle = TEXT_COLOR;
			ctx.lineWidth = radius * width;
			ctx.lineCap = 'round';
			ctx.stroke();
		}

		// 外側の枠
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, DEG360);
		ctx.strokeStyle = ACCENT_COLOR;
		ctx.lineWidth = radius * 0.05;
		ctx.stroke();

		// 真ん中の点
		ctx.beginPath();
		ctx.fillStyle = ACCENT_COLOR;
		ctx.arc(0, 0, radius * 0.05, 0, DEG360);
		ctx.fill();
	}

	private drawNumbers(ctx: CanvasRenderingContext2D, radius: number) {
		ctx.font = `${radius * 0.15}px ${FONT}`;
		ctx.fillStyle = TEXT_COLOR;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		for (let num = 1; num <= 12; num++) {
			// 30度
			const ang = num * DEG30;
			// 三角関数は右が0度なので、-90度する
			const x = Math.cos(ang - DEG90) * radius * 0.80;
			const y = Math.sin(ang - DEG90) * radius * 0.80;
			ctx.fillText(num.toString(), x, y);
		}
	}

	private drawTime(ctx: CanvasRenderingContext2D, radius: number) {
		let millisecond = this.provider.getMilliseconds();
		let second = this.provider.getSeconds();
		let minute = this.provider.getMinutes();
		let hour = this.provider.getHours();

		this.drawDigit(ctx, hour, minute, second, millisecond);

		second += millisecond / 1000;
		minute += second / 60;
		hour += minute / 60;
		hour %= 12;

		// Second
		second = (second * DEG6);
		this.drawHand(ctx, second, radius * 0.8, radius * 0.02, ACCENT_COLOR2);

		// Minute
		minute = (minute * DEG6);
		this.drawHand(ctx, minute, radius * 0.7, radius * 0.05, ACCENT_COLOR);

		// Hour
		hour = (hour * DEG30);
		this.drawHand(ctx, hour, radius * 0.4, radius * 0.05, ACCENT_COLOR);
	}

	private drawHand(ctx: CanvasRenderingContext2D, pos: number, length: number, width: number, color: string) {
		ctx.beginPath();
		ctx.lineWidth = width;
		ctx.lineCap = 'round';
		ctx.strokeStyle = color;

		const x = Math.cos(pos - DEG90) * length;
		const y = Math.sin(pos - DEG90) * length;
		ctx.moveTo(0, 0);
		ctx.lineTo(x, y);
		ctx.stroke();
	}

	private drawDigit(ctx: CanvasRenderingContext2D, hour: number, minute: number, second: number, millisecond: number) {
		ctx.font = `25px ${FONT}`;
		ctx.fillStyle = TEXT_COLOR;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';

		ctx.fillText(`${("00" + hour).slice(-2)}:${("00" + minute).slice(-2)}:${("00" + second).slice(-2)}.${("000" + millisecond).slice(-3)}`, 0, 75);
	}
}

enum StopwatchState {
	OFF,
	RUNNING,
	STOP
}
class StopwatchManager {
	private state: StopwatchState = StopwatchState.OFF;
	private readonly provider = new StopwatchProvider();
	private readonly clock : Clock;
	private readonly btn : HTMLButtonElement;

	private readonly btnMsgs : { [key: number]: string }  = {
		0: "ストップウォッチ",
		1: "ストップ",
		2: "時計に戻る"
	}
	private readonly btnClasses : { [key: number]: string }  = {
		0: "btn-custom-accept",
		1: "btn-custom-cencel",
		2: "btn-custom-primary"
	}

	public constructor(clock : Clock, btn : HTMLButtonElement) {
		this.clock = clock;
		this.btn = btn;
		this.changeMsg();
	}

	public changeState() {
		this.btn.classList.remove(this.btnClasses[this.state]);

		switch (this.state) {
			case StopwatchState.OFF:
				this.state = StopwatchState.RUNNING;
				this.clock.setProvider(this.provider);
				this.provider.start();
				break;
			case StopwatchState.RUNNING:
				this.state = StopwatchState.STOP;
				this.provider.stop();
				break;
			case StopwatchState.STOP:
				this.state = StopwatchState.OFF;
				this.clock.setProvider(new ClockProvider());
				break;
		}

		this.btn.classList.add(this.btnClasses[this.state]);
		this.changeMsg();
	}

	private changeMsg() {
		this.btn.textContent = this.btnMsgs[this.state];
	}
}

const CLOCK_CANVAS = document.getElementById('clockCanvas') as HTMLCanvasElement;
const CLOCK = new Clock(CLOCK_CANVAS);

const STOPWATCH_BTN = document.getElementById('stopwatchButton') as HTMLButtonElement;
const STOPWATCH = new StopwatchManager(CLOCK, STOPWATCH_BTN);
STOPWATCH_BTN.addEventListener('click', () => {
	STOPWATCH.changeState();
});
