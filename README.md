# ⚙️ Debt Management System - Backend API (NestJS)

Este es el servidor API robusto encargado de la lógica de negocio, persistencia de datos y generación de estadísticas para el sistema de gestión de deudas.

---

## 📋 Tabla de Contenidos

- [🎯 Descripción General](#-descripción-general)
- [🏗️ Estructura del Proyecto](#%EF%B8%8F-estructura-del-proyecto)
- [📘 Descripción Técnica](#-descripción-técnica)
- [📦 Infraestructura (Docker)](#-infraestructura-docker)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [📖 Documentación de la API (Swagger)](#-documentación-de-la-api-swagger)
- [🌍 Variables de Envío](#-variables-de-entorno)
- [🧪 Endpoints Principales](#-endpoints-principales)
- [🎨 Tecnologías Usadas](#-tecnologías-usadas)

---

## 🎯 Descripción General

El backend gestiona el ciclo de vida de las deudas, incluyendo:
- 🔐 Autenticación y Autorización basada en **JWT**.
- 📊 Dashboard de estadísticas con cálculos agregados (Total, Pagado, Pendiente).
- 🧾 Gestión de deudas (CRUD) con filtros avanzados y paginación.
- 💸 Lógica para marcar deudas como pagadas vinculando al usuario responsable.
- 🚀 Caché con **Redis** para optimizar el rendimiento.
- 📝 Documentación interactiva con **Swagger**.

---

## 🏗️ Estructura del Proyecto

```text
debt-management-api/
├── src/
│   ├── auth/                # Registro, Login y Guardianes JWT
│   ├── debts/               # Lógica de deudas, reportes y estadísticas
│   ├── users/               # Gestión de perfiles de usuario
│   ├── common/              # Utilidades, filtros y decoradores
│   ├── app.module.ts        # Módulo raíz
│   └── main.ts              # Punto de entrada
├── docker-compose.yml       # Orquestación de DB y Redis
├── .env.example             # Plantilla de configuración
└── package.json             # Dependencias

```

---

## 📘 Descripción Técnica

Esta API ha sido diseñada siguiendo los principios de **Arquitectura Modular** de NestJS, garantizando escalabilidad y mantenibilidad.

### Características del Sistema:

* **Gestión de Datos Relacional**: Utiliza **PostgreSQL** para asegurar la integridad de las transacciones financieras y las relaciones entre deudores y pagadores.
* **Optimización de Consultas**: Implementa un sistema de **Caché con Redis** para los endpoints de lectura frecuente (como el listado de deudas y estadísticas), reduciendo la latencia y la carga en la base de datos principal.
* **Cálculos Agregados**: La lógica de estadísticas realiza cálculos directamente en el motor de la base de datos mediante **TypeORM QueryBuilder**, permitiendo procesar grandes volúmenes de registros de forma instantánea.
* **Seguridad y Auditoría**: El sistema de autenticación emplea **Passport.js y JWT**, asegurando que cada operación de pago o edición quede vinculada a un usuario autenticado mediante el registro de IDs de auditoría.
* **Exportación de Reportes**: Cuenta con un motor de generación de **CSV** que permite a los usuarios administrativos obtener estados de cuenta filtrados para análisis externo.

---

## 📦 Infraestructura (Docker)

El proyecto requiere **PostgreSQL** y **Redis**. Se incluye un archivo `docker-compose.yml` para levantar estos servicios de forma automática.

**Servicios configurados:**

* **PostgreSQL**: Base de datos relacional (Puerto 5432).
* **Redis**: Motor de caché (Puerto 6379).

```bash
# Levantar la infraestructura
docker-compose up -d

```

---

## 🚀 Inicio Rápido

### ⚡ Instalación

```bash
# 1. Clonar e instalar
git clone [https://github.com/CarlosAndresOrtega/debt-core.git](https://github.com/CarlosAndresOrtega/debt-core.git)
cd debt-core
npm install

# 2. Configurar Base de Datos (Docker)
docker-compose up -d

# 3. Iniciar API
npm run start:dev

```

La API estará disponible en: `http://localhost:3000/api`

---

## 📖 Documentación de la API (Swagger)

El proyecto tiene implementado **Swagger**, lo que permite visualizar y probar todos los endpoints desde una interfaz web interactiva.

Una vez que la aplicación esté corriendo, puedes acceder a la documentación en:
👉 **[http://localhost:3000/api/docs](https://www.google.com/search?q=http://localhost:3000/api/docs)**

---

## 🌍 Variables de Entorno

Crea un archivo `.env` en la raíz basado en los valores del `docker-compose.yml`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=debtdb
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=tu_clave_secreta

```

---

## 🧪 Endpoints Principales

### 🔐 Auth & Users

| Método | Endpoint | Descripción |
| --- | --- | --- |
| POST | `/auth/login` | Autenticación y retorno de token |
| POST | `/auth/register` | Creación de cuenta nueva |

### 💰 Deudas (Debts)

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/debts` | Lista paginada con filtros |
| GET | `/debts/stats` | Totales (Pagado vs Pendiente) |
| PATCH | `/debts/:id/pay` | Marcar como pagada (requiere userId) |
| GET | `/debts/export/csv` | Descarga de reporte en Excel/CSV |

---

## 🎨 Tecnologías Usadas

| Tecnología | Descripción |
| --- | --- |
| **NestJS** | Framework de backend eficiente y escalable. |
| **Swagger** | Documentación interactiva de la API. |
| **TypeORM** | ORM para interactuar con PostgreSQL. |
| **PostgreSQL** | Motor de base de datos relacional. |
| **Redis** | Gestión de caché de alto rendimiento. |
| **Passport/JWT** | Estrategias de seguridad y tokens. |

---

## 📦 Scripts Útiles

```bash
npm run start:dev   # Desarrollo con recarga rápida
npm run build       # Compilar para producción
docker-compose down # Apagar base de datos y caché

```

---

<div align="center">
<i>Desarrollado para la gestión financiera eficiente</i>
</div>

```

**¿Deseas que añada alguna otra especificación sobre el manejo de errores o la validación de DTOs en la descripción técnica?**

```