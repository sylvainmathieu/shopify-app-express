import React, { useCallback, useEffect, useState } from "react"
import { RouteChildrenProps } from "react-router"
import { Page, ResourceList, Card, Layout, Button, TextField, PageActions } from "@shopify/polaris"
import { useApi } from "../util/useApi"
import DeliverySlot from "../models/DeliverySlot"
import moment from "moment"
import { ShopResource } from "../models/ShopResource"
import _ from "lodash"
import { Toast } from "@shopify/app-bridge-react"
import DeliveryDatePickerModal from "./DeliveryDatePickerModal"

interface UrlParams {
	deliverySlotId: string
}

interface DeliverySlotPageData {
	shopResource: ShopResource
	deliverySlot: DeliverySlot
}

function getTitle(deliverySlot: DeliverySlot) {
	const startDate = moment(_.first(deliverySlot.deliveryDates))
	if (deliverySlot.deliveryDates.length > 1) {
		const endDate = moment(_.last(deliverySlot.deliveryDates))
		return `Delivery slot: ${startDate.format("D MMM")} - ${endDate.format("D MMM")}`
	} else {
		return `Delivery slot: ${startDate.format("D MMM")}`
	}
}

function getBackUrl(shopResource: ShopResource) {
	return `/app/resources/${shopResource.id}/calendar/${moment().format("YYYY/MM")}`
}

export default function DeliverySlotPage({ match, history }: RouteChildrenProps<UrlParams>) {
	const { deliverySlotId } = match.params

	const [successMessage, setSuccessMessage] = useState<string>()
	const { setApiRequest: fetchSlot, data: deliverySlotPageData, isLoading } = useApi<DeliverySlotPageData>({})
	const { setApiRequest: saveSlot, isLoading: isSavingSlot } = useApi({
		onSuccess: useCallback(() => {
			setSuccessMessage("Delivery slot saved!")
		}, [])
	})
	const { setApiRequest: deleteSlot, isLoading: isDeletingSlot } = useApi({
		onSuccess: useCallback(() => {
			history.push(getBackUrl(deliverySlotPageData.shopResource))
		}, [deliverySlotPageData, history])
	})
	const [addSlotModalOpen, setAddSlotModalOpen] = useState<boolean>()

	const [newDates, setNewDates] = useState<Date[]>([])
	const [quantity, setQuantity] = useState<number>()

	useEffect(() => {
		fetchSlot({
			url: `/delivery_slots/${deliverySlotId}/page`
		})
	}, [])

	useEffect(() => {
		if (deliverySlotPageData && quantity === undefined) {
			setQuantity(deliverySlotPageData.deliverySlot.size)
		}
	}, [deliverySlotPageData])

	const handleSaveSlot = useCallback(() => {
		saveSlot({
			method: "POST",
			url: `/delivery_slots/${deliverySlotId}`,
			postData: {
				newDates: JSON.stringify(newDates.map((date) => moment(date).format("YYYY-MM-DD"))),
				size: quantity
			}
		})
	}, [newDates, quantity])

	const handleDeleteSlot = useCallback(() => {
		deleteSlot({
			method: "DELETE",
			url: `/delivery_slots/${deliverySlotId}`
		})
	}, [newDates, quantity])

	if (isLoading || !deliverySlotPageData) {
		return <div />
	}

	const { shopResource, deliverySlot } = deliverySlotPageData

	return (
		<div id="deliverySlotPage">
			{successMessage && <Toast content={successMessage} onDismiss={() => setSuccessMessage(undefined)} />}
			<Page
				breadcrumbs={[
					{ content: "Products", url: "/" },
					{
						content: shopResource.title,
						url: getBackUrl(shopResource)
					}
				]}
				title={getTitle(deliverySlot)}
			>
				<Layout>
					<Layout.Section></Layout.Section>
					<Layout.AnnotatedSection
						title="Delivery dates"
						description="You can either add or remove days sharing the same quantity. Orders will be attached to a day, but the stock is common."
					>
						<Card>
							<ResourceList
								items={[].concat(deliverySlot.deliveryDates).concat(newDates)}
								renderItem={(deliveryDate) => (
									<ResourceList.Item id="product" onClick={() => {}}>
										<div className="date">{moment(deliveryDate).format("ddd D MMM")}</div>
									</ResourceList.Item>
								)}
							/>
						</Card>
						<div className="buttonHolder">
							<Button onClick={() => setAddSlotModalOpen(true)}>Add delivery dates</Button>
						</div>
					</Layout.AnnotatedSection>

					<Layout.AnnotatedSection
						title="Shared slot quantity"
						description="Define your stock for these delivery dates"
					>
						<TextField
							label="Quantity"
							type="number"
							value={quantity.toString()}
							onChange={(value) => {
								setQuantity(parseInt(value))
							}}
						/>
					</Layout.AnnotatedSection>
				</Layout>
				<PageActions
					primaryAction={{
						content: "Save",
						onAction: handleSaveSlot,
						loading: isSavingSlot
					}}
					secondaryActions={[
						{
							content: "Delete",
							destructive: true,
							onAction: handleDeleteSlot,
							loading: isDeletingSlot
						}
					]}
				/>
			</Page>
			{addSlotModalOpen && (
				<DeliveryDatePickerModal
					date={moment(_.last(deliverySlot.deliveryDates)).add(1, "day").toDate()}
					onDatesSelected={(selectedDates) => setNewDates(selectedDates)}
					onClose={() => setAddSlotModalOpen(false)}
				/>
			)}
		</div>
	)
}
