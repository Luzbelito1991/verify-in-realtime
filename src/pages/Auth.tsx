import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Buscar el email correspondiente al username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username)
        .single();

      if (profileError || !profileData) {
        throw new Error("Usuario no encontrado");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Acceso exitoso",
        description: "Bienvenido al sistema CheckSMS",
      });
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña",
      });
      setShowRecovery(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al enviar el email de recuperación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#212121]">
      {/* Decorative waves */}
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#D6D6D6', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#4DA874', stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
          <path
            fill="url(#wave-gradient)"
            d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,122.7C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <path
            fill="url(#wave-gradient)"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,154.7C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            opacity="0.5"
          />
        </svg>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md z-10 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl">CheckSMS</CardTitle>
            <CardDescription className="mt-2">
              Sistema de Gestión de Verificaciones
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!showRecovery ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowRecovery(true)}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRecovery} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recoveryEmail">Email de recuperación</Label>
                <Input
                  id="recoveryEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar email de recuperación"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowRecovery(false)}
              >
                Volver al inicio de sesión
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
