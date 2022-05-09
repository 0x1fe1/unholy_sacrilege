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
const words = document.querySelectorAll('.word:not(.movable)')

let gameState = GAME_STATES.start

//#endregion

//#region - Event Listeners

dictionary.addEventListener('click', () => {
	alert('Ещё нет выбора') //TODO
})

continueButton.addEventListener('click', () => {
	handleContinueClick(true)
})

// dragTouch(movableWord, true)
// dragMouse(movableWord)

words.forEach((word) => {
	dragTouch(word)
	word.addEventListener('touchstart', (e) => {
		handleWordMovingStart(e, word)
	})
	word.addEventListener('touchend', (e) => {
		handleWordMovingEnd(e, word)
	})

	dragMouse(word)
	word.addEventListener('mousedown', (e) => {
		handleWordMovingStart(e, word)
	})
	word.addEventListener('mouseup', (e) => {
		handleWordMovingEnd(e, word)
	})
})

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

function handleWordMovingStart(e, word) {
	word.style.left = e.target.offsetLeft + 'px'
	word.style.top = e.target.offsetTop + 'px'
	word.classList.toggle('movable', true)

	// word.classList.toggle(INVISIBLE_KEY, true)
	// movableWord.classList.toggle(HIDDEN_KEY, false)
}
function handleWordMovingEnd(e, word) {
	word.classList.toggle('movable', false)
	// word.classList.toggle(INVISIBLE_KEY, false)
	// movableWord.classList.toggle(HIDDEN_KEY, true)
	// movableWord.style.left = -100 + 'px'
	// movableWord.style.top = -100 + 'px'
}

function dragTouch(el, kos2) {
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0

	el.addEventListener('touchstart', touchStart)

	function touchStart(e) {
		e = e || window.event
		e.preventDefault()
		e = e.changedTouches[0]
		pos3 = e.clientX
		pos4 = e.clientY
		el.addEventListener('touchend', touchEnd)
		el.addEventListener('touchmove', touchMove)
	}

	function touchMove(e) {
		e = e || window.event
		e.preventDefault()
		e = e.changedTouches[0]
		pos1 = pos3 - e.clientX
		pos2 = pos4 - e.clientY
		pos3 = e.clientX
		pos4 = e.clientY
		el.style.top = el.offsetTop - pos2 + 'px'
		el.style.left = el.offsetLeft - pos1 + 'px'
	}

	function touchEnd() {
		kos2 && el.removeEventListener('touchstart', touchStart)
		el.removeEventListener('touchend', touchEnd)
		el.removeEventListener('touchmove', touchMove)
	}
}

function dragMouse(el, kos2) {
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0
	el.onmousedown = mouseDown

	function mouseDown(e) {
		e = e || window.event
		e.preventDefault()
		pos3 = e.clientX
		pos4 = e.clientY
		document.onmouseup = mouseUp
		document.onmousemove = mouseMove
	}

	function mouseMove(e) {
		e = e || window.event
		e.preventDefault()
		pos1 = pos3 - e.clientX
		pos2 = pos4 - e.clientY
		pos3 = e.clientX
		pos4 = e.clientY
		el.style.top = el.offsetTop - pos2 + 'px'
		el.style.left = el.offsetLeft - pos1 + 'px'
	}

	function mouseUp() {
		kos2 && (document.onmousedown = null)
		document.onmouseup = null
		document.onmousemove = null
	}
}
//#endregion
