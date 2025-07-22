import logoBase64 from "../../assets/logo-base64"
import { useExtensionState } from "../../context/ExtensionStateContext"

const getTimeBasedGreeting = () => {
	const hour = new Date().getHours()
	if (hour < 12) return "Good morning"
	if (hour < 18) return "Good afternoon"
	return "Good evening"
}

const RooHero = () => {
	const { websiteUsername, websiteNotAuthenticated } = useExtensionState()

	return (
		<div className="flex flex-col pb-1 forced-color-adjust-none" style={{ paddingLeft: 24, paddingTop: 16 }}>
			{/* Logo and greeting positioned at very top left */}
			<div className="flex items-center gap-3 mb-6" style={{ alignSelf: "flex-start" }}>
				<img
					src={logoBase64}
					alt="SyntX Logo"
					style={{
						width: "80px",
						height: "80px",
					}}
				/>
				{!websiteNotAuthenticated && websiteUsername && (
					<div>
						<h2
							className="text-xl font-medium"
							style={{
								margin: 0,
								background: "linear-gradient(90deg, orange, white)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}>
							{getTimeBasedGreeting()} {websiteUsername}!
						</h2>
					</div>
				)}
			</div>
		</div>
	)
}

export default RooHero
