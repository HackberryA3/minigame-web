import './Square.css';
import blackImg from './static/img/Black.png';
import whiteImg from './static/img/White.png';

function Square({ team, onClick, enabled, limited }: { team: number, onClick: () => void, enabled: boolean, limited: boolean}) {
	const imgSrc = team === 0 ? blackImg : whiteImg;
	const imgAlt = team === 0 ? 'Black' : 'White';
	const img = team === -1 ? null : <img className="Square-Img" src={imgSrc} alt={imgAlt} />;

	return (
		<button className={`Square ${team === -1 && enabled ? "Empty-Square" : ""} ${limited && "Limited-Square"}`} onClick={onClick}>
			{img}
		</button>
	);
}

export default Square;
