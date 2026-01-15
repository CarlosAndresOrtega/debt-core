
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
git clone https://github.com/CarlosAndresOrtega/debt-core.git
npm install

# 2. Configurar Base de Datos (Docker)
docker-compose up -d

# 3. Iniciar API
npm run start:dev

```

La API estará disponible en: `http://localhost:3000/api`

---

## 🌍 Variables de Entorno

Crea un archivo `.env` basado en los valores del `docker-compose.yml`:

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

**¿Te gustaría que te ayude a generar también un archivo `.env.example` para que el equipo sepa qué variables configurar?**

```