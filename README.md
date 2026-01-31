# ERP Rectificadora Suárez

Sistema de gestión de tareas y órdenes de trabajo para Rectificadora Suárez, desarrollado con Next.js, Supabase y Tailwind CSS.

## 🚀 Características

- **Autenticación segura** con roles (Admin/Técnico)
- **Gestión de órdenes** con IA integrada (Gemini)
- **Dashboard** con estadísticas en tiempo real
- **Facturación** (solo para administradores)
- **Interfaz moderna** con diseño "Rojo Potencia"

## 🛠️ Tecnologías

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **IA**: Google Gemini 1.5-flash
- **UI**: Lucide React icons, Chart.js

## 📋 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
GOOGLE_API_KEY=tu_gemini_api_key
```

### 2. Base de Datos

Ejecuta el script SQL `setup-db.sql` en tu proyecto Supabase para crear la tabla de roles.

### 3. Usuarios de Prueba

Ejecuta el script de setup:

```bash
node setup-users.js
```

**Credenciales de prueba:**

- **Admin**: admin@rectificadoraecuador.com / admin123
- **Técnico**: tecnico@rectificadoraecuador.com / tecnico123

## 🚀 Ejecutar el Proyecto

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Páginas Next.js App Router
│   ├── gestor/            # Dashboard principal
│   ├── login/             # Autenticación
│   ├── ordenes/           # Lista de órdenes
│   ├── nueva-orden/       # Crear orden con IA
│   └── facturacion/       # Módulo de facturación (solo admin)
├── components/            # Componentes reutilizables
│   ├── AuthContext.jsx    # Contexto de autenticación
│   ├── OrdenesContext.jsx # Contexto de órdenes
│   ├── ProtectedRoute.jsx # Protección de rutas por rol
│   └── ui/                # Componentes UI
└── lib/                   # Utilidades
    ├── supabase.js        # Cliente Supabase
    └── gemini.js          # Integración con Gemini AI
```

## 🔐 Roles y Permisos

- **Administrador**: Acceso completo a todos los módulos
- **Técnico**: Acceso limitado (sin facturación)

## 🎨 Diseño

El diseño sigue la identidad "Rojo Potencia" de Rectificadora Suárez Ecuador con:

- Colores rojo (#DC2626) y piedra (#F5F5F4)
- Tipografía moderna y bold
- Bordes redondeados (rounded-4xl)
- Sombras sutiles y transiciones suaves

## 📊 Funcionalidades

- ✅ Autenticación con Supabase Auth
- ✅ Control de acceso basado en roles
- ✅ Generación de tareas con IA
- ✅ Gestión CRUD de órdenes
- ✅ Dashboard con estadísticas
- ✅ Módulo de facturación protegido
- 🔄 Próximas: Migración a Supabase DB, checklist de tareas, fotos, historial, localización Ecuador

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request
