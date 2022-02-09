function getUpmostParentWithSingleChild(element: HTMLElement) {
	let currentElement = element
	let resultElement = element

	// Hide the parent if it only contains one element
	while (true) {
		currentElement = currentElement.parentElement

		if (currentElement.childElementCount > 1) {
			break
		}

		resultElement = currentElement
	}

	return resultElement
}

export function hideElement(...elements: HTMLElement[]) {
	for (let element of elements) {
		if (element == null) continue

		let parent = getUpmostParentWithSingleChild(element)
		parent.classList.add("d-none")
	}
}

export function showElement(...elements: HTMLElement[]) {
	for (let element of elements) {
		if (element == null) continue

		let parent = getUpmostParentWithSingleChild(element)
		parent.classList.remove("d-none")
	}
}