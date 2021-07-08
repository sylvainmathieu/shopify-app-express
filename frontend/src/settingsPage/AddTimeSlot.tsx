import React, { useState } from "react"
import { FormLayout, TextField, Button } from "@shopify/polaris"
import { TimeSlot } from "../../../widget/src/models/WidgetSettings"

interface Props {
	onAdd: (timeSlot: TimeSlot) => void
}

const timePattern = /[0-2][0-9]:[0-9]{2}/

export default function AddTimeSlot({ onAdd }: Props) {
	const [from, setFrom] = useState("")
	const [fromError, setFromError] = useState(false)
	const [to, setTo] = useState("")
	const [toError, setToError] = useState(false)

	const handleAddClick = () => {
		const fError = !from || !timePattern.test(from)
		const tError = !to || !timePattern.test(to)
		setFromError(fError)
		setToError(tError)
		if (!fError && !tError) {
			onAdd({
				from,
				to
			})
		}
	}

	return (
		<div className="addTimeSlot">
			<FormLayout>
				<FormLayout.Group condensed>
					<TextField type="time" label="From" value={from} onChange={setFrom} error={fromError} />
					<TextField type="time" label="To" value={to} onChange={setTo} error={toError} />
				</FormLayout.Group>
				<Button onClick={handleAddClick}>Add</Button>
			</FormLayout>
		</div>
	)
}
