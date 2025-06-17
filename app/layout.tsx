import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AppLayout } from "@/components/app-layout";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
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
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<NextIntlClientProvider messages={messages}>
					<AppLayout>
						{children}
					</AppLayout>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}