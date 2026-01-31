-- Estructura recomendada para la tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  empresa TEXT,
  telefono TEXT,
  email TEXT,
  ciudad TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agregar columnas si faltan (ejecutar en Supabase si ya existe la tabla)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS empresa TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ciudad TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
