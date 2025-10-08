import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64">
        <header className="border-b bg-card px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">CheckSMS</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </header>
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
