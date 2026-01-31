-- Crear tabla de roles de usuario
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tecnico')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  empresa TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  ciudad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de órdenes
CREATE TABLE IF NOT EXISTS ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente TEXT NOT NULL,
  motor TEXT NOT NULL,
  serie TEXT,
  fecha_entrega DATE,
  precio DECIMAL(10,2),
  fotos TEXT[], -- Array de nombres de archivos
  descripcion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado')),
  -- Campos para tarea generada por Gemini
  tarea_titulo TEXT,
  tarea_descripcion TEXT,
  tarea_prioridad TEXT,
  tarea_tiempo_estimado INTEGER,
  tarea_pasos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Políticas para clientes
CREATE POLICY "Users can view all clients" ON clientes FOR SELECT USING (true);
CREATE POLICY "Admins can insert clients" ON clientes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);
CREATE POLICY "Admins can update clients" ON clientes FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);
CREATE POLICY "Admins can delete clients" ON clientes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Políticas para órdenes
CREATE POLICY "Users can view all orders" ON ordenes FOR SELECT USING (true);
CREATE POLICY "Users can insert orders" ON ordenes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update orders" ON ordenes FOR UPDATE USING (true);
CREATE POLICY "Admins can delete orders" ON ordenes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Crear buckets de storage
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('catalogos', 'catalogos', true),
  ('guias', 'guias', true),
  ('ordenes-fotos', 'ordenes-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('catalogos', 'guias', 'ordenes-fotos'));
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('catalogos', 'guias', 'ordenes-fotos') AND auth.role() = 'authenticated'
);