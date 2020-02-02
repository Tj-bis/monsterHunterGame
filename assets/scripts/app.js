const ATTACK_VALUE = 10;
const MONSTER_ATTACK_VALUE = 17;
const STRONG_ATTACK = 20;
const HEALING_VALUE = 10;
const MODE_ATTACK = 'ATTACK';
const MODE_STRONG_ATTACK = 'STRONG_ATTACK';

const LOG_EVENT_PLAYER_ATTACK = 'PLAYER_ATTACK';
const LOG_EVENT_PLAYER_STRONG_ATTACK = 'PLAYER_STRONG_ATTACK';
const LOG_EVENT_MONSTER_ATTACK = 'MONSTER_ATTACK';
const LOG_EVENT_PLAYER_HEAL = 'PLAYER_HEAL';
const LOG_EVENT_GAME_OVER = 'GAME_OVER';
let battleLog = [];
let hasBonusLife = true;
let lastLoggedEntry;

function getMaxLifeValues () {
	const enteredHealthValue = prompt(
		'Choose the maximum life for you and the Monster',
		'100'
	);
	const parsedValue = parseInt(enteredHealthValue);
	if (isNaN(parsedValue) || parsedValue <= 0) {
		throw {	message: 'Invalid User input, not a number!' };
	}
	return parsedValue;
}

let chosenMaxLife;

try {
	chosenMaxLife = getMaxLifeValues();
} catch (error) {
	console.log(error);
	chosenMaxLife = 100;
	//throw error;
} 


let currentMonsterHealth = chosenMaxLife;
let currentPlayerHealth = chosenMaxLife;

adjustHealthBars(chosenMaxLife);

function combatLog(event, value, monsterHealth, playerHealth) {
	let logEntry = {
		event: event,
		value: value,
		finalMonsterHealth: monsterHealth,
		finalPlayerHealth: playerHealth
	};

	switch (event) {
		case LOG_EVENT_PLAYER_ATTACK:
			logEntry.target = 'MONSTER';
			break;
		case LOG_EVENT_PLAYER_STRONG_ATTACK:
			logEntry = {
				event: event,
				value: value,
				target: 'MONSTER',
				finalMonsterHealth: monsterHealth,
				finalPlayerHealth: playerHealth
			};
			break;
		case LOG_EVENT_MONSTER_ATTACK:
			logEntry = {
				event: event,
				value: value,
				target: 'PLAYER',
				finalMonsterHealth: monsterHealth,
				finalPlayerHealth: playerHealth
			};
			break;
		case LOG_EVENT_PLAYER_HEAL:
			logEntry = {
				event: event,
				value: value,
				target: 'PLAYER',
				finalMonsterHealth: monsterHealth,
				finalPlayerHealth: playerHealth
			};
			break;
		case LOG_EVENT_GAME_OVER:
			logEntry = {
				event: event,
				value: value,
				finalMonsterHealth: monsterHealth,
				finalPlayerHealth: playerHealth
			};
			break;
		default:
			logEntry = {};
	}

	// if (event === LOG_EVENT_PLAYER_ATTACK) {
	// 	logEntry.target = 'MONSTER';
	// } else if (event === LOG_EVENT_PLAYER_STRONG_ATTACK) {
	// 	logEntry = {
	// 		event: event,
	// 		value: value,
	// 		target: 'MONSTER',
	// 		finalMonsterHealth: monsterHealth,
	// 		finalPlayerHealth: playerHealth
	// 	};
	// } else if ((event === LOG_EVENT_MONSTER_ATTACK)) {
	// 	logEntry = {
	// 		event: event,
	// 		value: value,
	// 		target: 'PLAYER',
	// 		finalMonsterHealth: monsterHealth,
	// 		finalPlayerHealth: playerHealth
	// 	};
	// } else if ((event === LOG_EVENT_PLAYER_HEAL)) {
	// 	logEntry = {
	// 		event: event,
	// 		value: value,
	// 		target: 'PLAYER',
	// 		finalMonsterHealth: monsterHealth,
	// 		finalPlayerHealth: playerHealth
	// 	};
	// } else if ((event === LOG_EVENT_GAME_OVER)) {
	// 	logEntry = {
	// 		event: event,
	// 		value: value,
	// 		finalMonsterHealth: monsterHealth,
	// 		finalPlayerHealth: playerHealth
	// 	};
	// }
	battleLog.push(logEntry);
}

