import { useTranslations } from "next-intl";

export default function Discovery() {
	const t = useTranslations("nav");

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{t("discovery")}
				</h1>
				<p className="text-muted-foreground">
					Discover amazing artbooks created by the community
				</p>
			</div>
			
			<div className="text-center text-muted-foreground">
				Coming soon...
			</div>
		</div>
	);
}