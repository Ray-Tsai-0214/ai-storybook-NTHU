import { AppLayout } from "@/components/app-layout";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}