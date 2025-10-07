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

export default function AdminSMS() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: smsRecibidos, refetch } = useQuery({
    queryKey: ["sms-recibidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_recibidos")
        .select("*")
        .order("fecha_recepcion", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Actualizar cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  const filteredData = smsRecibidos?.filter(
    (sms) =>
      sms.numero_celular.includes(searchTerm) ||
      sms.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sms.dni?.includes(searchTerm) ||
      sms.codigo_sucursal?.includes(searchTerm)
  );

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      recibido: { variant: "default", className: "bg-accent" },
      procesado: { variant: "default", className: "bg-green-600" },
      error: { variant: "destructive", className: "" },
    };

    const config = variants[estado] || variants.recibido;
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
          <h1 className="text-3xl font-bold">SMS Recibidos</h1>
          <p className="text-muted-foreground mt-1">
            Mensajes SMS recibidos del sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mensajes Recibidos</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por teléfono, mensaje o código..."
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
                    <TableHead>N° Celular</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Sucursal</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Recepción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData?.length ? (
                    filteredData.map((sms) => (
                      <TableRow key={sms.id}>
                        <TableCell className="font-medium">
                          {sms.numero_celular}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {sms.mensaje}
                        </TableCell>
                        <TableCell>
                          {sms.codigo_sucursal || "-"}
                        </TableCell>
                        <TableCell>
                          {sms.dni || "-"}
                        </TableCell>
                        <TableCell>{getEstadoBadge(sms.estado)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(sms.fecha_recepcion).toLocaleString("es-AR")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No hay SMS recibidos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredData && filteredData.length > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Total: {filteredData.length} mensaje(s) recibido(s)
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
