import React, { useState } from "react"
import { Button, FormLayout, Select } from "@shopify/polaris"

interface Props {
	onAdd: (day: string) => void
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AddTimeSlotException({ onAdd }: Props) {
	const [selectedDay, setSelectedDay] = useState("MONDAY")

	return (
		<div className="addTimeSlot">
			<FormLayout>
				<Select
					label="Exception for"
					onChange={setSelectedDay}
					options={daysOfWeek.map((day) => ({ value: day.toUpperCase(), label: day }))}
					value={selectedDay}
				/>
				<Button onClick={() => onAdd(selectedDay)}>Add</Button>
			</FormLayout>
		</div>
	)
}
