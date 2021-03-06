import moment, { Moment } from "moment"
import { OrdersPerDate } from "../../../backend/src/productOrders/productOrders.model"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"

export class AvailabilityPeriod {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		public id: string,
		public resourceId: string,
		public availableDates: string[],
		public pausedDates: string[],
		public quantity: number,
		public quantityIsShared: boolean
	) {}

	getPeriodStart(): Moment {
		return moment(this.availableDates[0], SYSTEM_DATE_FORMAT)
	}

	getPeriodEnd(): Moment {
		return moment(this.availableDates[this.availableDates.length - 1], SYSTEM_DATE_FORMAT)
	}

	getTotalOrders(ordersPerDate: OrdersPerDate) {
		return this.availableDates.reduce((acc, date) => acc + (ordersPerDate[date] || 0), 0)
	}

	isSoldOut(ordersPerDate: OrdersPerDate, date: Moment) {
		if (this.quantityIsShared) {
			return this.getTotalOrders(ordersPerDate) >= this.quantity
		} else {
			const strDate = date.format(SYSTEM_DATE_FORMAT)
			const orders = ordersPerDate[strDate] || 0
			return orders >= this.quantity
		}
	}

	getPausedDates(): Moment[] {
		return (this.pausedDates || []).map((strDate) => moment(strDate, SYSTEM_DATE_FORMAT))
	}

	isPaused(strDay: string) {
		return this.pausedDates.includes(strDay)
	}

	static create(availabilityPeriods: AvailabilityPeriod[]) {
		return availabilityPeriods.map(AvailabilityPeriod.newInstance)
	}

	static newInstance(period: AvailabilityPeriod) {
		return new AvailabilityPeriod(
			period.id,
			period.resourceId,
			period.availableDates,
			period.pausedDates,
			period.quantity,
			period.quantityIsShared
		)
	}
}
