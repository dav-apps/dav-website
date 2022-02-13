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

export async function getUserAgentModel(): Promise<string> {
	if (navigator["userAgentData"]) {
		let userAgentData = navigator["userAgentData"]
		let uaValues = await userAgentData.getHighEntropyValues(["model"])
		let model = uaValues["model"]

		if (model && model.length > 0) return model
		return null
	}
}

export async function getUserAgentPlatform(): Promise<string> {
	if (navigator["userAgentData"]) {
		let userAgentData = navigator["userAgentData"]
		let uaValues = await userAgentData.getHighEntropyValues(["platform", "platformVersion"])
		let platform = uaValues["platform"]
		let platformVersion = uaValues["platformVersion"]

		if (platform && platform.length > 0) {
			if (platformVersion && platformVersion.length > 0) {
				platform += ` ${platformVersion}`
			}

			return platform
		}

		return null
	}
}