function reset() {
	currentPlayerHealth = chosenMaxLife;
	currentMonsterHealth = chosenMaxLife;
	resetGame(chosenMaxLife);
}

function endRound() {
	const initialPlayerHealth = currentPlayerHealth;
	const playerDamage = dealPlayerDamage(MONSTER_ATTACK_VALUE);
	currentPlayerHealth -= playerDamage;
	combatLog(
		LOG_EVENT_MONSTER_ATTACK,
		playerDamage,
		currentMonsterHealth,
		currentPlayerHealth
	);
	if (currentPlayerHealth <= 0 && hasBonusLife) {
		hasBonusLife = false;
		removeBonusLife();
		currentPlayerHealth = initialPlayerHealth;
		setPlayerHealth(initialPlayerHealth);
		alert('Bonus Life!');
	}
	if (currentMonsterHealth <= 0 && currentPlayerHealth > 0) {
		alert('Player has won the battle!');
		combatLog(
			LOG_EVENT_GAME_OVER,
			'PLAYER WON',
			currentMonsterHealth,
			currentPlayerHealth
		);
	} else if (currentPlayerHealth <= 0 && currentMonsterHealth > 0) {
		alert('Monster won, Try again!');
		combatLog(
			LOG_EVENT_GAME_OVER,
			'MONSTER WON',
			currentMonsterHealth,
			currentPlayerHealth
		);
	} else if (currentMonsterHealth <= 0 && currentPlayerHealth <= 0) {
		alert('You have a draw!');
		combatLog(
			LOG_EVENT_GAME_OVER,
			'DRAW',
			currentMonsterHealth,
			currentPlayerHealth
		);
	}

	if (currentMonsterHealth <= 0 || currentPlayerHealth <= 0) {
		reset();
	}
}

function attackMonster(mode) {
	// ternary operator in action, used instead of the IF block below.
	const maxDamage = mode === MODE_ATTACK ? ATTACK_VALUE : STRONG_ATTACK;
	const logEvent =
		mode === MODE_ATTACK
			? LOG_EVENT_PLAYER_ATTACK
			: LOG_EVENT_PLAYER_STRONG_ATTACK;

	// if (mode === MODE_ATTACK) {
	// 	maxDamage = ATTACK_VALUE;
	// 	logEvent = LOG_EVENT_PLAYER_ATTACK;
	// } else if (mode === MODE_STRONG_ATTACK) {
	// 	maxDamage = STRONG_ATTACK;
	// 	logEvent = LOG_EVENT_PLAYER_STRONG_ATTACK;
	// }
	const damage = dealMonsterDamage(maxDamage);
	currentMonsterHealth -= damage;
	combatLog(logEvent, damage, currentMonsterHealth, currentPlayerHealth);
	endRound();
}

function healPlayerHandler() {
	let heal;
	if (currentPlayerHealth >= chosenMaxLife - HEALING_VALUE) {
		alert("You can't heal more than your max health");
		heal = chosenMaxLife - currentPlayerHealth;
	} else {
		heal = HEALING_VALUE;
	}
	increasePlayerHealth(heal);
	currentPlayerHealth += heal;
	combatLog(
		LOG_EVENT_PLAYER_HEAL,
		heal,
		currentMonsterHealth,
		currentPlayerHealth
	);
	endRound();
}

function attackHandler() {
	attackMonster(MODE_ATTACK);
}

function strongAttackHandler() {
	attackMonster(MODE_STRONG_ATTACK);
}

function printLogHandler() {
	let i = 0;
	for (const el of battleLog) {
		//check if the lastloggedEntry is falsy (undefined) AND its not equal to 0 OR last logged entry is smaller than i
		//!lastLoggedEntry is true if the value is undefined AND is different than 0
		if ((!lastLoggedEntry && lastLoggedEntry !== 0) || lastLoggedEntry < i) {
			console.log(`#${i}`);
			for (const logEntryKey in el) {
				console.log(`${logEntryKey} => ${el[logEntryKey]}`);
				//console.log(el[logEntryKey]);
			}
			lastLoggedEntry = i;
			break;
		}
		i++;
	}
	//	console.log(battleLog);
}

attackBtn.addEventListener('click', attackHandler);
strongAttackBtn.addEventListener('click', strongAttackHandler);
healBtn.addEventListener('click', healPlayerHandler);
logBtn.addEventListener('click', printLogHandler);
