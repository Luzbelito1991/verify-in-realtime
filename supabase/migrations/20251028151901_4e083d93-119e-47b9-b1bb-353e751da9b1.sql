-- Create sms_config table to store SMS Masivos API key securely
CREATE TABLE public.sms_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sms_config ENABLE ROW LEVEL SECURITY;

-- Only root users can view the API key
CREATE POLICY "Root users can view SMS config"
  ON public.sms_config
  FOR SELECT
  USING (public.has_role(auth.uid(), 'root'));

-- Only root users can insert SMS config
CREATE POLICY "Root users can insert SMS config"
  ON public.sms_config
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'root'));

-- Only root users can update SMS config
CREATE POLICY "Root users can update SMS config"
  ON public.sms_config
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'root'));

-- Only root users can delete SMS config
CREATE POLICY "Root users can delete SMS config"
  ON public.sms_config
  FOR DELETE
  USING (public.has_role(auth.uid(), 'root'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sms_config_updated_at
  BEFORE UPDATE ON public.sms_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();