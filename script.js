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

const dictionaryButton = document.querySelector('.dictionary')
const dictionary = WORD_LISTS.c

const continueButton = document.querySelector('.continue-button')
const message = document.querySelector('.message')
const messageTexts = {
	correct: document.querySelector('.message-correct'),
	incorrect: document.querySelector('.message-incorrect'),
}

const leftSection = document.querySelector('.left.section')
const centerSection = document.querySelector('.center.section')
const rightSection = document.querySelector('.right.section')
const sections = document.querySelectorAll('.section')

const words = document.querySelectorAll('.word')

let gameState = GAME_STATES.start
let currentWords = { correct: [], incorrect: [] }

//#endregion

//#region - Event Listeners

dictionaryButton.addEventListener('click', () => {
	alert('Ещё нет выбора') //TODO
	// restart()
})

continueButton.addEventListener('click', () => {
	handleContinueClick()
})

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
restart()
function restart() {
	gameState = GAME_STATES.start

	const [wordList, message, continueButton] = document.querySelector('.center').children
	wordList.classList.toggle(HIDDEN_KEY, false)
	message.classList.toggle(HIDDEN_KEY, true)
	continueButton.classList.toggle(KOS_KEY, false)

	Array.from(document.querySelectorAll('.word')).forEach((word) => {
		WORD_KEYS.forEach((key) => {
			word.classList.toggle(key, false)
		})
	})

	regenerateWords()

	document.querySelector('.lives').classList.toggle('l1', false)
	document.querySelector('.lives').classList.toggle('l2', false)
	document.querySelector('.lives').classList.toggle('l3', true)
	updateLives()
}

function handleContinueClick() {
	if (centerSection.querySelectorAll(`.word:not(.${INVISIBLE_KEY})`).length > 0) return

	if (gameState == GAME_STATES.end) {
		restart()
		return
	}

	const [wordList, message, continueButton] = document.querySelector('.center').children
	wordList.classList.toggle(HIDDEN_KEY)
	message.classList.toggle(HIDDEN_KEY)

	if (continueButton.classList.contains(KOS_KEY)) {
		continueButton.classList.toggle(KOS_KEY) // entering next level
		regenerateWords()
		return
	}
	continueButton.classList.toggle(KOS_KEY) // seeing results
	const answers = {
		left: getSectionWords(leftSection, (a) => !a.classList.contains(INVISIBLE_KEY)),
		right: getSectionWords(rightSection, (a) => !a.classList.contains(INVISIBLE_KEY)),
	}
	let [correctAmt1, incorrectAmt1] = colorWords(answers.left, 'INCORRECT')
	let [correctAmt2, incorrectAmt2] = colorWords(answers.right, 'CORRECT')
	const correctAmt = correctAmt1 + correctAmt2
	const incorrectAmt = incorrectAmt1 + incorrectAmt2

	messageTexts.correct.innerText = `Правильно: ${correctAmt}`
	messageTexts.incorrect.innerText = `Неправильно: ${incorrectAmt}`

	if (incorrectAmt === 0) return

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
	alert('Вы Проиграли') //TODO
	restart()
}

function handleWordMovingStart(e, word) {
	if (word.classList.contains(INVISIBLE_KEY)) return

	const replacementWord = document.createElement('div')
	replacementWord.style.zIndex = '-10'
	replacementWord.classList.toggle('word', true)
	replacementWord.classList.toggle(getWordIndex(word), true)
	replacementWord.classList.toggle(INVISIBLE_KEY, true)
	replacementWord.classList.toggle('replacement', true)
	replacementWord.innerText = word.innerText + ' (new)'

	word.style.left = e.target.offsetLeft + 'px'
	word.style.top = e.target.offsetTop + 'px'
	word.classList.toggle('movable', true)

	word.parentElement.appendChild(replacementWord)
}

