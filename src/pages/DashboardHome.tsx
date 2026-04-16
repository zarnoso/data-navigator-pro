import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, ListTodo, Database, Activity } from "lucide-react";

const stats = [
  { label: "API Keys", value: "0", icon: Key, color: "text-primary" },
  { label: "Tareas Activas", value: "0", icon: ListTodo, color: "text-blue-400" },
  { label: "Datasets", value: "0", icon: Database, color: "text-purple-400" },
  { label: "Consultas Hoy", value: "0", icon: Activity, color: "text-amber-400" },
];

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Panel de Control</h1>
      <p className="text-muted-foreground mb-6">Bienvenido, {user?.email}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inicio Rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Genera tu <strong className="text-foreground">API Key</strong> desde el menú lateral.</p>
          <p>2. Usa la <strong className="text-foreground">API Docs</strong> para conocer los endpoints disponibles.</p>
          <p>3. Crea <strong className="text-foreground">Tareas</strong> para solicitar datos de empresas en Chile y LATAM.</p>
          <p>4. Explora los <strong className="text-foreground">Datasets</strong> precargados listos para descargar.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
