import type { Metadata } from "next";
import { Syne, Manrope, Comic_Neue } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "sonner";

const syne = Syne({
	variable: "--font-syne",
	subsets: ["latin"],
	weight: ["400", "600"],
});

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
	weight: ["800"],
});

const comicNeue = Comic_Neue({
	variable: "--font-comic-neue",
	subsets: ["latin"],
	weight: ["400"],
});

export const metadata: Metadata = {
	title: "AI Artbook Platform",
	description: "Create and share AI-generated artbooks",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// This will get the locale from the i18n/request.ts config
	const messages = await getMessages();

	return (
		<html lang="en">
			<body
				className={`${syne.variable} ${manrope.variable} ${comicNeue.variable} antialiased`}
			>
				<NextIntlClientProvider messages={messages}>
					<AppLayout>
						{children}
					</AppLayout>
					<Toaster 
						position="top-center"
						toastOptions={{
							style: {
								fontFamily: 'Syne, sans-serif',
							},
						}}
					/>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}