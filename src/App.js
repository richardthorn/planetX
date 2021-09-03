import './App.css';
import React from "react";
import Modal from '@material-ui/core/Modal';


class App extends React.Component{
	constructor(props) {
		super(props);
		let publications = [];
		let confirmed = {};
		for(let i = 0; i < 18; i++){
			publications.push([[], [], [], []]);
			confirmed[i] = null;
		};
		let code = 'R6T3';
		let season = 'Spring';
		let globalRotation;
		switch (season) {
			case 'Fall':
				globalRotation = 270;
				break;
			case 'Winter':
				globalRotation = 180;
				break;
			case 'Spring':
				globalRotation = 90;
				break;
			case 'Summer':
			default:
				globalRotation = 0;
				break;
		}
		this.state = {
			players: [],
			currentPlayer: null,
			skySize: 18,
			visibleStart: 1,
			visibleWidth: 8,
			pubModalOpen: false,
			activePubSector: 0,
			activePubRound: 0,
			publications: publications,
			pubRounds: 0,
			publicPublish: [],
			confirmed: confirmed,
			season: season,
			globalRotation: globalRotation,
			code: code,
			prevMove: {visibleStart: 0, player: null, position: 0},
		};
		this.setSeason = this.setSeason.bind(this);
		this.setCode = this.setCode.bind(this);
		this.openPubModal = this.openPubModal.bind(this);
		this.closePubModal = this.closePubModal.bind(this);
		this.closePubReviewModal = this.closePubReviewModal.bind(this);
		this.playerNameToColor = this.playerNameToColor.bind(this);
		this.startGame = this.startGame.bind(this);
		this.movePlayer = this.movePlayer.bind(this);
		this.showPieces = this.showPieces.bind(this);
		this.createLabels = this.createLabels.bind(this);
		this.movePiece = this.movePiece.bind(this);
		this.renderSidebar = this.renderSidebar.bind(this);
		this.renderVisible = this.renderVisible.bind(this);
		this.publish = this.publish.bind(this);
		this.confirmPub = this.confirmPub.bind(this);
		this.renderPubModal = this.renderPubModal.bind(this);
		this.renderPubReviewModal = this.renderPubReviewModal.bind(this);
	}

	setSeason(season) {
		this.setState({season: season});
	}

	setCode(code) {
		this.setState({code: code});
	}

	openPubModal(sector, round) {
		this.setState({pubModalOpen: true, activePubSector: sector, activePubRound: round});
	}

	closePubModal() {
		this.setState({pubModalOpen: false});
	}

	closePubReviewModal() {
		this.setState({publicPublish: []});
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

	playerNameToColor(playerName) {
		let rsp = 'orange';
		this.state.players.forEach((player) => {
			if(player.name === playerName) {
				rsp = player.color;
			}
		});
		return rsp;
	}
	renderPubs(sector, phase) {
		if(phase === 0 && this.state.confirmed[sector]) {
			return(<div style={{background: 'white', color: 'black', width: '26px', margin: '2px', textAlign: 'center', fontSize: '24px'}}>{this.state.confirmed[sector]}</div>)
		}
		let pubs = this.state.publications[sector][phase];
		let divs = [];
		pubs.forEach((pub) => {
			divs.push(<div style={{height: '90%', width: '26px', margin: '2px', background: this.playerNameToColor(pub)}}></div>);
		});
		if(divs.length > 3) {
			let multiDivs = [];
			multiDivs.push(<div style={{height: '45%', width: '100%', display: 'flex', marginBottom: '2px'}}>{divs.slice(0,2)}</div>);
			multiDivs.push(<div style={{height: '45%', width: '100%', display: 'flex'}}>{divs.slice(2)}</div>);
			return <div className={'paperMultiSquare'}>{multiDivs}</div>;
		}
		return divs;
	}

	createSlice(i) {
		let content = [];
		content.push(<div style={{width: '40px', textAlign: 'center'}}>{i+1}</div>);
		content.push(<div className={'paperSquare'} onClick={()=>{this.openPubModal(i, 0)}}>{this.renderPubs(i,0)}</div>);
		content.push(<div className={'paperSquare'} onClick={()=>{this.openPubModal(i, 1)}}>{this.renderPubs(i,1)}</div>);
		content.push(<div className={'paperSquare'} onClick={()=>{this.openPubModal(i, 2)}}>{this.renderPubs(i,2)}</div>);
		content.push(<div className={'paperSquare'} onClick={()=>{this.openPubModal(i, 3)}}>{this.renderPubs(i,3)}</div>);
		return content;
	}

	createSlices(skySize) {
		let slices = [];
		let sliceWidth = (360/this.state.skySize);
		for(let i = 0; i < skySize; i++){
			let rotation = (sliceWidth * i) + this.state.globalRotation;
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
		let playerNames = ['Julie', 'Richard', 'Bert', 'Trevor'];
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
			let transform = 'rotate(' + (360/this.state.skySize * (player.position - (player.queue + 1)/(this.state.players.length + 1)) + this.state.globalRotation) + 'deg) translateY(-385px)';
			pieces.push(<div className={'piece'} style={{background: player.color, transform: transform}}/>);
		});
		return pieces;
	}

