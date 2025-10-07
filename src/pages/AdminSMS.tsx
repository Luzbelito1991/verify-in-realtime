import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, RefreshCw, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface MensajeSMS {
  id: number;
  telefono: string;
  mensaje: string;
  codigo_extraido?: string;
  fecha_recepcion: string;
  procesado: boolean;
}

export default function AdminSMS() {
  const [searchTerm, setSearchTerm] = useState("");

  // Simulación - conectar con API: GET /api/sms/recibidos
  const { data: mensajes, refetch } = useQuery<MensajeSMS[]>({
    queryKey: ["mensajes-sms"],
    queryFn: async () => [
      {
        id: 1,
        telefono: "+54 9 11 1234-5678",
        mensaje: "Tu código de verificación es: 123456",
        codigo_extraido: "123456",
        fecha_recepcion: new Date().toISOString(),
        procesado: true,
      },
      {
        id: 2,
        telefono: "+54 9 11 8765-4321",
        mensaje: "Código: 654321. No compartir este código.",
        codigo_extraido: "654321",
        fecha_recepcion: new Date(Date.now() - 300000).toISOString(),
        procesado: true,
      },
      {
        id: 3,
        telefono: "+54 9 11 5555-5555",
        mensaje: "Hola, este es un mensaje sin código",
        fecha_recepcion: new Date(Date.now() - 600000).toISOString(),
        procesado: false,
      },
    ],
    refetchInterval: 10000, // Refresca cada 10 segundos
  });

  const filteredData = mensajes?.filter(
    (m) =>
      m.telefono.includes(searchTerm) ||
      m.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.codigo_extraido?.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración SMS</h1>
            <p className="text-muted-foreground mt-1">
              Mensajes SMS recibidos en tiempo real
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Recibidos
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mensajes?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Códigos Extraídos
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mensajes?.filter((m) => m.codigo_extraido).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Sin Procesar
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mensajes?.filter((m) => !m.procesado).length || 0}
              </div>
            </CardContent>
          </Card>
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
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Recepción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData?.length ? (
                    filteredData.map((mensaje) => (
                      <TableRow key={mensaje.id}>
                        <TableCell className="font-medium">
                          {mensaje.telefono}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {mensaje.mensaje}
                        </TableCell>
                        <TableCell>
                          {mensaje.codigo_extraido ? (
                            <code className="px-2 py-1 bg-accent/10 text-accent rounded font-mono text-sm">
                              {mensaje.codigo_extraido}
                            </code>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Sin código
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={mensaje.procesado ? "default" : "secondary"}
                            className={mensaje.procesado ? "bg-accent" : ""}
                          >
                            {mensaje.procesado ? "Procesado" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(mensaje.fecha_recepcion).toLocaleString("es-AR")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No se encontraron mensajes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Instrucciones de Integración</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Webhook para recibir SMS:</strong> POST /api/sms/recibir
            </p>
            <p>
              <strong>Formato esperado:</strong> {"{"} "from": "+54...", "body": "mensaje" {"}"}
            </p>
            <p className="text-xs">
              Configura este endpoint en Twilio, ADB, o tu app Android para recibir mensajes automáticamente
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
