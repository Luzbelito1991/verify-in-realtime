export interface Usuario {
  id: number;
  username: string;
  email: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface Verificacion {
  id: number;
  dni: string;
  celular: string;
  sucursal: string;
  codigo: string;
  mensaje_recibido?: string;
  estado: 'pendiente' | 'enviado' | 'verificado' | 'error';
  fecha_creacion: string;
  fecha_verificacion?: string;
}

export interface Estadistica {
  total_enviados: number;
  total_recibidos: number;
  total_verificados: number;
  total_errores: number;
}
