import { h, render } from "preact"
import AvailableDatePicker from "./AvailableDatePicker"
import "./styles/main.less"
import { anchorElement } from "./constants"

if (anchorElement) {
	render(<AvailableDatePicker/>, anchorElement)
}
