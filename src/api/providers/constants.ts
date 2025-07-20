import { Package } from "../../shared/package"

export const DEFAULT_HEADERS = {
	"HTTP-Referer": "https://syntx.dev",
	"X-Title": "Syntx",
	"User-Agent": `RooCode/${Package.version}`,
}
