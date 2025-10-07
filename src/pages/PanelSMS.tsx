import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function PanelSMS() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: verificaciones, refetch } = useQuery({
    queryKey: ["verificaciones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verificaciones")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Actualizar cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const filteredData = verificaciones?.filter(
    (v) =>
      v.dni.includes(searchTerm) ||
      v.celular.includes(searchTerm) ||
      v.codigo.includes(searchTerm)
  );

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      enviado: { variant: "default", className: "bg-accent" },
      pendiente: { variant: "secondary", className: "" },
      verificado: { variant: "default", className: "bg-green-600" },
      error: { variant: "destructive", className: "" },
    };

    const config = variants[estado] || variants.pendiente;
    return (
      <Badge variant={config.variant} className={config.className}>
        {estado.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SMS Enviados</h1>
          <p className="text-muted-foreground mt-1">
            Últimos 5 SMS enviados del sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de SMS Enviados</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por DNI, celular o sucursal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DNI</TableHead>
                    <TableHead>Celular</TableHead>
                    <TableHead>Sucursal</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData?.length ? (
                    filteredData.map((verificacion) => (
                      <TableRow key={verificacion.id}>
                        <TableCell className="font-medium">
                          {verificacion.dni}
                        </TableCell>
                        <TableCell>{verificacion.celular}</TableCell>
                        <TableCell>{verificacion.codigo_sucursal}</TableCell>
                        <TableCell className="font-mono font-bold">
                          {verificacion.codigo}
                        </TableCell>
                        <TableCell>{getEstadoBadge(verificacion.estado)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(verificacion.created_at).toLocaleString("es-AR")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No hay SMS enviados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredData && filteredData.length > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Mostrando los últimos {filteredData.length} SMS enviados
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