function handleWordMovingEnd(e, word) {
	if (word.classList.contains(INVISIBLE_KEY)) return

	const toReplace = document.querySelector(`.${getWordIndex(word)}.replacement`)
	toReplace.parentElement.appendChild(word)
	const existing = word.parentElement.querySelectorAll(
		`.${getWordIndex(toReplace)}.${INVISIBLE_KEY}.replacement`,
	)
	if (existing.length >= 1) {
		existing.forEach((w) => {
			w.remove()
		})
	}

	word.classList.toggle('movable', false)
	const wordPos = calculatePosition(word, true)

	const leftSectionPos = calculatePosition(leftSection)
	if (isInside(wordPos, leftSectionPos)) {
		const i = getNextWordIndex(leftSection)
		const newWord = leftSection.querySelector(`.${i}`)
		if (newWord == null) return
		newWord.innerText = word.innerText
		newWord.classList.toggle(INVISIBLE_KEY, false)
		word.classList.toggle(INVISIBLE_KEY, true)
		return
	}

	const rightSectionPos = calculatePosition(rightSection)
	if (isInside(wordPos, rightSectionPos)) {
		const i = getNextWordIndex(rightSection)
		const newWord = rightSection.querySelector(`.${i}`)
		if (newWord == null) return
		newWord.innerText = word.innerText
		newWord.classList.toggle(INVISIBLE_KEY, false)
		word.classList.toggle(INVISIBLE_KEY, true)
		return
	}

	const centerSectionPos = calculatePosition(centerSection)
	if (isInside(wordPos, centerSectionPos)) {
		const i = getNextWordIndex(centerSection)
		const newWord = centerSection.querySelector(`.${i}`)
		if (newWord == null) return
		newWord.innerText = word.innerText
		newWord.classList.toggle(INVISIBLE_KEY, false)
		word.classList.toggle(INVISIBLE_KEY, true)
		return
	}
}

function dragTouch(el) {
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
		el.removeEventListener('touchend', touchEnd)
		el.removeEventListener('touchmove', touchMove)
	}
}

function dragMouse(el) {
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
		el.onmouseup = mouseUp
		el.onmousemove = mouseMove
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
		el.onmouseup = null
		el.onmousemove = null
	}
}

function getWordIndex(word) {
	let result = ''
	;['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'].forEach((i) => {
		if (word.classList.contains(i)) result = i
	})
	return result
}

function calculatePosition(el, style = false) {
	if (style)
		return {
			left: parseInt(el.style.left.replace('px', '')),
			right: parseInt(el.style.left.replace('px', '')) + el.clientWidth,
			top: parseInt(el.style.top.replace('px', '')),
			bottom: parseInt(el.style.top.replace('px', '')) + el.clientHeight,
		}

	if (!style)
		return {
			left: el.offsetLeft,
			right: el.offsetLeft + el.clientWidth,
			top: el.offsetTop,
			bottom: el.offsetTop + el.clientHeight,
		}
}

function isInside(a, b) {
	return (
		a.left <= b.right && a.top <= b.bottom && a.right >= b.left && a.bottom >= b.top
	)
}

function getNextWordIndex(section) {
	const words = Array.from(section.querySelectorAll(`.word.${INVISIBLE_KEY}`))
	const indecies = words.map((word) => getWordIndex(word))
	return indecies.sort()[0]
}

function getSectionWords(section, filter = () => true) {
	const foo = section.querySelectorAll('.word')
	return Array.from(foo)
		.sort((a, b) => {
			const A = getWordIndex(a)
			const B = getWordIndex(b)
			return parseInt(A[1]) - parseInt(B[1])
		})
		.filter(filter)
}

