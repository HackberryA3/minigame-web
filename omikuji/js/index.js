//#region 起動時のアニメーション
let firstAnim;

window.addEventListener('load', () => {
	let prev = "";
	firstAnim = setInterval(() => {
		prev = draw(prev);
		roulette(0, prev);
	}, 75);
});
//#endregion

//#region フィールド
const info = document.getElementById('info');
const drawBtn = document.getElementById('drawBtn');
const result = document.getElementById('result');

const fortunes = [
	"大凶",
	"凶",
	"末吉",
	"小吉",
	"中吉",
	"吉",
	"大吉"
];
const comments = {
	"大凶": "後ろに気をつけて🫣",
	"凶": "残念😜",
	"末吉": "ギリギリ吉!😅",
	"小吉": "結んで帰るかぁ🤔",
	"中吉": "まあまあかな🤗",
	"吉": "イイ感じ👍",
	"大吉": "とはいえ油断禁物😎"
};
//#endregion

const draw = (prev) => {
	const n = Math.floor(Math.random() * fortunes.length);
	const fortune = fortunes[n];
	return fortune !== prev ? fortune : draw(prev);
}

async function roulette(t, fortune) {
	const st = t;
	let y = 1.1;
	let prev = "";

	while (t > 0) {
		prev = draw(prev);
		result.textContent = prev;

		await new Promise(resolve => setTimeout(resolve, st - t));

		t -= y;
		y += 0.02 * y ** 2;
	}

	result.textContent = fortune;
}

drawBtn.addEventListener('click', async () => {
	clearInterval(firstAnim);

	drawBtn.disabled = true;
	showRouletteInfo();

	const fortune = draw();
	await roulette(1000, fortune);

	result.classList.add('finalFortune');
	info.classList.add('finalFortune');

	if (fortune === "大吉") {
		confetti({
			particleCount: 100,
			ticks: 1,
			spread: 360,
			origin: { y: 0.25 },
		});
	}

	info.textContent = comments[fortune];

	await new Promise(resolve => setTimeout(resolve, 2000));

	result.classList.remove('finalFortune');
	info.classList.remove('finalFortune');

	drawBtn.disabled = false;
	drawBtn.textContent = "もう一度引く";
});

async function showRouletteInfo() {
	const text = "結果は・・・";

	info.textContent = "";
	for (let i = 0; i < text.length; i++) {
		info.textContent += text[i];
		await new Promise(resolve => setTimeout(resolve, 500));
	}
}