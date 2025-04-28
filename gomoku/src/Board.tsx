import './Board.css';
import Square from "./Square";
import boardImg from "./static/img/Board.png";

function Board({ cellData, onClickCell, enabled, turn }: { cellData: number[][], onClickCell: (row: number, col: number) => void, enabled: boolean, turn: number}) {
	return (
		<div className={`Board ${enabled ? "" : "Disable-Board"}`}>
			<img src={boardImg} className="Board-Img" alt="Board" />

			{cellData.map((row, rowIndex) => (
				<div key={rowIndex} className="Board-Row">
					{row.map((team, colIndex) => (
						<Square 
							key={colIndex}
							team={team}
							onClick={() => onClickCell(rowIndex, colIndex)}
							enabled={enabled}
							limited={enabled && turn <= 3 && Math.abs(rowIndex - Math.floor(cellData.length / 2)) < turn && Math.abs(colIndex - Math.floor(cellData.length / 2)) < turn} />
					))}
				</div>
			))}
		</div>
	);
}

export default Board;