function regenerateWords() {
	getSectionWords(leftSection).forEach((w) => {
		w.classList.toggle(INVISIBLE_KEY, true)
		w.classList.toggle(CORRECT_KEY, false)
		w.classList.toggle(INCORRECT_KEY, false)
		w.innerText = ''
	})

	getSectionWords(rightSection).forEach((w) => {
		w.classList.toggle(INVISIBLE_KEY, true)
		w.classList.toggle(CORRECT_KEY, false)
		w.classList.toggle(INCORRECT_KEY, false)
		w.innerText = ''
	})

	const wordsToInsert = getWords()
	getSectionWords(centerSection).forEach((w, i) => {
		const chosenWord = wordsToInsert[i]

		if (chosenWord == null) {
			w.classList.toggle(INVISIBLE_KEY, true)
			w.innerText = ''
			return
		}

		w.classList.toggle(INVISIBLE_KEY, false)
		w.innerText = chosenWord
	})
}

function getWords() {
	const wordAmt = random('i', 2, 8) //getAmount(level)
	const correctAmt = random('i', 0, Math.min(wordAmt, 6))
	const incorrectAmt = wordAmt - correctAmt
	const selectedWords = []
	console.log(wordAmt, correctAmt, incorrectAmt)

	for (let i = 0; i < correctAmt; i++) {
		selectedWords.push(random(dictionary.CORRECT))
	}
	for (let i = 0; i < incorrectAmt; i++) {
		selectedWords.push(random(dictionary.INCORRECT))
	}

	return random('s', selectedWords)
}

function colorWords(words, key) {
	let correctAmt = 0
	let incorrectAmt = 0
	words.forEach((word) => {
		const correctness = isCorrect(word.innerText)
		if (correctness === key) {
			correctAmt += 1
			word.classList.toggle(CORRECT_KEY, true)
			word.classList.toggle(INCORRECT_KEY, false)
		} else {
			incorrectAmt += 1
			word.classList.toggle(CORRECT_KEY, false)
			word.classList.toggle(INCORRECT_KEY, true)
		}
	})
	return [correctAmt, incorrectAmt]
}

function isCorrect(word) {
	if (dictionary.CORRECT.includes(word)) return 'CORRECT'
	if (dictionary.INCORRECT.includes(word)) return 'INCORRECT'
	console.error('isCorrect error', arguments)
}

function random() {
	const args = Array.from(arguments)
	if (args.length === 0) return Math.random()

	if (args.length === 1) {
		if (typeof args[0] === 'number') return Math.random() * args[0]
		if (Array.isArray(args[0]))
			return args[0][Math.floor(Math.random() * args[0].length)]
		return console.error('random function error: ', args)
	}

	if (args[0] === 'shuffle' || args[0] === 's') {
		const array = args[1]
		let currentIndex = array.length,
			randomIndex

		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex--
			;[array[currentIndex], array[randomIndex]] = [
				array[randomIndex],
				array[currentIndex],
			]
		}

		return array
	}

	if (args[0] === 'int' || args[0] === 'i') {
		return Math.floor(random(...args.slice(1)))
	}

	if (args[0] === 'weights' || args[0] === 'w') {
		const data = args[1]
		const sum = data.reduce((a, b) => a + b[1], 0)
		const value = random(sum)
		for (let i = 0, t = 0; i < data.length; i++) {
			if (value < t) return data[i - 1][0]
			t += data[i][1]
		}
		return data[data.length - 1][0]
	}

	if (args[0] === 'divide' || args[0] === 'd') {
		const num = args[2] ?? 1
		let value = (args[1] ?? 1) / num

		// const points = new Array(num - 1)
		// 	.fill()
		// 	.map((_) => random(value))
		// 	.sort()
		// const result = points.map((p, i) => (i == 0 ? p : p - points[i - 1]))
		// result[num - 1] = value - points[num - 2]

		const result = new Array(num).fill(-1)
		const n = getNoise(args[3])
		for (let i = 0; i < num; i++) {
			value -= result[i] = i === num - 1 ? value : value * n
		}

		return random('s', result)
	}

	if (args.length === 2) {
		if (typeof args[0] === 'number' && typeof args[1] === 'number')
			return args[0] + (args[1] - args[0]) * Math.random()
		return console.error('random function error: ', args)
	}

	return console.error('random function error: ', args)
}

//#endregion
