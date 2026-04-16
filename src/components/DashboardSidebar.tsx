import { NavLink } from "react-router-dom";
import { MapPin, LayoutDashboard, Key, ListTodo, Database, FileText, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Resumen" },
  { to: "/dashboard/api-keys", icon: Key, label: "API Keys" },
  { to: "/dashboard/tasks", icon: ListTodo, label: "Tareas" },
  { to: "/dashboard/datasets", icon: Database, label: "Datasets" },
  { to: "/dashboard/api-docs", icon: FileText, label: "API Docs" },
];

const DashboardSidebar = () => {
  const { signOut, user } = useAuth();

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <a href="/" className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground">
            Mapadata<span className="text-primary">.cl</span>
          </span>
        </a>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground truncate px-3 mb-2">{user?.email}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
