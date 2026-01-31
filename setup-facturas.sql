-- Tabla de facturas para módulo de facturación
CREATE TABLE IF NOT EXISTS facturas (
  id SERIAL PRIMARY KEY,
  orden_id INTEGER REFERENCES ordenes(id) ON DELETE SET NULL,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  fecha TIMESTAMP DEFAULT NOW(),
  subtotal NUMERIC(10,2) NOT NULL,
  iva NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  estado TEXT DEFAULT 'emitida',
  pdf_url TEXT,
  email TEXT,
  telefono TEXT,
  notas TEXT
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_facturas_orden_id ON facturas(orden_id);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);
