import './App.css';
import React from "react";
import Modal from '@material-ui/core/Modal';


class App extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			players: [],
			currentPlayer: null,
			skySize: 18,
			visibleStart: 1,
			visibleWidth: 8,
			pubModalOpen: false,
			activePubSector: 1,
		};
		this.closePubModal = this.closePubModal.bind(this);
		this.openPubModal = this.openPubModal.bind(this);
		this.startGame = this.startGame.bind(this);
		this.movePlayer = this.movePlayer.bind(this);
		this.showPieces = this.showPieces.bind(this);
		this.createLabels = this.createLabels.bind(this);
		this.movePiece = this.movePiece.bind(this);
		this.renderSidebar = this.renderSidebar.bind(this);
		this.renderVisible = this.renderVisible.bind(this);
		this.renderPubModal = this.renderPubModal.bind(this);
	}

	closePubModal() {
		this.setState({pubModalOpen: !this.state.pubModalOpen});
	}

	openPubModal(i) {
		this.setState({pubModalOpen: true, activePubSector: i});
	}

	findCurrentQueue(players, playerId, playerPosition) {
		let queue = -1;
		players.forEach((player) => {
			if(player.id !== playerId && player.position === playerPosition && player.queue > queue){
				queue = player.queue;
			}
		})
		queue += 1;
		return queue;
	}

	findCurrentPlayer(players, visibleStart) {
		let currentPlayer = null;
		let currentPosition = 20;
		let currentQueue = 5;
		players.forEach((player) => {
			let position = player.position - visibleStart;
			if (position < 0) {
				position += 18;
			}
			console.log('player: ' + player.name + ' position: ' + position + ' = ' + player.position + ' - ' + visibleStart + ' queue: ' + player.queue);
			if((currentPosition > position) || (currentPosition === position && player.queue < currentQueue)){
				console.log('found a better player: ' + player.name);
				currentPosition = position;
				currentQueue = player.queue;
				currentPlayer = player;
			}
		});
		console.log('current player is ' + currentPlayer.name);
		return currentPlayer;
	}

	findVisibleStart(players, visibleStart, skySize) {
		let closest = 20;
		players.forEach((player) => {
			let diff = player.position - visibleStart;
			if(diff < 0){
				diff += skySize;
			}
			console.log('player: ' + player.name + ' diff: ' + diff);
			if(diff < closest){
				closest = diff;
			}
		});
		console.log('closest: ' + closest);
		return ((visibleStart + closest) % 18);
	}

	createSlice(i) {
		let content = [];
		content.push(<div style={{width: '40px', textAlign: 'center'}}>{i+1}</div>);
		content.push(<div className={'paperSquare'} onClick={()=>{this.openPubModal(i+1)}}></div>);
		content.push(<div className={'paperSquare'} onClick={()=>{this.openPubModal(i+1)}}></div>);
		content.push(<div className={'paperSquare'} onClick={()=>{this.openPubModal(i+1)}}></div>);
		content.push(<div className={'paperSquare'} onClick={()=>{this.openPubModal(i+1)}}></div>);
		return content;
	}

	createSlices(skySize, papers) {
		let slices = [];
		let sliceWidth = (360/this.state.skySize);
		for(let i = 0; i < skySize; i++){
			let rotation = (sliceWidth * i)
			let lineTransform = 'rotate(' + rotation + 'deg) translateX(-1px) translateY(-400px)';
			let line = <div style={{position: 'absolute', width: '0px', height: '400px', top: '400px', left: '400px', background: '#333333',
				margin: '0px', border: '2px solid #333333', transformOrigin: '0% 0%', transform: lineTransform}}/>;
			slices.push(line);
			let contentTransform = 'rotate(' + (rotation + sliceWidth/2) + 'deg) translateY(-350px) translateX(-20px)';
			let number = <div style={{position: 'absolute', width: '50px', height: '100px', top: '400px', left: '400px',
				margin: 'auto', transformOrigin: '0% 0%', transform: contentTransform, color: 'white', zIndex: 40}}>{this.createSlice(i)}</div>;
			slices.push(number);
		}
		return slices;
	}

	/* Randomize array in-place using Durstenfeld shuffle algorithm */
	shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	}

	startGame() {
		let players = [];
		let playerNames = ['Bert', 'Trevor', 'Richard', 'Julie'];
		let colors = [
			'#3ec0e2',
			'#e23e64',
			'#a93ee2',
			'#e2b43e',
		];
		this.shuffleArray(playerNames);
		playerNames.forEach((playerName, i) => {
			let player = {id: i, color: colors[i], name: playerName, position: 1};
			player.queue = this.findCurrentQueue(players, player.id, player.position);
			players.push(player);
		});
		this.setState({players: players, currentPlayer: players[0]});
	}

	movePlayer(playerId, distance) {
		this.state.players.forEach((player) => {
			if(player.id === playerId){
				player.position = (player.position + distance) % this.state.skySize;
				player.queue = this.findCurrentQueue(this.state.players, player.id, player.position);
				this.setState({
					currentPlayer: this.findCurrentPlayer(this.state.players, this.state.visibleStart),
					visibleStart: this.findVisibleStart(this.state.players, this.state.visibleStart, this.state.skySize)
				});
				return;
			}
		});
	};

	showPieces() {
		let pieces = [];
		this.state.players.forEach((player) => {
			let transform = 'rotate(' + (360/this.state.skySize * (player.position - (player.queue + 1)/(this.state.players.length + 1))) + 'deg) translateY(-385px)';
			pieces.push(<div className={'piece'} style={{background: player.color, transform: transform}}/>);
		});
		return pieces;
	}

	createLabels() {
		let labels = []
		for(let i = 1; i<=18; i++){
			let transform = 'rotate(' + (360/this.state.skySize * (i - 0.5)) + 'deg) translateY(-200px)';
			labels.push(<div className={'label'} style={{transform: transform}}>{i}</div>)
		}
		return labels;
	}

	movePiece(distance, id) {
		this.state.players.forEach((player) => {
			if(player.id === id) {
				player.position = (player.position + distance) % 18;
				player.queue = this.findCurrentQueue(this.state.players, id, player.position);
			}
		});
		this.setState({
			currentPlayer: this.findCurrentPlayer(this.state.players, this.state.visibleStart),
			visibleStart: this.findVisibleStart(this.state.players, this.state.visibleStart, this.state.skySize)
		});
	}

	renderVisible() {
		let transform = 'rotate(' + (360/this.state.skySize * (this.state.visibleStart - 1) - 90) + 'deg)';
		return (<div className={'visibleSky'} style={{transform: transform}}/>);
	}

	renderSidebar() {
		let playerDivs = [];

		this.state.players.forEach((player) => {
			playerDivs.push(<div className={'section'} style={{color: player.color}}
				onClick={() => {this.movePiece(1, player.id);}}>{player.name}</div>);
		});

		let currentColor = (this.state.currentPlayer && this.state.currentPlayer.color) ? this.state.currentPlayer.color : 'black';
		let visStart = (this.state.visibleStart === 0) ? 18 : this.state.visibleStart;
		let visEnd = (((this.state.visibleStart + this.state.visibleWidth)%this.state.skySize) === 0) ? 18 : ((this.state.visibleStart + this.state.visibleWidth)%this.state.skySize);

		return (
			<div className="side-box">
				<div className={'section'} style={{color: 'white'}}>Active Player</div>
				<div className={'section'} style={{color: currentColor}}> {this.state.currentPlayer && this.state.currentPlayer.name} </div>
				<div className={'section'} style={{color: 'white'}}> Visible Sky:</div>
				<div className={'section'} style={{color: 'white'}}>{visStart} - {visEnd}</div>
				<div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(2, this.state.currentPlayer.id)}> Survey 2</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(3, this.state.currentPlayer.id)}> Survey 3</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(4, this.state.currentPlayer.id)}> Survey 4</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(4, this.state.currentPlayer.id)}> Scan (4)</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(1, this.state.currentPlayer.id)}> Research (1)</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(5, this.state.currentPlayer.id)}> Find Planet X (5)</div>
					{/*<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(5, this.state.currentPlayer.id)}> New Game </div>*/}
				</div>
				<div className={'section'} style={{height: '160px !important'}}/>
				<div className={'section'} style={{ color: 'white'}}>Players</div>
				{playerDivs}
				<div className={'section'} style={{height: '160px !important'}}/>
				<div className={'section'} style={{height: '160px !important'}}/>
				<div className={'section'} style={{height: '160px !important'}}/>
				<div className={'section'} style={{height: '160px !important'}}/>
			</div>
		);
	}

	renderPubModal() {
		let style = {
			width: '400px',
			height: '300px',
			margin: 'auto',
			background: 'white',
			color: 'black'
		};
		let content = <div style={style}>
			<div>{'Publications for sector ' + this.state.activePubSector}</div>
		</div>;
		return (
			<Modal
				open={this.state.pubModalOpen}
				onClose={this.closePubModal}
				aria-labelledby={'Publications for Sector '+this.state.activePubSector}
				aria-describedby="hi"
			  >
				{content}
		    </Modal>
		);
	}

	render() {
		if(!this.state.currentPlayer){
			this.startGame();
		}
		return (
			<div className="back">
				{this.renderPubModal()}
				<div id={'sky'} className="sky">
					{this.showPieces()}
					{this.renderVisible()}
					{/*{this.createLabels()}*/}
					<div className="inner-sky">
						<div className='middle'/>
						<div className='center'/>
						{this.createSlices(this.state.skySize)}
					</div>
				</div>
					{this.renderSidebar()}
				<div className={'blank'}/>
			</div>
		);
	}
}

export default App;
