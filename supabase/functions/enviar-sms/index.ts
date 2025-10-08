import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { celular, codigo, sucursal } = await req.json();

    // Obtener la API key de la configuración
    const { data: config, error: configError } = await supabaseClient
      .from('sms_config')
      .select('api_key')
      .single();

    if (configError || !config) {
      throw new Error('No se encontró la configuración de SMS Masivos');
    }

    // Preparar el mensaje con el nombre de la empresa según las especificaciones
    const mensaje = `CheckSMS - Tu codigo de verificacion es: ${codigo}. Sucursal: ${sucursal}`;

    // Llamar a la API de SMS Masivos
    const smsUrl = new URL('http://servicio.smsmasivos.com.ar/enviar_sms.asp');
    smsUrl.searchParams.append('api', '1');
    smsUrl.searchParams.append('APIKEY', config.api_key);
    smsUrl.searchParams.append('TOS', celular); // 10 dígitos sin 0 ni 15
    smsUrl.searchParams.append('TEXTO', mensaje);
    smsUrl.searchParams.append('RESPUESTANUMERICA', '1');

    const response = await fetch(smsUrl.toString());
    const responseText = await response.text();

    // Interpretar la respuesta según la documentación
    const codigoRespuesta = parseInt(responseText.trim());
    
    let estado = 'enviado';
    let mensaje_respuesta = 'SMS enviado correctamente';

    // Códigos de error según la documentación
    if (codigoRespuesta === 0) {
      estado = 'enviado';
      mensaje_respuesta = 'Mensaje entregado a las telefónicas';
    } else if (codigoRespuesta === 1) {
      estado = 'test';
      mensaje_respuesta = 'Simulacro de envío OK';
    } else if (codigoRespuesta < 0) {
      estado = 'error';
      const errores: { [key: number]: string } = {
        '-1': 'El número corresponde a un teléfono fijo',
        '-2': 'El número no puede recibir más mensajes (muchos fallos previos)',
        '-3': 'El número envió la palabra BAJA',
        '-4': 'Mensaje duplicado (enviado hace poco tiempo)',
        '-5': 'El mensaje podría ser categorizado como SPAM',
        '-6': 'El texto del mensaje es muy largo',
        '-7': 'El número debe tener 10 dígitos',
        '-8': 'El número contiene caracteres inválidos',
        '-9': 'El número tiene una característica inválida',
        '-10': 'Destinatario rechazado por la telefónica',
        '-11': 'El texto contiene caracteres inválidos',
        '-12': 'El número nacional debe comenzar con 1, 2 o 3',
        '-14': 'El número se encuentra en el registro No Llame',
        '-99': 'Error desconocido'
      };
      mensaje_respuesta = errores[codigoRespuesta] || 'Error en el envío del SMS';
    }

    return new Response(
      JSON.stringify({
        success: codigoRespuesta >= 0,
        codigo_respuesta: codigoRespuesta,
        mensaje: mensaje_respuesta,
        estado
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: codigoRespuesta >= 0 ? 200 : 400,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
