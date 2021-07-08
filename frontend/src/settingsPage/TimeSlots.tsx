import React, { useState } from "react"
import { TimeSlot, WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { Checkbox, Button, ResourceList, Popover, ResourceItem } from "@shopify/polaris"
import AddTimeSlot from "./AddTimeSlot"
import _ from "lodash"

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function TimeSlots({ widgetSettings, onWidgetSettingsChange }: Props) {
	const [addDateOpen, setAddDateOpen] = useState<boolean>()

	const togglePopoverActive = () => setAddDateOpen((active) => !active)

	const handleAddTimeSlot = (timeSlot: TimeSlot) => {
		const timeSlots = _.sortBy([...(widgetSettings.timeSlots || []), timeSlot], "from")
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
			<div className="timeSlots">
				<em>No time slots configured yet.</em>
				<ResourceList
					resourceName={{ singular: "time slot", plural: "time slots" }}
					items={widgetSettings.timeSlots || []}
					renderItem={(timeSlot: TimeSlot) => {
						return (
							<ResourceItem id={timeSlot.from + timeSlot.to} onClick={() => {}}>
								{timeSlot.from} - {timeSlot.to}
							</ResourceItem>
						)
					}}
				/>
			</div>
			<Popover
				activator={
					<Button onClick={togglePopoverActive} disclosure>
						Add time slot
					</Button>
				}
				active={addDateOpen}
				onClose={() => setAddDateOpen(false)}
				preferredAlignment="left"
			>
				<AddTimeSlot onAdd={handleAddTimeSlot} />
			</Popover>
		</div>
	)
}
