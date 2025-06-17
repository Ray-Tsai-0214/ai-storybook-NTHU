import { useTranslations } from "next-intl";

export default function Profile() {
	const t = useTranslations("nav");

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{t("profile")}
				</h1>
				<p className="text-muted-foreground">
					Manage your profile and settings
				</p>
			</div>
			
			<div className="text-center text-muted-foreground">
				Profile management coming soon...
			</div>
		</div>
	);
}