const fsbutton = document.querySelector('.fullscreen')

fsbutton.addEventListener('click', () => {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen()
	} else {
		document.exitFullscreen()
	}
})
