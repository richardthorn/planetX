import './App.css';
import React from "react";
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';


class App extends React.Component{
	constructor(props) {
		super(props);
		let publications = [];
		let confirmed = {};
		for(let i = 0; i < 18; i++){
			publications.push([[], [], [], []]);
			confirmed[i] = null;
		};
		let code = 'Y6F7';
		let season = 'Winter';
		let globalRotation;
		let colors = [
			'#3ec0e2',
			'#e23e64',
			'#a93ee2',
			'#e2b43e',
		];
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
			playerCount: 0,
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
			openSettingsModal: false,
			code: code,
			globalRotation: globalRotation,
			prevMove: {visibleStart: 0, player: null, position: 0},
			playerPubs: [],
			colors: colors,
		};
		this.endGame = this.endGame.bind(this);
		this.setSeason = this.setSeason.bind(this);
		this.setPlayerCount = this.setPlayerCount.bind(this);
		this.setPlayerName = this.setPlayerName.bind(this);
		this.setCode = this.setCode.bind(this);
		this.togglePub = this.togglePub.bind(this);
		this.openPubModal = this.openPubModal.bind(this);
		this.closeSettingsModal = this.closeSettingsModal.bind(this);
		this.closePubModal = this.closePubModal.bind(this);
		this.closePubReviewModal = this.closePubReviewModal.bind(this);
		this.playerNameToColor = this.playerNameToColor.bind(this);
		this.startGame = this.startGame.bind(this);
		this.movePlayer = this.movePlayer.bind(this);
		this.showPieces = this.showPieces.bind(this);
		this.createLabels = this.createLabels.bind(this);
		this.movePiece = this.movePiece.bind(this);
		this.renderSidebar = this.renderSidebar.bind(this);
		this.renderPubBar = this.renderPubBar.bind(this);
		this.renderVisible = this.renderVisible.bind(this);
		this.publish = this.publish.bind(this);
		this.confirmPub = this.confirmPub.bind(this);
		this.renderPubModal = this.renderPubModal.bind(this);
		this.renderSettingsModal = this.renderSettingsModal.bind(this);
		this.renderPubReviewModal = this.renderPubReviewModal.bind(this);
	}

	endGame() {
		let all = [...Array(18).keys()];
		this.setState({publicPublish: all, renderPubReviewModal: true});
	}

	setCode(event) {
		this.setState({code: event.target.value});
	}

	setPlayerCount(i) {
		let players = this.state.players;
		let playerPubs = this.state.playerPubs;
		if(i < players.length) {
			this.setState({playerCount: i, players: players.slice(0,i), playerPubs: playerPubs.slice(0,i)});
		}else{
			for(let j = players.length; j < i; j++){
				let player = {id: j, color: this.state.colors[j], name: 'player_'+j, position: 1};
				player.queue = this.findCurrentQueue(players, player.id, player.position);
				players.push(player);
				playerPubs.push({name: 'player_'+j, color: player.color, pubs: new Array(14).fill(true)});
			}
			this.shuffleArray(players);
			for(let j = 0; j < i; j++) {
				players[j].color = this.state.colors[j];
				players[j].queue = j;
				playerPubs[j].name = players[j].name;
				playerPubs[j].color = players[j].color;
			}
			this.setState({players: players, playerCount: players.length, currentPlayer: players[0], playerPubs: playerPubs});
		}

	}

	setPlayerName(i, name) {
		let players = this.state.players;
		let playerPubs = this.state.playerPubs;
		players[i].name = name;
		playerPubs[i].name = name;
		this.setState({players: players, playerPubs: playerPubs});
	}

	openSettingsModal() {
		this.setState({settingsModalOpen: true});
	}

	closeSettingsModal() {
		this.setState({settingsModalOpen: false});
	}

	setSeason(season) {
		let globalRotation = 0;
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
		this.setState({season: season, globalRotation: globalRotation});
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

	togglePub(i, j) {
		let pubs = this.state.playerPubs;
		pubs[i].pubs[j] = !pubs[i].pubs[j];
		this.setState({playerPubs: pubs});
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
		let playerNames = ['Julie', 'Richard', 'Bert', 'Matt'];
		let playerPubs = [];
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
			playerPubs.push({name: playerName, color: player.color, pubs: new Array(14).fill(true)});
		});
		this.setState({players: players, playerCount: players.length, currentPlayer: players[0], playerPubs: playerPubs});
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
			let transform = 'rotate(' + (360/this.state.skySize * (player.position - (1 - (player.queue + 1)/(this.state.players.length + 1))) + this.state.globalRotation) + 'deg) translateY(-385px)';
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

		let playerDivs = [];
		this.state.players.forEach((player) => {
			playerDivs.push(<div className={'section'} style={{color: player.color}}
				onClick={() => {this.movePiece(1, player.id);}}>{player.name}</div>);
		});

		if(this.state.pubRounds > 0){
			let contents = [];
			contents.push(<div className={'section'} style={{color: 'white'}}>Publications Phase</div>);
			contents.push(<div className={'section'}/>);
			contents.push(<div className={'section'} style={{color: 'white'}} onClick={() => this.publish()}>Finish Publication</div>);
			for(let i = 0; i < 18; i++) {
				contents.push(<div className={'section'}/>)
			}
			return (
				<div className="side-box">
					{contents}
				</div>
			);
		}

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
				<div className={'section'} style={{ color: 'white'}}>Penalty</div>
				{playerDivs}
				<div className={'section'}/>
				<div className={'section'} style={{color: 'white'}} onClick={() => this.openSettingsModal()}>Season</div>
				<div className={'section'} style={{color: 'white'}} onClick={() => this.openSettingsModal()}>{this.state.season}</div>
				<div className={'section'} style={{color: 'white'}} onClick={() => this.openSettingsModal()}>Game Code</div>
				<div className={'section'} style={{color: 'white'}} onClick={() => this.openSettingsModal()}>{this.state.code}</div>
				<div className={'section'} style={{color: 'white'}} onClick={() => this.endGame()}>Final Scoring</div>
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
		let content = <div style={{width: '100%', height: '100%'}}>
			<div className={'pub-unselected'} style={{color: 'white'}}>{'Publications for Sector ' + (this.state.activePubSector+1) + '.' + (this.state.activePubRound)}</div>
			{playerDivs}
		</div>;
		return (
			<Modal
				open={this.state.pubModalOpen}
				onClose={this.closePubModal}
				className={'pub-modal'}
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
					{makeDiv(sector, 'A', 'Asteroid')}
					{makeDiv(sector, 'C', 'Comet')}
					{makeDiv(sector, 'D', 'Dwarf')}
					{makeDiv(sector, 'G', 'Gas Cloud')}
					{makeDiv(sector, null, 'Incorrect')}
				</div>
			</div>);
		});
		let height = (40 * this.state.publicPublish.length) + 'px';
		let content = <div style={{height: '100%', width: '100%'}}>{checkDivs}</div>
		return (
			<Modal
				open={this.state.publicPublish.length}
				onClose={this.closePubReviewModal}
				className={'pub-check-modal'}
				style={{height: height}}
			>
				{content}
			</Modal>
		);
	}

	renderPubBar() {
		let allPlayerDivs = [];
		let things = ['A', 'A', 'A', 'A', 'C', 'C', 'D', 'D', 'D', 'D', 'G', 'G', 'Scan', 'Scan'];
		this.state.playerPubs.forEach((player, i) => {
			let playerDivs = [];
			player.pubs.forEach((on, j) => {
				let width = (things[j] === 'Scan') ? '128px' : '40px';
				let style = (on) ? {background: player.color, color: 'black', width: width, fontWeight: 800} :
					{background: 'black', color: player.color, width: width, fontWeight: 400};
				playerDivs.push(<div className={'player-pub-square'} style={style} onClick={() => this.togglePub(i, j)}>{things[j]}</div>);
			});
			allPlayerDivs.push(
				<div className={'section'}>
					<div style={{color: player.color}}>{player.name}</div>
					<div style={{display: 'flex', flexWrap: 'wrap', margin: '4px'}}>
						{playerDivs}
					</div>
				</div>
			)
		});
		return(
			<div className={'pub-box'}>
				{allPlayerDivs}
			</div>
		);
	}
	renderSettingsModal() {
		// let colors = [
		// 	'#e23e64',
		// 	'#a93ee2',
		// 	'#3ec0e2',
		// 	'#e2b43e',
		// ];
		let playerDivs = [];
		let seasonDivs = [];
		let playerCountDivs = [];
		seasonDivs.push(<div className={'settings-season-box'}>Season: </div>);
		playerCountDivs.push(<div className={'settings-season-box'}>Players: </div>);
		let seasons = ['Summer', 'Fall', 'Winter', 'Spring'];
		seasons.forEach((season, i) => {
			let seasonStyle = (season === this.state.season) ? {background: this.state.colors[i], color: 'black', fontWeight: 800} :
					{background: 'black', color: this.state.colors[i], fontWeight: 400};
			seasonDivs.push(<div className={'settings-season-box'} style={seasonStyle} onClick={() => this.setSeason(season)}>{season}</div>);
			let countStyle = ((i+1) === this.state.playerCount) ? {background: this.state.colors[i], color: 'black', fontWeight: 800} :
					{background: 'black', color: this.state.colors[i], fontWeight: 400};
			playerCountDivs.push(<div className={'settings-season-box'} style={countStyle} onClick={() => this.setPlayerCount(i+1)}>{i+1}</div>);
		});
		for(let i = 0; i < this.state.playerCount; i++) {
			playerDivs.push(
				<input type="text" className={'settings-player-text'} style={{background: this.state.players[i].color}} name={'player-'+i} onChange={(e) => this.setPlayerName(i, e.target.value)} value={this.state.players[i].name}/>
			);
		}

		return (
			<Modal
				open={this.state.settingsModalOpen}
				onClose={this.closeSettingsModal}
				className={'settings-modal'}
			  >
				<div style={{width: '100%', height: '100%'}}>
					<div style={{width: '100%', textAlign: 'center', color: 'white', fontSize: '30px', fontWeight: '900', marginBottom: '15px'}}>Settings</div>
					<div className={'settings-season'}>
						<div className={'settings-season-box'}>Code: </div>
						<input type="text" className={'settings-code-text'} name="code" onChange={(e) => this.setCode(e)} value={this.state.code}/>
					</div>
					<div className={'settings-season'}>{seasonDivs}</div>
					<div className={'settings-season'}>{playerCountDivs}</div>
					<div className={'settings-season'}>{playerDivs}</div>

				</div>

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
				{this.renderPubReviewModal()}
				{this.renderSettingsModal()}
				{this.renderPubBar()}
				<div id={'sky'} className="sky">
					{this.showPieces()}
					{this.renderVisible()}
					<div className="inner-sky">
						<div className='middle'/>
						<div className='center'/>
						{this.createSlices(this.state.skySize)}
					</div>
				</div>
				{this.renderSidebar()}
			</div>
		);
	}
}

export default App;
