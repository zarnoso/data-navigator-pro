import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

const Tasks = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Tareas</h1>
      <p className="text-muted-foreground mb-6">Gestiona tus solicitudes de scraping y extracción de datos</p>

      <Card>
        <CardContent className="py-12 text-center">
          <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Sin tareas activas</p>
          <p className="text-sm text-muted-foreground">
            Las tareas se crearán cuando uses la API para solicitar datos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;
