import { Request, Response, Router, raw } from "express"
import { handleErrors, UnexpectedError } from "../util/error"
import { loadConnectedShop } from "../shop/shop.middleware"
import { authenticateHook, loadHookContext, loadConnectedShop as loadConnectedShopFromHook } from "./hooks.middleware"
import { OrderEventData, OrderEventType } from "./hooks.model"
import { HooksService } from "./hooks.service"
import { getLocals } from "../util/locals"
import { loadAccessToken } from "../accessToken/accessToken.middleware"
import { devOnly } from "../util/middlewares"
import { APP_NAME } from "../util/constants"

const router = Router()

router.get("/delete_all_hooks", [devOnly, loadConnectedShop, loadAccessToken], async (req: Request, res: Response) => {
	try {
		const { connectedShop, accessToken } = getLocals(res)
		if (!connectedShop) throw new UnexpectedError("`connectedShop` shouldn't be null")
		if (!accessToken) throw new UnexpectedError("`accessToken` shouldn't be null")
		await HooksService.deleteAllHooks(connectedShop, accessToken)
		res.send("Done.")
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/get_all_hooks", [devOnly, loadConnectedShop, loadAccessToken], async (req: Request, res: Response) => {
	try {
		const { connectedShop, accessToken } = getLocals(res)
		if (!connectedShop) throw new UnexpectedError("`connectedShop` shouldn't be null")
		if (!accessToken) throw new UnexpectedError("`accessToken` shouldn't be null")
		const hooks = await HooksService.fetchAllHooks(connectedShop, accessToken)
		res.send(hooks)
	} catch (error) {
		handleErrors(res, error)
	}
})

router.use("/hooks", raw({ type: "application/json" }))

router.post(
	"/hooks/orders/:eventType",
	[loadHookContext, authenticateHook, loadConnectedShopFromHook],
	async (req: Request, res: Response) => {
		try {
			const eventType = req.params.eventType as OrderEventType
			const { connectedShop } = getLocals(res)
			if (!connectedShop) {
				throw new UnexpectedError("`connectedShop` shouldn't be null")
			}
			const orderEvent = JSON.parse(req.body) as OrderEventData
			await HooksService.ingestOrderEvent(eventType, connectedShop, orderEvent, APP_NAME == "STOCK_BY_DATE")

			res.end()
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

router.post(
	"/hooks/app/uninstalled",
	[loadHookContext, authenticateHook, loadConnectedShopFromHook],
	async (req: Request, res: Response) => {
		try {
			const { connectedShop } = getLocals(res)
			if (!connectedShop) {
				throw new UnexpectedError("`connectedShop` shouldn't be null")
			}
			await HooksService.ingestAppUninstalledEvent(connectedShop)
			res.end()
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

export default router
