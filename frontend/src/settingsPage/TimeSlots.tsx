import React, { useState } from "react"
import { TimeSlot, WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { Checkbox, Button, Popover, Tag } from "@shopify/polaris"
import AddTimeSlot from "./AddTimeSlot"
import _ from "lodash"

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function TimeSlots({ widgetSettings, onWidgetSettingsChange }: Props) {
	const [timeSlotOpen, setAddTimeSlotOpen] = useState<boolean>()

	const togglePopoverActive = () => setAddTimeSlotOpen((active) => !active)

	const handleAddTimeSlot = (timeSlot: TimeSlot) => {
		const timeSlots = _.sortBy([...(widgetSettings.timeSlots || []), timeSlot], "from")
		onWidgetSettingsChange({ ...widgetSettings, timeSlots })
		setAddTimeSlotOpen(false)
	}

	const handleRemoveTimeSlot = (index: number) => () => {
		const timeSlots = [...(widgetSettings.timeSlots || [])]
		timeSlots.splice(index, 1)
		onWidgetSettingsChange({ ...widgetSettings, timeSlots })
	}

	const handleTimeSlotsEnabled = (timeSlotsEnabled: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, timeSlotsEnabled })
	}

	return (
		<div className="timeSlotsSection">
			<Checkbox
				label="Enable the time slot selector"
				checked={widgetSettings.timeSlotsEnabled}
				onChange={(value) => handleTimeSlotsEnabled(value)}
			/>
			<div className="tags">
				{(widgetSettings.timeSlots || []).map((timeSlot, index) => {
					return (
						<Tag key={index} onRemove={handleRemoveTimeSlot(index)}>
							{`${timeSlot.from} - ${timeSlot.to}`}
						</Tag>
					)
				})}
				{(widgetSettings.timeSlots || []).length == 0 && <em>No time slots defined</em>}
			</div>
			<Popover
				activator={
					<Button onClick={togglePopoverActive} disclosure>
						Add time slot
					</Button>
				}
				active={timeSlotOpen}
				onClose={() => setAddTimeSlotOpen(false)}
				preferredAlignment="left"
			>
				<AddTimeSlot onAdd={handleAddTimeSlot} />
			</Popover>
		</div>
	)
}
