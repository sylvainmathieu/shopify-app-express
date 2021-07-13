import React, { useState } from "react"
import { Button, FormLayout, Select } from "@shopify/polaris"
import { ConfigDay } from "../../../../widget/src/models/WidgetSettings"

interface Props {
	onAdd: (day: ConfigDay) => void
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AddTimeSlotException({ onAdd }: Props) {
	const [selectedDay, setSelectedDay] = useState<ConfigDay>("MONDAY")

	return (
		<div className="addTimeSlot">
			<FormLayout>
				<Select
					label="Exception for"
					onChange={(value) => setSelectedDay(value as ConfigDay)}
					options={daysOfWeek.map((day) => ({ value: day.toUpperCase() as ConfigDay, label: day }))}
					value={selectedDay}
				/>
				<Button onClick={() => onAdd(selectedDay)}>Add</Button>
			</FormLayout>
		</div>
	)
}
