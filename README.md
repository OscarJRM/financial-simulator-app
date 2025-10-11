
# Financial Simulator App

## Descripción del Proyecto

Este proyecto consiste en el desarrollo de un simulador financiero que permite generar tablas de pagos utilizando dos sistemas de amortización revisados en clase. El sistema está enfocado en dos tipos de usuarios:

- **Asesor de crédito o administrador:**
  1. Configura la información de la institución financiera (logo, nombre, etc.).
  2. Configura tipos de créditos (consumo, hipotecario, educación, etc.) y sus tasas de interés.
  3. Agrega cobros indirectos al crédito (seguros, donaciones, etc.).

- **Cliente:**
  - Puede generar su tabla de amortización en base a los parámetros definidos por el administrador.
  - La tabla se muestra en pantalla y se puede descargar en PDF con toda la información relevante.

Además, el sistema incluye un módulo de simulador de inversiones, donde:

- El administrador puede configurar productos de inversión y sus parámetros.
- El cliente puede simular inversiones, subir documentación, realizar validación biométrica y completar el proceso en línea.

Se recomienda investigar simuladores de inversiones de bancos y cooperativas para mejorar el módulo de inversiones.

---

## ¿Cómo iniciar el proyecto?

1. Clona el repositorio:
	```bash
	git clone https://github.com/OscarJRM/financial-simulator-app.git
	```

2. Instala las dependencias:
	```bash
	npm install
 	npm install mysql2
	npm install jspdf html2canvas xlsx file-saver
	```

3. Inicia el servidor de desarrollo:
	```bash
	npm run dev
	```

4. Accede a la aplicación en tu navegador en `http://localhost:3000`

---

## Tecnologías utilizadas

- **Next.js 14+** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **PostCSS** - Procesamiento de CSS
- **Tailwind CSS** - Framework de estilos (opcional)

---

## Estructura del Proyecto

El proyecto sigue una arquitectura **feature-based** que separa las rutas de Next.js de la lógica de negocio, facilitando la escalabilidad y el trabajo en equipo.

```
src/
├── app/                        # 🗂️ Rutas de Next.js (App Router)
│   ├── (public)/              # Páginas públicas (sin autenticación)
│   │   ├── page.tsx           # Landing page
│   │   ├── investments/       # Información de inversiones
│   │   └── loans/             # Información de préstamos
│   │
│   ├── (auth)/                # Autenticación
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (client)/              # Dashboard del cliente
│   │   ├── dashboard/         # Panel principal
│   │   └── investments/       # Gestión de inversiones
│   │
│   └── (admin)/               # Panel administrativo
│       └── admin/
│           ├── config/        # Configuración de institución
│           ├── investments/   # Gestión de productos de inversión
│           └── loans/         # Gestión de tipos de crédito
│
├── features/                   # 🎯 Lógica de negocio por funcionalidad
│   ├── auth/                  # Autenticación y autorización
│   │   ├── components/        # Componentes específicos de auth
│   │   ├── hooks/             # Hooks personalizados (useAuth, useLogin)
│   │   ├── services/          # Servicios de API
│   │   └── types/             # Tipos TypeScript
│   │
│   ├── credits/               # (En desarrollo) Gestión de créditos
│   ├── amortization/          # (En desarrollo) Cálculos y tablas
│   └── investments/           # (En desarrollo) Simulador de inversiones
│
├── shared/                     # 🔧 Recursos compartidos
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Botones, inputs, modales, etc.
│   │   └── layout/           # Navbar, Footer, Sidebar
│   ├── hooks/                # Hooks compartidos (useDebounce, etc.)
│   ├── types/                # Tipos TypeScript globales
│   ├── utils/                # Funciones utilitarias
│   └── constants/            # Constantes y configuraciones
│
└── lib/                       # ⚙️ Configuraciones externas
    └── utils.ts              # Utilidades de terceros (cn, etc.)
```

### 📁 Convenciones de carpetas

- **`(public)`, `(auth)`, `(client)`, `(admin)`**: Route groups de Next.js que organizan rutas sin afectar las URLs
- **`features/`**: Cada feature contiene toda su lógica (componentes, hooks, types, services)
- **`shared/`**: Código reutilizable entre múltiples features
- **`lib/`**: Configuraciones de bibliotecas externas (Prisma, Axios, etc.)

### 🎯 Principios de organización

1. **Separación de responsabilidades**: Las rutas (`app/`) solo importan y renderizan vistas desde `features/`
2. **Modularidad**: Cada feature es independiente y autocontenida
3. **Reutilización**: Los componentes compartidos viven en `shared/`
4. **Escalabilidad**: Nuevas features se agregan sin modificar las existentes

---

## Funcionalidades principales

- Configuración de institución financiera
- Configuración de tipos de crédito y tasas
- Cobros indirectos
- Generación de tabla de amortización y exportación a PDF
- Módulo de inversiones (simulación, documentación, biometría)

---

## Autor

OscarJRM
