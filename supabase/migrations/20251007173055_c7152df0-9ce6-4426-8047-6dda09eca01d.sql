-- Crear tipo enum para roles
CREATE TYPE public.app_role AS ENUM ('root', 'user');

-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Crear tabla de roles de usuario
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Función para obtener el rol de un usuario
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Políticas RLS para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios root pueden ver todos los perfiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'root'));

CREATE POLICY "Los usuarios root pueden insertar perfiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'root'));

CREATE POLICY "Los usuarios root pueden actualizar perfiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'root'));

CREATE POLICY "Los usuarios root pueden eliminar perfiles"
  ON public.profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'root'));

-- Políticas RLS para user_roles
CREATE POLICY "Los usuarios pueden ver sus propios roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios root pueden ver todos los roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'root'));

CREATE POLICY "Los usuarios root pueden insertar roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'root'));

CREATE POLICY "Los usuarios root pueden eliminar roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'root'));

-- Función para crear perfil automáticamente cuando se crea un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crear tabla de verificaciones SMS
CREATE TABLE public.verificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dni text NOT NULL CHECK (length(dni) = 8),
  celular text NOT NULL CHECK (length(celular) = 10),
  codigo_sucursal text NOT NULL,
  codigo text NOT NULL CHECK (length(codigo) = 4),
  mensaje_recibido text,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'verificado', 'error')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  fecha_verificacion timestamptz
);

-- Habilitar RLS en verificaciones
ALTER TABLE public.verificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para verificaciones
CREATE POLICY "Todos los usuarios autenticados pueden ver verificaciones"
  ON public.verificaciones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Todos los usuarios autenticados pueden insertar verificaciones"
  ON public.verificaciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Los usuarios root pueden actualizar verificaciones"
  ON public.verificaciones FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'root') OR created_by = auth.uid());

CREATE POLICY "Los usuarios root pueden eliminar verificaciones"
  ON public.verificaciones FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'root'));

-- Crear tabla de mensajes SMS recibidos
CREATE TABLE public.sms_recibidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_celular text NOT NULL,
  mensaje text NOT NULL,
  codigo_sucursal text,
  dni text,
  estado text NOT NULL DEFAULT 'recibido' CHECK (estado IN ('recibido', 'procesado', 'error')),
  fecha_recepcion timestamptz DEFAULT now() NOT NULL
);

-- Habilitar RLS en sms_recibidos
ALTER TABLE public.sms_recibidos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sms_recibidos
CREATE POLICY "Todos los usuarios autenticados pueden ver SMS recibidos"
  ON public.sms_recibidos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserción de SMS (webhook)"
  ON public.sms_recibidos FOR INSERT
  WITH CHECK (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();