import './App.css';

function createSlices(visibleStart, visibleWidth, players) {
	let isVisible = [];
	for(let i = 1; i<=18; i++){
		if(visibleStart + visibleWidth <= 18){
			isVisible.push(i >= visibleStart && i < (visibleStart + visibleWidth))
		}else{
			isVisible.push(i >= visibleStart || i < ((visibleStart + visibleWidth)%18))
		}
	}
	let slices= [];
	for(let i = 0; i < 18; i++){
		slices.push(
			<li className={'slice child-' + (i+1) + ' ' + (isVisible[i] ? 'visible' : 'night')}>
					<div className={'slice-contents-' + i%2}/>
			</li>);
	}
	return (
		<ul className='pie'>
			{slices}
			</ul>
	);
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function findCurrentPlayer(players, visibleStart) {
	let currentPlayer = null;
	let currentPosition = 20;
	players.forEach((player) => {
		let position = player.position - visibleStart;
		if (position < 1) {
			position += 18;
		}
		console.log('player: ' + player.name + ' position: ' + position);
		if(currentPosition > position){
			position = position;
			currentPlayer = player;
		}
	});
	console.log('found lowest: ' + currentPlayer.name);
	return currentPlayer;
}

function findVisibleStart(players, visibleStart) {
	let newVisibleStart = 40;
	players.forEach((player) => {
		if(player.position < visibleStart){
			if(player.position + 18 < newVisibleStart){
				newVisibleStart = player.position + 18;
			} else {
				newVisibleStart = player.position;
			}
		}
	});
	return (newVisibleStart % 18);
}

function findCurrentQueue(players, playerId, playerPosition) {
	let queue = -1;
	players.forEach((player) => {
		if(player.id !== playerId && player.position === playerPosition && player.queue > queue){
			queue = player.queue;
		}
	})
	queue += 1;
	return queue;
}

function App() {
	let colors = {
		1: '#3ec0e2',
		2: '#e23e64',
		3: '#a93ee2',
		4: '#e2b43e',
	}
	let playerNames = ['Matt', 'Kelly', 'Richard', 'Julie']

	let players = [];
	let currentPlayer = null;
	let visibleStart = 5;
	let visibleWidth = 9;

	let startGame = () => {
		players = [];
		shuffleArray(playerNames)
		playerNames.forEach (function(playerName, i){
			let player = {id: i, color: colors[i], playerName: playerName, position: 1};
			player.queue = findCurrentQueue(players, player.id, player.position);
			players.push(player);
		});
		currentPlayer = players[0];
	}

	let movePlayer = (playerId, distance) => {
		players.forEach((player) => {
			if(player.id === playerId){
				player.position = (player.position + distance) % 18;
				findCurrentPlayer(players, visibleStart);
			}
		});
	};
	let showPieces = (players) => {
		let pieces = [];
		players.forEach((player) => {
			let transform = 'rotate(' + (360/18 * (player.position - (player.queue + 1)/5 )) + 'deg) translateY(-385px)';
			console.info(transform);
			pieces.push(<div className={'piece'} style={{background: player.color, transform: transform}}/>);
		});
		return pieces;
	}

	let movePiece = (players, currentPlayer, distance) => {
		console.log('entre');
		players.forEach((player) => {
			console.log(currentPlayer);
			if(player.id === currentPlayer.id) {
				player.position = (player.position + distance) % 18;
				player.queue = findCurrentQueue(players, currentPlayer.id, player.position);
				console.log('moving...');
				console.log(player);
			}
		});
		currentPlayer = findCurrentPlayer(players, visibleStart);
		visibleStart = findVisibleStart(players, visibleStart);
	}

	startGame();
  return (
    <div className="back">
	<div id={'sky'} className="sky">
		{showPieces(players)}
	    <div className="inner-sky">
			<div className='middle'/>
			<div className='center'/>
			{createSlices(visibleStart, visibleWidth, players)}
	    </div>
	</div>
	<div className="side-box">
	    <div> {currentPlayer.playerName} </div>
	    <div> Visible Sky: {visibleStart} - {visibleStart + visibleWidth}</div>
	    <div>
			<div className={'action-box'} onClick={() => movePiece(players, currentPlayer, 2)}> Survey 2</div>
			<div className={'action-box'} onClick={() => movePiece(players, currentPlayer, 3)}> Survey 3</div>
			<div className={'action-box'} onClick={() => movePiece(players, currentPlayer, 4)}> Survey 4</div>
			<div className={'action-box'} onClick={() => movePiece(players, currentPlayer, 4)}> Scan (4)</div>
			<div className={'action-box'} onClick={() => movePiece(players, currentPlayer, 1)}> Research (1)</div>
			<div className={'action-box'} onClick={() => movePiece(players, currentPlayer, 5)}> Find Planet X (5)</div>
	    </div>
	</div>
	<div className={'blank'}/>
    </div>
  );
}

export default App;
