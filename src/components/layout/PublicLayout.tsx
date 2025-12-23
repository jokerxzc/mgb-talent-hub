import { ReactNode } from "react";
import { GovPHHeader } from "./GovPHHeader";
import { MainHeader } from "./MainHeader";
import { Footer } from "./Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <GovPHHeader />
      <MainHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
