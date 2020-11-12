import { Router } from "express"
import { Request, Response } from "express"
import querystring from "querystring"
import { handleErrors } from "../util/error"
import { getSession, updateSession } from "../util/session"
import { generateNonce } from "../util/tools"
import { buildInstallUrl, buildRedirectUri, generateEncryptedHash, findShopOrInstallApp } from "./auth.service"

const router = Router()

router.get("/auth", (req: Request, res: Response) => {
	try {
		const shop = req.query.shop
		if (!shop) {
			return res.status(400).send("Shop is missing")
		}
		const nonce = generateNonce(16)
		const installShopUrl = buildInstallUrl(shop.toString(), nonce, buildRedirectUri())
		updateSession(req, res, { state: nonce })
		res.redirect(installShopUrl)
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/auth/callback", async (req: Request, res: Response) => {
	try {
		const { shop, code, state } = req.query
		if (!shop) return res.status(400).send("Missing 'shop' in the query params")
		if (!state) return res.status(400).send("Missing 'state' in the query params")
		if (!code) return res.status(400).send("Missing 'code' in the query params")

		const sessionState = getSession(req).state
		if (!sessionState) return res.status(400).send("Missing 'state' in the session")
		if (state.toString() != sessionState) return res.status(403).send("Cannot be verified")

		const { hmac, ...params } = req.query
		const queryParams = querystring.stringify(params as any)
		const hash = generateEncryptedHash(queryParams)

		if (hash !== hmac) {
			return res.status(400).send("HMAC validation failed")
		}

		const dbShop = await findShopOrInstallApp(shop.toString(), code.toString())
		if (!dbShop || !dbShop.id) {
			throw "Missing 'dbShop' or 'dbShop.id'"
		}
		updateSession(req, res, { shopId: dbShop.id, state: undefined })
		res.redirect("/app")
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
