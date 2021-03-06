import { Pool } from "pg"
import { getConnection } from "../util/database"
import { ShopResource, ShopResourceSchema } from "../shopResource/shopResource.model"
import { CurrentAvailability, CurrentAvailabilitySchema } from "./currentAvailabilities.model"
import { AvailabilityPeriodService } from "../availabilityPeriods/availabilityPeriods.service"
import { ShopResourceService } from "../shopResource/shopResource.service"
import { Shop } from "../shop/shop.model"
import { WidgetService } from "../widget/widget.service"
import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"
import { SYSTEM_DATE_FORMAT } from "../util/constants"

export class CurrentAvailabilityService {
	static async refreshAllByShop(shop: Shop): Promise<void> {
		if (!shop.id) throw "shop.id shouldn't be null"
		const widgetSettings = await WidgetService.findWidgetSettingsByShopId(shop.id)
		const shopResources = await ShopResourceService.findAllShopResource(shop)
		for (const shopResource of shopResources) {
			if (shopResource.id && widgetSettings) {
				await this.refreshCurrentAvailability(shopResource.id, widgetSettings)
			}
		}
	}

	static async refreshCurrentAvailability(
		shopResourceId: string,
		widgetSettings: WidgetSettingsViewModel
	): Promise<CurrentAvailability> {
		const currentAvailability = await this.findNewState(shopResourceId, widgetSettings)
		return await this.save(currentAvailability)
	}

	static async refreshCurrentAvailabilities(
		shopResources: ShopResource[],
		widgetSettings: WidgetSettingsViewModel
	): Promise<void> {
		for (const shopResource of shopResources) {
			if (shopResource.id) {
				await this.refreshCurrentAvailability(shopResource.id, widgetSettings)
			}
		}
	}

	static async findNewState(
		shopResourceId: string,
		widgetSettings: WidgetSettingsViewModel
	): Promise<CurrentAvailability> {
		const allDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResourceId, widgetSettings)
		const availableDates = allDates.filter((d) => !d.isSoldOut)
		const nextAvailabilityDate = availableDates.length > 0 ? availableDates[0].date : undefined
		const lastAvailabilityDate =
			availableDates.length > 0 ? availableDates[availableDates.length - 1].date : undefined
		const nbAvailableDates = availableDates.length
		const nbSoldOutDates = allDates.length - nbAvailableDates
		return new CurrentAvailability(
			undefined,
			shopResourceId,
			nextAvailabilityDate,
			lastAvailabilityDate,
			nbSoldOutDates,
			nbAvailableDates
		)
	}

	static async findByShopResourceId(shopResourceId: string): Promise<CurrentAvailability | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<CurrentAvailabilitySchema>(
			`
			SELECT
				ca.id,
				ca.shop_resource_id,
				ca.next_availability_date,
				ca.last_availability_date,
				ca.sold_out_dates,
				ca.available_dates
			FROM current_availabilities ca
			WHERE ca.shop_resource_id = $1`,
			[shopResourceId]
		)
		const results = result.rows.map(CurrentAvailability.createFromSchema)
		return results.length > 0 ? results[0] : undefined
	}

	static async save(currentAvailability: CurrentAvailability): Promise<CurrentAvailability> {
		const conn: Pool = await getConnection()
		const results = await conn.query<ShopResourceSchema>(
			`
			INSERT INTO current_availabilities (
				shop_resource_id, next_availability_date, last_availability_date, sold_out_dates, available_dates)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (shop_resource_id)
			DO UPDATE SET
				next_availability_date = $2, last_availability_date = $3, sold_out_dates = $4, available_dates = $5
			RETURNING id`,
			[
				currentAvailability.shopResourceId,
				currentAvailability.nextAvailabilityDate?.format(SYSTEM_DATE_FORMAT),
				currentAvailability.lastAvailabilityDate?.format(SYSTEM_DATE_FORMAT),
				currentAvailability.soldOutDates,
				currentAvailability.availableDates
			]
		)
		if (results.rows.length == 1) {
			currentAvailability.id = results.rows[0].id
		}
		return currentAvailability
	}

	static async createInitial(shopResourceId: string): Promise<void> {
		const initialCurrentAvailability = new CurrentAvailability(
			undefined,
			shopResourceId,
			undefined,
			undefined,
			0,
			0
		)
		await this.save(initialCurrentAvailability)
	}
}
