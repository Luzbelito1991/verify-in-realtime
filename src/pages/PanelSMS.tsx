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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Verificacion } from "@/types";

export default function PanelSMS() {
  const [searchTerm, setSearchTerm] = useState("");

  // Simulación - conectar con API: GET /api/verificaciones
  const { data: verificaciones } = useQuery<Verificacion[]>({
    queryKey: ["verificaciones"],
    queryFn: async () => [
      {
        id: 1,
        dni: "12345678",
        celular: "+54 9 11 1234-5678",
        sucursal: "Sucursal A",
        codigo: "123456",
        estado: "verificado",
        fecha_creacion: new Date().toISOString(),
        fecha_verificacion: new Date().toISOString(),
      },
      {
        id: 2,
        dni: "87654321",
        celular: "+54 9 11 8765-4321",
        sucursal: "Sucursal B",
        codigo: "654321",
        estado: "enviado",
        fecha_creacion: new Date().toISOString(),
      },
    ],
  });

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pendiente: { variant: "secondary", label: "Pendiente" },
      enviado: { variant: "default", label: "Enviado" },
      verificado: { variant: "default", label: "Verificado" },
      error: { variant: "destructive", label: "Error" },
    };

    const config = variants[estado] || variants.pendiente;
    return (
      <Badge variant={config.variant} className={estado === "verificado" ? "bg-accent" : ""}>
        {config.label}
      </Badge>
    );
  };

  const filteredData = verificaciones?.filter(
    (v) =>
      v.dni.includes(searchTerm) ||
      v.celular.includes(searchTerm) ||
      v.sucursal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Panel SMS</h1>
          <p className="text-muted-foreground mt-1">
            Historial de verificaciones enviadas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verificaciones</CardTitle>
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
                    filteredData.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.dni}</TableCell>
                        <TableCell>{v.celular}</TableCell>
                        <TableCell>{v.sucursal}</TableCell>
                        <TableCell className="font-mono">{v.codigo}</TableCell>
                        <TableCell>{getEstadoBadge(v.estado)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(v.fecha_creacion).toLocaleDateString("es-AR")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No se encontraron verificaciones
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
