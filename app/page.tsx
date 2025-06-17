import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
	const t = useTranslations("nav");

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{t("home")}
				</h1>
				<p className="text-muted-foreground">
					Welcome to your AI Artbook creation platform
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Total Artbooks</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Total Views</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">1,234</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Likes Received</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">89</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent Artbooks</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Your recently created artbooks will appear here...
					</p>
				</CardContent>
			</Card>
		</div>
	);
}