function updateNavbarContainerPadding() {
	let navbarContainer = document.getElementById('navbar-container') as HTMLDivElement

	if (window.innerWidth < 576) {
		navbarContainer.classList.remove("pt-0")
	} else {
		navbarContainer.classList.add("pt-0")
	}
}

window.addEventListener("resize", (event: UIEvent) => {
	updateNavbarContainerPadding()
})

updateNavbarContainerPadding()