import { Layout } from "@/components/Layout";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  // Simulación de datos - conectar con tu API FastAPI
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => ({
      total_enviados: 1243,
      total_recibidos: 987,
      total_verificados: 856,
      total_errores: 34,
    }),
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen general del sistema de verificación SMS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="SMS Enviados"
            value={stats?.total_enviados || 0}
            icon={Send}
            variant="default"
          />
          <StatsCard
            title="SMS Recibidos"
            value={stats?.total_recibidos || 0}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Verificados"
            value={stats?.total_verificados || 0}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Errores"
            value={stats?.total_errores || 0}
            icon={XCircle}
            variant="error"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium">Código verificado</p>
                        <p className="text-xs text-muted-foreground">
                          DNI: 12345678 - Sucursal A
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Hace {i * 5} min
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estados del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API FastAPI</span>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  Activo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de Datos</span>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  Conectado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recepción SMS</span>
                <span className="px-3 py-1 bg-warning/10 text-warning rounded-full text-xs font-medium">
                  Pendiente
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Último Backup</span>
                <span className="text-sm text-muted-foreground">Hace 2 horas</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
