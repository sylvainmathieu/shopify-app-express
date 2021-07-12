import React, { useState } from "react"
import { Button, Popover, Tag } from "@shopify/polaris"
import AddTimeSlot from "./AddTimeSlot"
import { TimeSlot, WidgetSettings } from "../../../../widget/src/models/WidgetSettings"
import _ from "lodash"
import AddTimeSlotException from "./AddTimeSlotException"

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function TimeSlots({ widgetSettings, onWidgetSettingsChange }: Props) {
	const [addTimeSlotOpen, setAddTimeSlotOpen] = useState<boolean>()
	const [addExceptionOpen, setAddException] = useState<boolean>()

	const handleAddTimeSlot = (timeSlot: TimeSlot) => {
		const timeSlots = _.sortBy([...(widgetSettings.timeSlots || []), timeSlot], "from")
		onWidgetSettingsChange({ ...widgetSettings, timeSlots })
		setAddException(false)
	}

	const handleAddTimeSlotException = (dayOfWeek: string) => {}

	const handleRemoveTimeSlot = (index: number) => () => {
		const timeSlots = [...(widgetSettings.timeSlots || [])]
		timeSlots.splice(index, 1)
		onWidgetSettingsChange({ ...widgetSettings, timeSlots })
	}

	return (
		<div className="timeSlotsSection">
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
			<div className="buttons">
				<div className="buttonHolder">
					<Popover
						activator={
							<Button onClick={() => setAddTimeSlotOpen((active) => !active)} disclosure>
								Add time slot
							</Button>
						}
						active={addTimeSlotOpen}
						onClose={() => setAddTimeSlotOpen(false)}
						preferredAlignment="left"
					>
						<AddTimeSlot onAdd={handleAddTimeSlot} />
					</Popover>
				</div>
				<div className="buttonHolder">
					<Popover
						activator={
							<Button onClick={() => setAddException((active) => !active)} disclosure>
								Add exception
							</Button>
						}
						active={addExceptionOpen}
						onClose={() => setAddException(false)}
						preferredAlignment="left"
					>
						<AddTimeSlotException onAdd={handleAddTimeSlotException} />
					</Popover>
				</div>
			</div>
		</div>
	)
}
