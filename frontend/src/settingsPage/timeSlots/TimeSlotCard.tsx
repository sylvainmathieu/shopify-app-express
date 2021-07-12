import React from "react"
import { WidgetSettings } from "../../../../widget/src/models/WidgetSettings"
import { Checkbox, Card, FormLayout } from "@shopify/polaris"
import TimeSlots from "./TimeSlots"

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function TimeSlotCard({ widgetSettings, onWidgetSettingsChange }: Props) {
	const handleTimeSlotsEnabled = (timeSlotsEnabled: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, timeSlotsEnabled })
	}

	const handleMandatoryTimeSlotChecked = (mandatoryTimeSlot: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, mandatoryTimeSlot })
	}

	const handleTimeSlotDeselectedFirstChecked = (timeSlotDeselectedFirst: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, timeSlotDeselectedFirst })
	}

	return (
		<Card title="Time slot settings">
			<Card.Section>
				<FormLayout>
					<Checkbox
						label="Enable the time slot selector"
						checked={widgetSettings.timeSlotsEnabled}
						onChange={(value) => handleTimeSlotsEnabled(value)}
					/>
					{widgetSettings.timeSlotsEnabled && (
						<TimeSlots widgetSettings={widgetSettings} onWidgetSettingsChange={onWidgetSettingsChange} />
					)}
					<Checkbox
						label="A time slot must be selected to be able to add a product to the cart"
						checked={widgetSettings.mandatoryTimeSlot}
						onChange={(value) => handleMandatoryTimeSlotChecked(value)}
					/>
					<Checkbox
						label="The time slot appears deselected at first"
						checked={widgetSettings.timeSlotDeselectedFirst}
						onChange={(value) => handleTimeSlotDeselectedFirstChecked(value)}
					/>
				</FormLayout>
			</Card.Section>
		</Card>
	)
}
