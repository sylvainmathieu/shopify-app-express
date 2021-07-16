import { h, render } from "preact"
import AvailableDatePicker from "./AvailableDatePicker"
import "./styles/main.less"
import { anchorId, appUrl } from "./constants"
import axios from "axios"

export let productAnchorElement = undefined
export let cartAnchorElement = undefined

function initWidget() {
	if (productAnchorElement) {
		return
	}

	const isCartPage = document.querySelectorAll("form[action='/cart']").length > 0
	if (isCartPage) {
		cartAnchorElement = document.getElementById(anchorId)
		if (!cartAnchorElement) {
			const submitButtonContainer = document.querySelectorAll("div.cart__buttons-container")
			if (submitButtonContainer?.length === 1) {
				const submitButtonParent = submitButtonContainer[0].closest(":not(.cart__buttons-container)")
				if (submitButtonParent) {
					cartAnchorElement = document.createElement("div")
					cartAnchorElement.id = anchorId
					submitButtonParent.insertBefore(cartAnchorElement, submitButtonContainer[0])
				}
			}
		}
	} else {
		productAnchorElement = document.getElementById(anchorId)
		if (!productAnchorElement) {
			const productForm = document.querySelectorAll("form[action*='/cart/add']")
			if (productForm?.length === 1) {
				productAnchorElement = document.createElement("div")
				productAnchorElement.id = anchorId
				productForm[0].append(productAnchorElement)
			}
		}
	}

	if (productAnchorElement || cartAnchorElement) {
		try {
			if (productAnchorElement) {
				render(<AvailableDatePicker />, productAnchorElement)
			}
			if (cartAnchorElement) {
				render(<AvailableDatePicker isCartPage />, cartAnchorElement)
			}
		} catch (e) {
			console.error(e)
			axios.post(appUrl + "/errors", { error: e.stack }, {
				headers: {
					Accept: "application/json"
				}
			})
		}
	}
}


const jQuery: any | undefined = (window as any).jQuery

if (jQuery) {
	jQuery(() => {
		initWidget()
	})
} else {
	initWidget()
}
