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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Send, X, Dices } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const sucursales = [
  { value: "776", label: "776 - Limite Deportes Alberdi" },
  { value: "777", label: "777 - Limite Deportes Lules" },
  { value: "778", label: "778 - Limite Deportes Famaillá" },
  { value: "779", label: "779 - Limite Deportes Alderetes" },
  { value: "781", label: "781 - Limite Deportes Banda de Río" },
];

export default function VerificarSMS() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    dni: "",
    celular: "",
    sucursal: "",
    codigo: "",
  });
  
  const [customSucursales, setCustomSucursales] = useState(sucursales);
  const [showAddSucursal, setShowAddSucursal] = useState(false);
  const [newSucursal, setNewSucursal] = useState({ codigo: "", nombre: "" });
  const [errors, setErrors] = useState({ dni: "", celular: "" });

  const validateDNI = (dni: string) => {
    if (dni.length > 0 && dni.length !== 8) {
      setErrors(prev => ({ ...prev, dni: "El DNI debe tener exactamente 8 dígitos" }));
      return false;
    }
    setErrors(prev => ({ ...prev, dni: "" }));
    return true;
  };

  const validateCelular = (celular: string) => {
    if (celular.length > 0 && celular.length !== 10) {
      setErrors(prev => ({ ...prev, celular: "El celular debe tener exactamente 10 dígitos" }));
      return false;
    }
    setErrors(prev => ({ ...prev, celular: "" }));
    return true;
  };

  const handleDNIChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 8);
    setFormData({ ...formData, dni: numericValue });
    validateDNI(numericValue);
  };

  const handleCelularChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, celular: numericValue });
    validateCelular(numericValue);
  };

  const generateCodigo = () => {
    const codigo = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData({ ...formData, codigo });
    toast({
      title: "Código Generado",
      description: `Código: ${codigo}`,
    });
  };

  const handleAddSucursal = () => {
    if (newSucursal.codigo && newSucursal.nombre) {
      setCustomSucursales([
        ...customSucursales,
        { value: newSucursal.codigo, label: `${newSucursal.codigo} - ${newSucursal.nombre}` },
      ]);
      setNewSucursal({ codigo: "", nombre: "" });
      setShowAddSucursal(false);
      toast({
        title: "Sucursal Agregada",
        description: `${newSucursal.codigo} - ${newSucursal.nombre}`,
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.dni.length === 8 &&
      formData.celular.length === 10 &&
      formData.sucursal !== "" &&
      formData.codigo.length === 4 &&
      !errors.dni &&
      !errors.celular
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Formulario Incompleto",
        description: "Por favor complete todos los campos correctamente",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("verificaciones")
        .insert({
          dni: formData.dni,
          celular: formData.celular,
          codigo_sucursal: formData.sucursal,
          codigo: formData.codigo,
          estado: "enviado",
          created_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "SMS Enviado",
        description: `Código ${formData.codigo} enviado a ${formData.celular}`,
      });

      handleCancel();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el SMS",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({ dni: "", celular: "", sucursal: "", codigo: "" });
    setErrors({ dni: "", celular: "" });
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

        <Card>
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
                      placeholder="06979228"
                      value={formData.dni}
                      onChange={(e) => handleDNIChange(e.target.value)}
                      maxLength={8}
                      required
                      className={errors.dni ? "border-destructive" : ""}
                    />
                    {errors.dni && (
                      <p className="text-xs text-destructive">{errors.dni}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      placeholder="3814123456"
                      value={formData.celular}
                      onChange={(e) => handleCelularChange(e.target.value)}
                      maxLength={10}
                      required
                      className={errors.celular ? "border-destructive" : ""}
                    />
                    {errors.celular && (
                      <p className="text-xs text-destructive">{errors.celular}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sucursal">Sucursal</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddSucursal(true)}
                    >
                      + Agregar Sucursal
                    </Button>
                  </div>
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
                      {customSucursales.map((suc) => (
                        <SelectItem key={suc.value} value={suc.value}>
                          {suc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo">Código Generado</Label>
                  <div className="flex gap-2">
                    <Input
                      id="codigo"
                      placeholder="1234"
                      value={formData.codigo}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCodigo}
                    >
                      <Dices className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Haga clic en el dado para generar un código de 4 dígitos
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={!isFormValid()}>
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

        <Dialog open={showAddSucursal} onOpenChange={setShowAddSucursal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Sucursal</DialogTitle>
              <DialogDescription>
                Ingrese el código y nombre de la nueva sucursal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigo-sucursal">Código</Label>
                <Input
                  id="codigo-sucursal"
                  placeholder="782"
                  value={newSucursal.codigo}
                  onChange={(e) =>
                    setNewSucursal({ ...newSucursal, codigo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre-sucursal">Nombre</Label>
                <Input
                  id="nombre-sucursal"
                  placeholder="Limite Deportes Nueva Sucursal"
                  value={newSucursal.nombre}
                  onChange={(e) =>
                    setNewSucursal({ ...newSucursal, nombre: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddSucursal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSucursal}>Agregar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
