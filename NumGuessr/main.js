class View {
	startBtn;
	form;
	inputNum;
	guessBtn;
	result;
	history;
	leftCount;

	constructor(onGuessCallback, onStartCallback) {
		this.init(onGuessCallback, onStartCallback);
	}
	init(onGuessCallback, onStartCallback) {
		this.startBtn = document.getElementById('start-btn');
		this.form = document.getElementById('input-num-form');
		this.inputNum = document.getElementById('input-num');
		this.guessBtn = document.getElementById('guess-btn');
		this.result = document.getElementById('result');
		this.history = document.getElementById('history');
		this.leftCount = document.querySelector('.left');

		this.startBtn.addEventListener('click', () => {
			onStartCallback();
		});
		this.inputNum.addEventListener('input', () => {
			// 入力されるたびにバリデーション
			this.inputNum.value = this.trancateInputNum(this.inputNum.value);
			// バリデーション結果でボタンの有効無効を切り替え
			if (this.validateInputNum(this.inputNum.value)) {
				this.enableGuessBtn();
			}
			else {
				this.disableGuessBtn();
			}
		});
		this.guessBtn.addEventListener('click', () => {
			onGuessCallback(Number(this.inputNum.value));
		});
	}



	showStartBtn(isRestart) {
		this.startBtn.textContent = isRestart ? 'もう1回🚀' : 'スタート🚀';
		this.startBtn.style.display = '';
	}
	hideStartBtn() {
		this.startBtn.style.display = 'none';
	}
	showForm() {
		this.form.style.display = '';
	}
	hideForm() {
		this.form.style.display = 'none';
	}
	resetForm() {
		this.inputNum.value = '';
		this.disableGuessBtn();
	}
	enableGuessBtn() {
		this.guessBtn.disabled = false;
	}
	disableGuessBtn() {
		this.guessBtn.disabled = true;
	}
	showResult(status) {
		this.result.textContent = status;
		this.result.style.display = '';
	}
	hideResult() {
		this.result.style.display = 'none';
	}

	showLeftCount(count) {
		this.leftCount.textContent = `残り${count}回🔍️`;
	}
	// 履歴を追加
	// 0: 正解, -1: 小さい, 1: 大きい, 998244353: 答え
	addHistory(num, result) {
		const span = document.createElement('span');
		let icon;
		switch (result) {
			case 0:
				icon = '🎉';
				break;
			case -1:
				icon = '🔺';
				break;
			case 1:
				icon = '🔻';
				break;
			case 998244353:
				icon = '🎯';
				break;
		}
		span.textContent = `${num}${icon} `;
		this.history.appendChild(span);
	}
	resetHistory() {
		for (let i = this.history.childNodes.length - 1; i >= 0; i--) {
			this.history.removeChild(this.history.childNodes[i]);
		}
	}



	trancateInputNum(input) {
		// 空文字の場合はそのまま返す
		if (input === '') return '';

		// 数値に変換
		let num = Number(input);
		// マイナスの場合はプラスに
		if (num < 0) num = Math.abs(num);
		// 1~100の範囲にClamp
		num = Math.min(Math.max(num, 1), 100);
		return num;
	}
	validateInputNum(input) {
		// 空文字の場合はエラー
		if (input === '') return false;

		return true;
	}



	showConfetti() {
		confetti({
			particleCount: 100,
			ticks: 1,
			spread: 360,
			origin: { y: 0.25 },
		});
	}
	showFireworks() {
		const duration = 3 * 1000,
			animationEnd = Date.now() + duration,
			defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

		function randomInRange(min, max) {
			return Math.random() * (max - min) + min;
		}

		const interval = setInterval(function() {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(interval);
			}

			const particleCount = 50 * (timeLeft / duration);

			// since particles fall down, start a bit higher than random
			confetti(
				Object.assign({}, defaults, {
					particleCount,
					origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
				})
			);
			confetti(
				Object.assign({}, defaults, {
					particleCount,
					origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
				})
			);
		}, 250);
	}
	showStars() {
		const defaults = {
			spread: 360,
			ticks: 50,
			gravity: 0,
			decay: 0.94,
			startVelocity: 30,
			shapes: ["star"],
			colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
		};

		function shoot() {
			confetti({
				...defaults,
				particleCount: 40,
				scalar: 1.2,
				shapes: ["star"],
			});

			confetti({
				...defaults,
				particleCount: 10,
				scalar: 0.75,
				shapes: ["circle"],
			});
		}

		setTimeout(shoot, 0);
		setTimeout(shoot, 100);
		setTimeout(shoot, 200);
	}
}

class Model {
	guessedCount;
	histories;
	answer;
	MAX_GUESS_COUNT;

	constructor() {
		this.init();
	}
	init() {
		this.guessedCount = 0;
		this.histories = [];
		this.answer = this.generateAnswer();
		this.MAX_GUESS_COUNT = 7;
	}

	generateAnswer() {
		return Math.floor(Math.random() * 99) + 1;
	}

	// 0: 正解, -1: 小さい, 1: 大きい
	guess(num) {
		this.guessedCount++;

		let result = 0;
		if (num === this.answer) {
			result = 0;
		}
		else if (num < this.answer) {
			result = -1;
		}
		else {
			result = 1;
		}

		this.histories.push({ num, result });
		return result;
	}
}

class Presenter {
	view;
	model;

	constructor() {
		this.init();
	}
	init() {
		this.view = new View(this.onGuess.bind(this), this.onStart.bind(this));
		this.model = new Model();

		this.view.hideForm();
		this.view.hideResult();
	}



	onStart() {
		this.model.init();
		this.view.hideStartBtn();
		this.view.showForm();
		this.view.hideResult();
		this.view.resetHistory();
		this.view.showLeftCount(this.model.MAX_GUESS_COUNT);
	}
	async endGame(isCorrect) {
		this.view.hideForm();
		this.view.showStartBtn(true);

		if (isCorrect) {
			if (this.model.guessedCount === 1){
				this.view.showFireworks();
				this.view.showStars();
			}
			else this.view.showConfetti();
		}
		else {
			this.view.addHistory(this.model.answer, 998244353);
		}

		await new Promise(resolve => setTimeout(resolve, 3000));
	}
	async onGuess(num) {
		// 予想の結果を取得
		const result = this.model.guess(num);
		// 入力欄をリセット、履歴を追加、残り回数を表示
		this.view.resetForm();
		this.view.addHistory(num, result);
		this.view.showLeftCount(this.model.MAX_GUESS_COUNT - this.model.guessedCount);

		if (result === 0) {
			this.view.showResult('🎉正解🎉');
			await this.endGame(true);
		}
		else if (this.model.guessedCount >= this.model.MAX_GUESS_COUNT) {
			this.view.showResult('失敗😢');
			await this.endGame(false);
		}
		else if (result === -1) {
			this.view.showResult('もっと大きいよ🔺');
		}
		else {
			this.view.showResult('もっと小さいよ🔻');
		}

		await new Promise(resolve => setTimeout(resolve, 1000));

		this.view.hideResult();
	}
}

const presenter = new Presenter();
