import { useTranslations } from "next-intl";

export default function Create() {
	const t = useTranslations("nav");

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{t("create")}
				</h1>
				<p className="text-muted-foreground">
					Create your own AI-generated artbook
				</p>
			</div>
			
			<div className="text-center text-muted-foreground">
				Artbook creation wizard coming soon...
			</div>
		</div>
	);
}