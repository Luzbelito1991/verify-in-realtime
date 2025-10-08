import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  FileText, 
  Shield,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: MessageSquare, label: "Verificar SMS", path: "/verificar" },
  { icon: FileText, label: "SMS Enviados", path: "/sms" },
  { icon: Shield, label: "SMS Recibidos", path: "/admin-sms" },
  { icon: Users, label: "Usuarios", path: "/usuarios" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 z-40",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-primary">CheckSMS</h1>
          <p className="text-sm text-sidebar-foreground/70 mt-1">Sistema de Gestión</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
