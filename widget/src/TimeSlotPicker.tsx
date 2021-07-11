import { h } from "preact"
import { WidgetSettings } from "./models/WidgetSettings"
import {
	DEFAULT_TIME_SLOT_DROPDOWN_DEFAULT_OPTION_LABEL,
	DEFAULT_TIME_SLOT_LABEL,
	DEFAULT_TIME_SLOT_TAG_LABEL,
} from "../../backend/src/util/constants"
import { useState } from "preact/hooks"

interface Props {
	settings: WidgetSettings
}

export default function TimeSlotPicker({ settings }: Props) {

	const [selectedTimeSlot, setSelectedTimeSlot] = useState(undefined)

	const dropdownDefaultOptionLabel = settings.messages.timeSlotDropdownDefaultOptionLabel || DEFAULT_TIME_SLOT_DROPDOWN_DEFAULT_OPTION_LABEL
	const timeSlotLabel = settings.messages.timeSlotLabel || DEFAULT_TIME_SLOT_LABEL
	const timeSlotTagLabel = settings.messages.timeSlotTagLabel || DEFAULT_TIME_SLOT_TAG_LABEL

	return (
		<div className="buunto-time-slot-picker">
			<div className="buunto-time-slot-picker-label">{timeSlotLabel}</div>
			<select className="buunto-time-slot-picker-dropdown buunto-dropdown" name={`properties[${timeSlotTagLabel}]`}
					onChange={setSelectedTimeSlot}>
				{!settings.mandatoryTimeSlot && <option value="">{dropdownDefaultOptionLabel}</option>}
				{(settings.timeSlots || []).map((timeSlot) => {
					const timeSlotValue = `${timeSlot.from} - ${timeSlot.to}`
					return <option value={timeSlotValue} selected={timeSlotValue == selectedTimeSlot}>
						{timeSlotValue}
					</option>
				})}
			</select>
		</div>
	)
}
