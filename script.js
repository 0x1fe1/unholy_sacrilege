//#region - Setup
const vh = window.innerHeight * 0.01
document.documentElement.style.setProperty('--vh', `${vh}px`)
window.addEventListener('resize', () => {
	const vh = window.innerHeight * 0.01
	document.documentElement.style.setProperty('--vh', `${vh}px`)
})

const fsbutton = document.querySelector('.fullscreen')
fsbutton.addEventListener('click', () => {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen()
	} else {
		document.exitFullscreen()
	}
})
//#endregion

//#region - Variables

//#region - Constant Keys
const HIDDEN_KEY = 'hidden'
const INVISIBLE_KEY = 'invisible'
const CORRECT_KEY = 'correct'
const INCORRECT_KEY = 'incorrect'
const WORD_KEYS = [HIDDEN_KEY, INVISIBLE_KEY, CORRECT_KEY, INCORRECT_KEY]

const KOS_KEY = 'kos' // kos <=> костыль

const GAME_STATES = { start: 'START', end: 'END' }
//#endregion

const continueButton = document.querySelector('.continue-button')

const dictionary = document.querySelector('.dictionary')

const movableWord = document.querySelector('.word.movable')
const words = document.querySelectorAll('.word')

let gameState = GAME_STATES.start

//#endregion

//#region - Event Listeners

dictionary.addEventListener('click', () => {
	alert('Ещё нет выбора') //TODO
})

continueButton.addEventListener('click', () => {
	handleContinueClick(true)
})

movableWord.classList.toggle(HIDDEN_KEY, false)
movableWord.addEventListener('touchmove', (e) => {
	console.log(e)
	;[...e.changedTouches].forEach((touch) => {
		movableWord.style.top = `${touch.pageY}px`
		movableWord.style.left = `${touch.pageX}px`
	})
})

// words.forEach((word) => //TODO
// 	word.addEventListener('click', () => {
// 		handleClick.wordMove(word)
// 	}),
// )

//#endregion

//#region - Functions
function restart() {
	gameState = GAME_STATES.start

	const [wordList, message, continueButton] =
		document.querySelector('.center').children
	wordList.classList.toggle(HIDDEN_KEY, false)
	message.classList.toggle(HIDDEN_KEY, true)
	continueButton.classList.toggle(KOS_KEY, false)

	Array.from(document.querySelectorAll('.word')).forEach((word) => {
		WORD_KEYS.forEach((key) => {
			word.classList.toggle(key, false)
		})
	})
	movableWord.classList.toggle(INVISIBLE_KEY, true)

	const leftWords = Array.from(
		document.querySelector('.left').children[0].children,
	)
	const rightWords = Array.from(
		document.querySelector('.right').children[0].children,
	) //TODO

	document.querySelector('.lives').classList.toggle('l1', false)
	document.querySelector('.lives').classList.toggle('l2', false)
	document.querySelector('.lives').classList.toggle('l3', true)
	updateLives()
}

function handleContinueClick(mistake = false) {
	if (gameState == GAME_STATES.end) {
		restart()
		return
	}

	if (!mistake) return // no mistakes were made

	const [wordList, message, continueButton] =
		document.querySelector('.center').children
	wordList.classList.toggle(HIDDEN_KEY)
	message.classList.toggle(HIDDEN_KEY)

	if (continueButton.classList.contains(KOS_KEY)) {
		continueButton.classList.toggle(KOS_KEY) // entering next level
		return
	}
	continueButton.classList.toggle(KOS_KEY) // seeing results

	const lives = document.querySelector('.lives')
	const life = lives.classList.item(1)

	switch (life) {
		case 'l3':
			;['l3', 'l2'].forEach((l) => lives.classList.toggle(l))
			updateLives()
			return

		case 'l2':
			;['l2', 'l1'].forEach((l) => lives.classList.toggle(l))
			updateLives()
			return

		case 'l1':
			handleEndgame()
			return
	}

	console.error('continue button error', this)
}

function updateLives() {
	const lives = document.querySelector('.lives')
	switch (lives.classList.item(1)) {
		case 'l3':
			lives.innerText = '💚💚💚'
			return

		case 'l2':
			lives.innerText = '💛💛'
			return

		case 'l1':
			lives.innerText = '❤'
			return
	}
}

function handleEndgame() {
	gameState = GAME_STATES.end
	console.warn('Game Has Ended') //TODO
}
//#endregion
