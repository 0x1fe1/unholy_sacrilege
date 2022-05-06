/* 
const words = document.querySelectorAll('.word')
const movableWord = document.querySelector('.word.movable')
*/

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

const dictionary = document.querySelector('.dictionary')
dictionary.addEventListener('click', () => {
	alert('Ещё нет выбора')
})

const continueButton = document.querySelector('.continue-button')
continueButton.addEventListener('click', () => {
	updateLives(true)
})

function updateLives(mistake = false) {
	if (!mistake) return true

	const centerElement = document.querySelector('.center')
	const wordList = centerElement.children[0]
	const message = centerElement.children[1]
	const continueButton = centerElement.children[2]
	wordList.classList.toggle('hidden')
	message.classList.toggle('hidden')

	if (!continueButton.classList.contains('kos')) {
		continueButton.classList.toggle('kos')
		return true
	}
	continueButton.classList.toggle('kos')

	const lives = document.querySelector('.lives')
	const life = Array.from(lives.classList)[1]

	if (life === 'l3') {
		lives.classList.toggle('l3')
		lives.classList.toggle('l2')
		lives.innerText = '💛💛'
		return true
	}
	if (life === 'l2') {
		lives.classList.toggle('l2')
		lives.classList.toggle('l1')
		lives.innerText = '❤'
		return true
	}
	if (life === 'l1') {
		lives.classList.toggle('l1')
		triggerEndgame()
		return true
	}

	return false
}

function triggerEndgame() {
	alert('Game Has Ended')
}