	createLabels() {
		let labels = []
		for(let i = 1; i<=18; i++){
			let transform = 'rotate(' + (360/this.state.skySize * (i - 0.5) + this.state.globalRotation) + 'deg) translateY(-200px)';
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
		let newStart = this.findVisibleStart(this.state.players, this.state.visibleStart, this.state.skySize);
		let pubRounds = 0;
		if(newStart > this.state.visibleStart) {
			let distance = newStart - this.state.visibleStart;
			let offset = (this.state.visibleStart-1) % 3;
			pubRounds = Math.floor((offset + distance) / 3);
			for(let i = 0; i < pubRounds; i++) {
				console.log('pub it '+offset+' '+distance+' '+pubRounds);
			}
		} else if (newStart < this.state.visibleStart) {
			if(this.state.visibleStart < 15) {
				pubRounds = 2;
			} else if(newStart > 3) {
				pubRounds = 2;
			} else {
				pubRounds = 1;
			}
		}
		this.setState({
			currentPlayer: this.findCurrentPlayer(this.state.players, this.state.visibleStart),
			visibleStart: newStart,
			pubRounds: pubRounds
		});
	}

	renderVisible() {
		let transform = 'rotate(' + (360/this.state.skySize * (this.state.visibleStart - 1) - 90 + this.state.globalRotation) + 'deg)';
		return (<div className={'visibleSky'} style={{transform: transform}}/>);
	}

	publish() {
		let publicPublish = [];
		let pubs = this.state.publications;
		for(let i = 0; i < 18; i++){
			if(this.state.publications[i][3].length === 0) {
				if(this.state.publications[i][2].length > 0) {
					publicPublish.push(i);
				}
				for(let j = 2; j >= 0; j--) {
					pubs[i][j+1] = pubs[i][j];
				}
				pubs[i][0] = [];
			}
		}
		this.setState({pubRounds: (this.state.pubRounds-1), publicPublish: publicPublish, publications: pubs});
	}

	renderSidebar() {
		if(this.state.pubRounds > 0){
			let contents = [];
			contents.push(<div className={'section'} style={{color: 'white'}}>Publications Phase</div>);
			contents.push(<div className={'section'}/>);
			contents.push(<div className={'section'} style={{color: 'white'}} onClick={() => this.publish()}>Finish Publication</div>);
			for(let i = 0; i < 14; i++) {
				contents.push(<div className={'section'}/>)
			}
			contents.push(<div className={'section'} style={{color: 'white'}}>Season</div>);
			contents.push(<div className={'section'} style={{color: 'white'}}>{this.state.season}</div>);
			contents.push(<div className={'section'} style={{color: 'white'}}>Game Code</div>);
			contents.push(<div className={'section'} style={{color: 'white'}}>{this.state.code}</div>);
			return (
				<div className="side-box">
					{contents}
				</div>
			);
		}
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
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(2, this.state.currentPlayer.id)}> Survey (2)</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(3, this.state.currentPlayer.id)}> Survey (3)</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(4, this.state.currentPlayer.id)}> Survey (4)</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(4, this.state.currentPlayer.id)}> Scan (4)</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(1, this.state.currentPlayer.id)}> Research (1)</div>
					<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(5, this.state.currentPlayer.id)}> Find Planet X (5)</div>
					{/*<div className={'section'} style={{color: 'white'}} onClick={() => this.movePiece(5, this.state.currentPlayer.id)}> New Game </div>*/}
				</div>
				<div className={'section'}/>
				<div className={'section'} style={{ color: 'white'}}>Players</div>
				{playerDivs}
				<div className={'section'}/>
				<div className={'section'} style={{color: 'white'}}>Season</div>
				<div className={'section'} style={{color: 'white'}}>{this.state.season}</div>
				<div className={'section'} style={{color: 'white'}}>Game Code</div>
				<div className={'section'} style={{color: 'white'}}>{this.state.code}</div>
				{/*<div className={'section'} style={{color: 'white'}} onClick={() => undo()}>Undo</div>*/}
			</div>
		);
	}

	hasPlayerPublication(sector, playerName) {
		for(let i = 1; i < 4; i++){
			if (this.state.publications[sector] &&
				this.state.publications[sector][i] &&
				this.state.publications[sector][i].includes(playerName)) {
				return true;
			}
		}
		return false;
	}

	renderPubModal() {
		let playerDivs = [];
		let rmStagePlayer = (sector, round, playerName) => {
			let pubs = this.state.publications;
			pubs[sector][round].splice(pubs[sector][round].indexOf(playerName),1);
			this.setState({publications: pubs});
		};
		let addStagePlayer = (sector, round, playerName) => {
			let pubs = this.state.publications;
			pubs[sector][round].push(playerName);
			this.setState({publications: pubs});
		};
		this.state.players.forEach((player)=>{
			if(this.hasPlayerPublication(this.state.activePubSector, player.name) && !this.state.publications[this.state.activePubSector][this.state.activePubRound].includes(player.name)){
				playerDivs.push(<div className={'pub-unselected'} style={{opacity: 0.7, color: player.color}}>{player.name}</div>);
			}else if(this.state.publications[this.state.activePubSector][this.state.activePubRound].includes(player.name)){
				playerDivs.push(<div className={'pub-selected'} style={{background: player.color}} onClick={()=>rmStagePlayer(this.state.activePubSector, this.state.activePubRound, player.name)}>{player.name}</div>)
			}else{
				playerDivs.push(<div className={'pub-unselected'} style={{color: player.color}} onClick={()=>addStagePlayer(this.state.activePubSector, this.state.activePubRound, player.name)}>{player.name}</div>)
			}
		});
		let content = <div className={'pub-modal'}>
			<div className={'pub-unselected'} style={{color: 'white'}}>{'Publications for Sector ' + (this.state.activePubSector+1) + '.' + (this.state.activePubRound)}</div>
			{playerDivs}
		</div>;
		return (
			<Modal
				open={this.state.pubModalOpen}
				onClose={this.closePubModal}
			  >
				{content}
		    </Modal>
		);
	}

	confirmPub(sector, val) {
		let confirmed = this.state.confirmed;
		confirmed[sector] = val;
		this.setState({confirmed: confirmed});
	}

	renderPubReviewModal() {
		let checkDivs = [];
		let makeDiv = (sector, val, title) => {
			if(this.state.confirmed[sector] === val) {
				return (<div style={{border: '1px solid white', margin: '2px', width: '80px'}} onClick={() => this.confirmPub(sector, val)}>
					<div style={{margin: '2px', width: '76px', textAlign: 'center', background: 'white', color: 'black'}}>{title}</div>
				</div>);
			} else {
				return (<div style={{border: '1px solid white', margin: '2px', width: '80px', textAlign: 'center'}} onClick={() => this.confirmPub(sector, val)}>{title}</div>);
			}
		};
		this.state.publicPublish.forEach((sector) => {
			checkDivs.push(<div style={{height: '36px', width: '100%', marginBottom: '4px', background: 'black', color: 'white', display: 'flex'}}>
				<div style={{width: '40px'}}>{sector + 1}</div>
				<div style={{border: '1px solid white', margin: '2px', display: 'flex'}}>
					{makeDiv(sector, 'A', 'Astroid')}
					{makeDiv(sector, 'C', 'Comet')}
					{makeDiv(sector, 'D', 'Dwarf')}
					{makeDiv(sector, 'G', 'Gas Cloud')}
					{makeDiv(sector, null, 'Incorrect')}
				</div>
			</div>);
		});
		let height = (40 * this.state.publicPublish.length) + 'px';
		let content = <div className={'pub-check-modal'} style={{height: height}}>{checkDivs}</div>
		return (
			<Modal
				open={this.state.publicPublish.length}
				onClose={this.closePubReviewModal}
			>
				{content}
			</Modal>
		);
	}
	// renderSeasonModal() {
	//
	// }

	render() {
		if(!this.state.currentPlayer){
			this.startGame();
		}
		return (
			<div className="back">
				{this.renderPubModal()}
				{this.renderPubReviewModal()}
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
