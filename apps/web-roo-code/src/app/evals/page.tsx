import type { Metadata } from "next"

import { getEvalRuns } from "@/actions/evals"

import { Evals } from "./evals"

export const revalidate = 300
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: "Syntx Evals",
	openGraph: {
		title: "Syntx Evals",
		description: "Quantitative evals of LLM coding skills.",
		url: "https://roocode.com/evals",
		siteName: "Syntx",
		images: {
			url: "https://i.imgur.com/ijP7aZm.png",
			width: 1954,
			height: 1088,
		},
	},
}

export default async function Page() {
	const runs = await getEvalRuns()

	return <Evals runs={runs} />
}
