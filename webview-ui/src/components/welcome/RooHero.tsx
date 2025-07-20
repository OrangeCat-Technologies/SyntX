import logoBase64 from "../../assets/logo-base64"

const RooHero = () => {
	return (
		<div className="flex flex-col items-center justify-center pb-4 forced-color-adjust-none">
			<div className="mx-auto">
				<img
					src={logoBase64}
					alt="SyntX Logo"
					style={{
						width: "50px",
						height: "50px",
					}}
				/>
			</div>
		</div>
	)
}

export default RooHero
