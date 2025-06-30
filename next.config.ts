import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
	/* 這裡可以放原本的 Next.js config 選項 */
	images: {
		domains: ["images.unsplash.com"],
	},
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
