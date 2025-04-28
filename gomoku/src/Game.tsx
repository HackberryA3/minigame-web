import { useState } from 'react';
import './Game.css';
import Board from './Board';
import AlgoBasedAI from './AlgoBasedAI';



// #region CONST
const AI = new AlgoBasedAI();
const SIZE = 19;
// #endregion

function setCell(cellData: number[][], row: number, col: number, team: number): number[][] {
	return cellData.map((r, rowIndex) => r.map((t, colIndex) => {
		if (row === rowIndex && col === colIndex) {
			return team;
		}
		return t;
	}));
}
function checkGameEnd(cellData: number[][]): { isEnd: boolean, winner: number } {
	const check = (cellData: number[][], row: number, col: number, dr: number, dc: number, team: number): number[] => {
		const imos : number[] = [cellData[row][col] === team ? 1 : 0];
		for (let r = row + dr, c = col + dc, i = 1; 0 <= r && r < SIZE && 0 <= c && c < SIZE; r += dr, c += dc, i++) {
			if (cellData[r][c] === team) {
				imos.push(imos[i - 1] + 1);
			}
			else {
				imos.push(0);
			}
		}
		return imos;
	}
	const checkEnd = (imos: number[]): boolean => {
		for (const v of imos) {
			if (5 <= v) {
				return true;
			}
		}
		return false;
	}

	// 横
	for (let row = 0; row < SIZE; row++) {
		for (let t = 0; t < 2; t++) {
			const imos = check(cellData, row, 0, 0, 1, t);
			if (checkEnd(imos)) {
				return { isEnd: true, winner: t };
			}
		}
	}
	// 縦
	for (let col = 0; col < SIZE; col++) {
		for (let t = 0; t < 2; t++) {
			const imos = check(cellData, 0, col, 1, 0, t);
			if (checkEnd(imos)) {
				return { isEnd: true, winner: t };
			}
		}
	}
	// 左上から右下(行)
	for (let row = 0; row < SIZE; row++) {
		for (let t = 0; t < 2; t++) {
			const imos = check(cellData, row, 0, 1, 1, t);
			if (checkEnd(imos)) {
				return { isEnd: true, winner: t };
			}
		}
	}
	// 左上から右下(列)
	for (let col = 0; col < SIZE; col++) {
		for (let t = 0; t < 2; t++) {
			const imos = check(cellData, 0, col, 1, 1, t);
			if (checkEnd(imos)) {
				return { isEnd: true, winner: t };
			}
		}
	}
	// 左下から右上(行)
	for (let row = 0; row < SIZE; row++) {
		for (let t = 0; t < 2; t++) {
			const imos = check(cellData, row, 0, -1, 1, t);
			if (checkEnd(imos)) {
				return { isEnd: true, winner: t };
			}
		}
	}
	// 左下から右上(列)
	for (let col = 0; col < SIZE; col++) {
		for (let t = 0; t < 2; t++) {
			const imos = check(cellData, SIZE - 1, col, -1, 1, t);
			if (checkEnd(imos)) {
				return { isEnd: true, winner: t };
			}
		}
	}

	return { isEnd: false, winner: -1 };
}



function Game() {
	const [aiBattle, setAIBattle] = useState<boolean>(false);
	const [inGame, setInGame] = useState<boolean>(false);
	const [showResult, setShowResult] = useState<boolean>(false);
	const [winner, setWinner] = useState<number>(-1);
	const [cellData, setCellData] = useState<number[][]>(Array(19).fill(Array(19).fill(-1)));
	const [currentTeam, setCurrentTeam] = useState<number>(0);
	const [turn, setTurn] = useState<number>(1);
	const [playerTurn, setPlayerTurn] = useState<number>(Math.floor(Math.random() * 2));



	const resetGame = () => {
		setAIBattle(false);
		setInGame(false);
		setShowResult(false);
		setWinner(-1);
		setCellData(Array(19).fill(Array(19).fill(-1)));
		setCurrentTeam(0);
		setTurn(1);
		setPlayerTurn(Math.floor(Math.random() * 2));
	}
	const startGame = (aiBattle: boolean) => {
		if (aiBattle) {
			alert("AI対戦は未実装です。");
			return;
		}
		setAIBattle(aiBattle);
		setInGame(true);
	}



	const canPut = (cellData: number[][], row: number, col: number): boolean => {
		if (turn <= 3) {
			return cellData[row][col] === -1 && Math.abs(row - 9) < turn && Math.abs(col - 9) < turn;
		}
		return cellData[row][col] === -1;
	}
	const doAI = () => {
		const [airow, aicol] = AI.predict(cellData, currentTeam, turn);
		const nextCellData = setCell(cellData, airow, aicol, currentTeam);

		const result = checkGameEnd(nextCellData);
		checkAndApplyEnd(result);
		setCellData(nextCellData);
		nextTurn();
	}
	const checkAndApplyEnd = (result : { isEnd: boolean, winner: number }): boolean => {
		const { isEnd, winner } = result;
		if (isEnd || 100 <= turn) {
			console.log("GameEnd", winner);
			setInGame(false);
			setShowResult(true);
			setWinner(winner);
			return true;
		}
		return false;
	}
	const nextTurn = () => {
		setTurn(turn + 1);
		setCurrentTeam(currentTeam ^ 1);
	}



	// 相手のターン
	if (inGame && aiBattle && currentTeam !== playerTurn) {
		doAI();
	}



	const onClickCell = (row: number, col: number) => {
		if (!canPut(cellData, row, col)) return;

		const newCellData = setCell(cellData, row, col, currentTeam);
		setCellData(newCellData);
		const result = checkGameEnd(newCellData);
		checkAndApplyEnd(result);

		nextTurn();
	};


	return (
		<div className="Game-Container">
			<Board cellData={cellData} onClickCell={!inGame || (aiBattle && currentTeam !== playerTurn) ? () => { } : ((row, col) => onClickCell(row, col))} enabled={inGame} turn={turn} />
			<div className="Status-Container">
				{!inGame && !showResult && <button className="BTN" onClick={() => startGame(false)}>ローカル対戦</button>}
				{!inGame && !showResult && <button className="BTN" onClick={() => startGame(true)}>AI対戦</button>}
				{showResult && <div className="Status">{winner === -1 ? "満局" : winner === 0 ? "黒の勝利" : "白の勝利"}</div>}
				{showResult && <button className="BTN" onClick={resetGame}>次へ</button>}
			</div>
		</div>
	);
}

export default Game;
