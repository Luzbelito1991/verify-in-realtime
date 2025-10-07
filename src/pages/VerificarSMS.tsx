import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Send, X } from "lucide-react";

export default function VerificarSMS() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    dni: "",
    celular: "",
    sucursal: "",
    codigo: "",
  });
  const [mensajesRecibidos, setMensajesRecibidos] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí conectarás con tu API FastAPI: POST /api/verificar
    try {
      toast({
        title: "SMS Enviado",
        description: `Código enviado a ${formData.celular}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el SMS",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({ dni: "", celular: "", sucursal: "", codigo: "" });
    setMensajesRecibidos([]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verificación SMS</h1>
          <p className="text-muted-foreground mt-1">
            Envía y verifica códigos de confirmación por SMS
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Datos de Verificación</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI</Label>
                    <Input
                      id="dni"
                      placeholder="12345678"
                      value={formData.dni}
                      onChange={(e) =>
                        setFormData({ ...formData, dni: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      placeholder="+54 9 11 1234-5678"
                      value={formData.celular}
                      onChange={(e) =>
                        setFormData({ ...formData, celular: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sucursal">Sucursal</Label>
                  <Select
                    value={formData.sucursal}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sucursal: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sucursal-a">Sucursal A - Centro</SelectItem>
                      <SelectItem value="sucursal-b">Sucursal B - Norte</SelectItem>
                      <SelectItem value="sucursal-c">Sucursal C - Sur</SelectItem>
                      <SelectItem value="sucursal-d">Sucursal D - Este</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo">Código Generado</Label>
                  <Input
                    id="codigo"
                    placeholder="123456"
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo: e.target.value })
                    }
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    El código se genera automáticamente al enviar
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar SMS
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensajes Recibidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Los mensajes SMS recibidos aparecerán aquí..."
                value={mensajesRecibidos.join("\n\n")}
                readOnly
                className="min-h-[300px] bg-muted/50"
              />
              {mensajesRecibidos.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {mensajesRecibidos.length} mensaje(s) recibido(s)
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
