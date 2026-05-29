# Guía Completa de Uso — Nexo Capital
### Plataforma de Gestión de Préstamos para la Comunidad Latina

---

> **Documento confidencial** — Preparado exclusivamente para el equipo de Nexo Capital.  
> Versión 0.4 · Mayo 2026

---

## Tabla de Contenidos

1. [Visión General de la Plataforma](#1-visión-general-de-la-plataforma)
2. [Acceso y Roles de Usuario](#2-acceso-y-roles-de-usuario)
3. [La Landing Page (Sitio Público)](#3-la-landing-page-sitio-público)
4. [Formulario de Solicitud (Aplicación del Cliente)](#4-formulario-de-solicitud-aplicación-del-cliente)
5. [Portal del Cliente (Dashboard)](#5-portal-del-cliente-dashboard)
6. [Panel de Administración (CRM)](#6-panel-de-administración-crm)
7. [Flujo Completo de un Préstamo](#7-flujo-completo-de-un-préstamo)
8. [Seguridad y Buenas Prácticas](#8-seguridad-y-buenas-prácticas)
9. [Preguntas Frecuentes](#9-preguntas-frecuentes)

---

## 1. Visión General de la Plataforma

**Nexo Capital** es una plataforma web completa diseñada para gestionar préstamos personales dirigidos a la comunidad hispana en Estados Unidos. La plataforma tiene **dos grandes áreas**:

| Área | ¿Para quién? | ¿Cómo se accede? |
|---|---|---|
| **Sitio público + Formulario** | Clientes que buscan un préstamo | Visitando la página principal |
| **Portal del cliente** | Clientes que ya aplicaron | Iniciando sesión en `/dashboard` |
| **Panel de administración** | El equipo de Nexo Capital | Iniciando sesión en `/admin` |

### ¿Cómo está construida?

La plataforma funciona con datos en tiempo real almacenados en **Supabase** (base de datos en la nube segura). Toda la información se guarda automáticamente y es accesible desde cualquier dispositivo — computadora, teléfono o tablet.

---

## 2. Acceso y Roles de Usuario

### 2.1 Rol: Administrador

El administrador es el equipo interno de Nexo Capital. Tiene acceso completo al CRM, puede ver todos los leads, moverlos por el pipeline, ver datos de desembolso y responder mensajes de contacto.

**Para ingresar como administrador:**
1. Ir a la página web
2. Clic en **"Iniciar sesión"** en la barra de navegación
3. Usar las credenciales de administrador (email + contraseña del equipo)
4. El sistema detecta automáticamente que es administrador y redirige al **Panel Admin** (`/admin`)

> ⚠️ **Importante:** La cuenta de administrador debe estar marcada como `is_admin = true` en la base de datos de Supabase. Si se crea una cuenta nueva para un asesor, se debe activar ese campo manualmente en Supabase → tabla `profiles`.

### 2.2 Rol: Cliente

Los clientes son las personas que llenan el formulario de solicitud de préstamo. Al completar el formulario, el sistema crea automáticamente una cuenta para ellos.

**Para ingresar como cliente:**
1. Haber completado el formulario de solicitud (esto crea su cuenta)
2. Ir a la página → clic en **"Iniciar sesión"**
3. Usar el email y la contraseña que definieron al aplicar
4. El sistema los redirige a su **Portal del Cliente** (`/dashboard`)

---

## 3. La Landing Page (Sitio Público)

La página principal es la cara pública de Nexo Capital. Está diseñada para atraer y convertir visitantes en aplicantes. Funciona perfectamente en **celulares, tablets y computadoras**.

### Secciones de la página:

#### Hero (Portada)
- Mensaje principal con propuesta de valor
- **Calculadora de préstamo interactiva** — el visitante puede mover el slider para ver cuánto pagaría mensualmente según el monto y plazo
- Botón "Aplicar ahora" que lleva directamente al formulario
- Estadísticas de confianza (clientes, tiempo de aprobación)

#### ¿Cómo Funciona?
- Explica el proceso en 4 pasos simples: Formulario → Evaluación → Llamada → Dinero
- Diseñado para reducir el miedo o confusión del cliente potencial

#### Requisitos
- Lista los requisitos mínimos de manera clara y no intimidante
- Incluye la sección "¿Por qué elegirnos?" con los diferenciadores de Nexo Capital

#### Testimonios y Confianza
- Testimonios de clientes reales con montos aprobados
- Pilares de confianza: datos protegidos, sin intermediarios, transparencia total

#### Quiénes Somos
- Historia y valores de Nexo Capital
- Estadísticas de la empresa (años de experiencia, clientes, satisfacción)

#### Contacto
- Formulario de contacto rápido (nombre, teléfono, email, mensaje)
- Los mensajes llegan directamente al panel de administración
- Información de WhatsApp, email y horario de atención

#### Footer
- Links a información legal (privacidad, términos)
- Datos de contacto
- Acceso rápido al portal (`/login`)

---

## 4. Formulario de Solicitud (Aplicación del Cliente)

El formulario es el punto de entrada principal. Está ubicado en la sección "Aplicar Ahora" de la landing page y está dividido en **4 pasos** para no abrumar al usuario.

### Paso 1 — Datos Personales
El cliente ingresa:
- Nombre completo
- Correo electrónico (será su usuario para ingresar al portal)
- Contraseña (mínimo 8 caracteres)
- Número de teléfono
- Estado de residencia en USA

> **Nota para el admin:** Si el cliente ya tiene una cuenta (porque aplicó antes), el sistema lo detecta y usa la cuenta existente. No se crean cuentas duplicadas.

### Paso 2 — Situación Laboral
- ¿Está trabajando actualmente?
- Tipo de trabajo (tiempo completo, medio tiempo, independiente)
- Ingresos mensuales aproximados

### Paso 3 — Perfil Bancario y Crediticio
- ¿Tiene cuenta bancaria activa en USA?
- ¿Recibe sus ingresos en esa cuenta?
- Nombre del banco
- Tiempo usando esa cuenta
- ¿Tiene historial crediticio en USA?

> **Nota:** Si el cliente dice "No" a tener cuenta bancaria, el sistema muestra un mensaje de advertencia informándole que es necesaria para recibir el préstamo.

### Paso 4 — Detalles del Préstamo
- Monto necesario (rangos: $500–$1,000 / $1,000–$2,000 / $2,000–$5,000 / Más de $5,000)
- Propósito del préstamo
- Se muestra automáticamente una estimación de cuotas para el monto seleccionado

### ¿Qué pasa cuando el cliente envía el formulario?

1. Se crea la cuenta del cliente en el sistema de autenticación
2. Se registra el perfil del cliente en la base de datos
3. Se crea un **lead** (solicitud) en el CRM con toda la información
4. El lead aparece automáticamente en el Panel Admin bajo la etapa **"Nuevo Lead"**
5. El cliente ve una pantalla de confirmación exitosa
6. El cliente puede iniciar sesión en su portal para seguir el estado de su solicitud

---

## 5. Portal del Cliente (Dashboard)

Después de aplicar, el cliente puede iniciar sesión en cualquier momento para ver el estado de su solicitud. El portal tiene **4 secciones principales** (pestañas en la parte superior).

### Pestaña: Inicio

Es la pantalla principal. Muestra:
- **Saludo personalizado** con el nombre del cliente
- **Banner de estado** — indica si el préstamo está activo. El color del banner cambia según el estado del desembolso:
  - **Verde** — préstamo activo, todo en orden
  - **Rojo** — hubo un problema con el desembolso, debe contactar al asesor
- **Mini estadísticas** — número de solicitudes, préstamos, y estado actual
- **Línea de tiempo visual** — muestra en qué etapa está la solicitud:
  1. Solicitud recibida
  2. Pre-aprobación
  3. Documentos
  4. Aprobación final
  5. ¡Dinero enviado!
- **Botón de WhatsApp** para contactar al equipo directamente

> **Acción importante del cliente:** Cuando la solicitud llega a la etapa "Aprobación final" (Llamada 2), el cliente verá un botón especial para **completar el formulario de desembolso**. Esta es la parte donde proporciona sus datos bancarios para recibir el dinero.

#### Estado del desembolso en la línea de tiempo
Cuando la solicitud llega a la etapa final ("¡Dinero enviado!"), la línea de tiempo muestra un recuadro adicional según lo que indique el asesor:
- **Verde con palomita** — "¡Desembolso exitoso! Tu dinero ha sido enviado correctamente."
- **Rojo con X** — "Hubo un problema con el desembolso. Por favor contacta a tu asesor para resolverlo."
- **Azul informativo** — El asesor aún no ha marcado el estado del desembolso.

### Pestaña: Mi Cuenta

Muestra una **tarjeta de crédito animada** con:
- Nombre del titular
- Número de cuenta (identificador interno de Nexo Capital)
- Estado de la cuenta (ACTIVO / PENDIENTE)
- Saldo pendiente del préstamo activo

Si hay un problema con el desembolso, aparece un **aviso en rojo** encima de la tarjeta indicando que debe contactar a su asesor.

Si el préstamo está activo y en orden, muestra:
- Cuota mensual
- Plazo total en meses
- Tasa de interés aplicada

**Botón "Ver Contrato"** — Si el cliente tiene un préstamo activo, puede ver e imprimir su contrato de crédito en cualquier momento. El contrato incluye todos los detalles pactados: monto, plazo, tasa, cuota mensual, total a pagar, y espacios para firmas.

### Pestaña: Créditos

Historial completo de:
- **Préstamos** — con barra de progreso de pago, detalles de cuota, fecha de vencimiento y botón "Ver Contrato"
- **Solicitudes** — todas las solicitudes enviadas con su etapa actual. Si el desembolso fue marcado como exitoso o con error, se muestra el badge correspondiente (no la etapa genérica)
- Botón para **hacer una nueva solicitud** (si el cliente necesita otro préstamo)

### Pestaña: Perfil

El cliente puede:
- Ver todos sus datos guardados
- **Editar su información** (nombre, teléfono, dirección, estado civil, fecha de nacimiento)
- Cerrar sesión

> **Nota:** Los datos como fecha de nacimiento, dirección y estado civil también pueden ser llenados por el asesor desde el panel admin, y se sincronizan automáticamente al perfil del cliente.

---

## 6. Panel de Administración (CRM)

El panel de administración es el corazón operativo de Nexo Capital. Aquí el equipo gestiona todos los leads, el pipeline de ventas, los datos de desembolso y los mensajes de contacto.

**URL de acceso:** `/admin` (se accede iniciando sesión con cuenta de administrador)

### 6.1 Estadísticas en tiempo real

En la parte superior del panel se muestran 4 métricas clave:
- **Total Leads** — número total de solicitudes activas (no archivadas)
- **Nuevos** — leads recién llegados sin gestionar (solo activos)
- **Desembolsados** — clientes que ya recibieron su préstamo (solo activos)
- **Mensajes nuevos** — mensajes de contacto sin leer

> Las estadísticas solo cuentan leads **activos**. Los leads archivados no afectan estos contadores.

### 6.2 Leads / Pipeline (Pestaña principal)

Esta es la sección más importante del CRM. Se puede ver en dos vistas:

#### Vista Kanban (tablero visual)
Las solicitudes se organizan en columnas según su etapa:

| Etapa | ¿Qué significa? |
|---|---|
| **Nuevo Lead** | La solicitud acaba de llegar, está sin gestionar |
| **Llamada 1** | Se realizó la primera llamada de contacto |
| **Documentos** | Se está verificando la documentación del cliente |
| **Llamada 2** | Segunda llamada / aprobación final |
| **Desembolsado** | El préstamo fue aprobado y enviado |

> **Consejo:** El tablero Kanban se puede desplazar horizontalmente en celular para ver todas las etapas.

#### Vista Lista (tabla)
Muestra todos los leads en una tabla con columnas: Nombre, Email, Teléfono, Estado, Ingresos, Monto, Etapa y Fecha. Útil para buscar rápidamente un cliente específico.

#### Búsqueda y Filtros
- **Buscador** — busca por nombre, email o teléfono en tiempo real
- **Filtro por etapa** — muestra solo los leads de una etapa específica

#### Sistema de Archivado

Con el tiempo el pipeline puede acumular muchos leads que ya no están activos (rechazados, abandonados, sin respuesta). Para mantener el tablero limpio existe el sistema de **archivado**:

- **Botón "Archivados (N)"** en la barra de herramientas — muestra cuántos leads están archivados
- Al hacer clic, el pipeline cambia a **modo archivados** (banner naranja) mostrando solo los leads archivados
- Para volver a la vista normal, hacer clic en "Ver activos"
- Los leads archivados no desaparecen del sistema — se pueden **restaurar** en cualquier momento desde el perfil del lead

> Los leads activos y archivados son completamente independientes. Archivar un lead no elimina ningún dato.

### 6.3 Perfil del Lead (Panel lateral)

Al hacer clic en cualquier lead, se abre un panel lateral con toda la información del cliente y herramientas de gestión:

#### Contacto directo
- **Botón WhatsApp** — abre WhatsApp con un mensaje pre-redactado de seguimiento
- **Botón Llamar** — marca el número directamente desde el teléfono

#### Cambiar etapa del pipeline
- Un selector desplegable para mover el lead a cualquier etapa con un solo clic
- El cambio se guarda al presionar "Guardar cambios"

#### Datos completos del formulario
Toda la información que el cliente proporcionó al aplicar:
- Teléfono, email, estado de residencia
- Ingresos, banco, historial crediticio
- Monto solicitado, propósito del préstamo

#### Calculadora de préstamo (herramienta interna)

El asesor puede definir con precisión las condiciones del préstamo:
- **Monto** — campo numérico libre (ej: $1,500)
- **Plazo** — botones preestablecidos de 12, 24 y 36 meses, o escribir cualquier número personalizado
- **Tasa de interés** — campo numérico libre (los botones de plazo rellenan la tasa sugerida automáticamente: 12m=4%, 24m=5%, 36m=6%)
- El sistema calcula automáticamente cuota mensual, total a pagar e interés total

Al presionar **"Guardar cambios"**:
- Si ya existe un préstamo activo para el cliente, se **actualiza** con los nuevos valores (monto, plazo, tasa, cuota, total)
- Si no existe préstamo, se crea uno nuevo

#### Estado del desembolso

Cuando el lead está en etapa "Desembolsado", el asesor puede marcar el resultado:
- **"Exitoso"** (verde) — el dinero llegó correctamente a la cuenta del cliente
- **"Incorrecto"** (rojo) — hubo un problema con la transferencia

Este estado se refleja de inmediato en el portal del cliente (banner, Mi Cuenta, Créditos).

#### Ver e imprimir contrato

Si el cliente tiene un préstamo activo, aparece el botón **"Ver Contrato"**. Esto abre un modal con la previsualización del contrato de crédito, con todos los detalles del préstamo. Desde ahí se puede imprimir o guardar como PDF usando el diálogo de impresión del navegador.

#### Datos adicionales del asesor

Campos que el asesor puede completar internamente:
- Fecha de nacimiento
- Estado civil
- Dirección completa
- Código postal
- Notas internas (solo visibles para el equipo)

> **Sincronización automática:** Cuando el asesor guarda estos datos y el lead tiene un usuario registrado, el sistema **actualiza automáticamente** el perfil del cliente en el portal. El cliente verá su fecha de nacimiento, dirección, código postal y estado civil en su pestaña Perfil sin tener que ingresarlos manualmente.

#### Archivar / Restaurar lead

En la parte inferior del perfil del lead hay un botón de archivado:
- **Archivar** — mueve el lead al modo archivado (pide confirmación). El lead desaparece del pipeline activo
- **Restaurar** — si el lead ya está archivado, aparece el botón para devolverlo al pipeline activo

Ambas acciones son reversibles en cualquier momento.

### 6.4 Clientes (Pestaña)

Esta pestaña muestra una tabla de **todos los usuarios registrados** en la plataforma. Permite al asesor editar los datos de cualquier cliente en cualquier momento, sin necesidad de buscar el lead en el pipeline.

#### Cómo usarla
1. Buscar al cliente por nombre o email en el buscador
2. Hacer clic en la fila para abrir el **Editor de Cliente**

#### Editor de Cliente (3 secciones colapsables)

**Datos del Perfil**
- Nombre, teléfono, estado de residencia
- Fecha de nacimiento, estado civil
- Dirección y código postal

**Solicitud de Crédito**
- Etapa actual en el pipeline
- Ingresos, banco, situación laboral, historial crediticio
- Monto solicitado, propósito del préstamo
- Notas internas del asesor
- Campos de datos del asesor (fecha de nacimiento, dirección, estado civil, código postal)

**Préstamo Activo**
- Monto del préstamo, plazo en meses, tasa de interés, estado del préstamo
- Muestra en tiempo real la cuota mensual y el total a pagar calculados
- Si no existe préstamo activo, los campos aparecen vacíos

Al presionar **"Guardar todos los cambios"**, el sistema actualiza las tres tablas en una sola operación y reporta si hubo algún error en alguna de ellas.

### 6.5 Datos de Desembolso (Pestaña)

Esta sección muestra exclusivamente los clientes que completaron el **formulario de desembolso** (donde proporcionaron sus credenciales bancarias para recibir el dinero).

#### ¿Cómo funciona?
1. El admin mueve el lead a etapa "Llamada 2" (Aprobación final)
2. El cliente ve en su portal un botón para completar el formulario de desembolso
3. El cliente ingresa: titular de cuenta, username y contraseña bancaria (en 4 pasos con barra de progreso)
4. Esa información aparece en esta sección del panel admin

#### Vista de la tabla
Se muestra una tabla compacta con: Cliente, Teléfono, Monto, Fecha de completado.

#### Ver credenciales
Al hacer clic en el botón **"Ver"** de cualquier fila, se abre un modal con:
- Información del cliente (monto, teléfono)
- **Credenciales bancarias completas** (titular, username, contraseña con opción de mostrar/ocultar)
- Fecha y hora en que se completó el formulario
- ID único del registro

> **Seguridad:** Esta información es altamente sensible. Solo debe ser accedida por el personal autorizado para realizar la transferencia.

### 6.6 Mensajes de Contacto (Pestaña)

Todos los mensajes enviados desde el formulario de contacto de la landing page aparecen aquí.

**Funcionalidades:**
- Los mensajes no leídos se marcan con un punto azul
- Al hacer clic en un mensaje se marca automáticamente como leído
- El panel derecho muestra el mensaje completo con los datos del remitente
- Botones de respuesta directa por **WhatsApp** o **Email**
- Contador de mensajes sin leer visible en la pestaña

---

## 7. Flujo Completo de un Préstamo

```
CLIENTE aplica en la landing page
        ↓
Lead aparece en CRM → etapa "Nuevo Lead"
        ↓
Asesor llama al cliente (1ra llamada)
        ↓
Lead pasa a → "Llamada 1"
        ↓
Se solicitan y verifican documentos
        ↓
Lead pasa a → "Documentos"
        ↓
Segunda llamada para confirmar condiciones
        ↓
Lead pasa a → "Llamada 2" (Aprobación final)
        ↓ ← El cliente ve en su portal:
            botón "Completar formulario de desembolso"
        ↓
El cliente llena sus datos bancarios (4 pasos)
        ↓
Los datos aparecen en "Datos de Desembolso" del admin
        ↓
El asesor usa los datos para realizar el depósito
        ↓
Admin define condiciones del préstamo con la calculadora
y presiona "Guardar cambios" → préstamo activo creado
        ↓
Lead pasa a → "Desembolsado"
        ↓
Admin marca el estado del desembolso: "Exitoso" o "Incorrecto"
        ↓
El cliente ve el resultado en tiempo real en su portal
```

---

## 8. Seguridad y Buenas Prácticas

### Para el equipo administrador

- **No compartir las credenciales de admin.** Si se necesita dar acceso a un nuevo asesor, crear una cuenta y activar `is_admin = true` en Supabase.
- **Las credenciales bancarias** de los clientes (sección "Datos de Desembolso") son información altamente confidencial. Acceder solo cuando sea necesario para procesar el desembolso.
- **Cerrar sesión** al terminar de trabajar, especialmente desde equipos compartidos.
- **Revisar mensajes de contacto** diariamente para no dejar a ningún cliente sin respuesta.
- **Usar el sistema de archivado** para mantener el pipeline limpio cuando haya más de 20–30 leads activos. Un pipeline ordenado reduce errores y mejora el seguimiento.

### Para los clientes

- Los datos están protegidos con cifrado SSL de 256 bits.
- Las contraseñas nunca se almacenan en texto plano.
- El sistema no solicita información de tarjetas de crédito ni SSN.

### Respaldos y disponibilidad

- La base de datos en Supabase tiene respaldos automáticos diarios.
- La plataforma está disponible 24/7 desde cualquier dispositivo con conexión a internet.

---

## 9. Preguntas Frecuentes

**¿Qué pasa si un cliente olvida su contraseña?**  
Por ahora, el cliente debe contactar al equipo para que el administrador pueda asistirle desde el panel de Supabase. Se puede implementar recuperación de contraseña por email como mejora futura.

**¿Se pueden editar los datos de un lead o cliente?**  
Sí. Desde el perfil del lead (panel lateral) el asesor puede editar campos internos, datos del asesor y las condiciones del préstamo. Desde la pestaña **Clientes** se puede editar cualquier dato del perfil, la solicitud y el préstamo activo de cualquier usuario registrado.

**¿Qué pasa si un cliente aplica dos veces?**  
El sistema detecta si ya existe una cuenta con ese email y usa la misma, creando una nueva solicitud (lead). Ambas solicitudes quedan visibles en el historial del cliente y en el CRM.

**¿Cómo se sabe si un nuevo lead llegó?**  
El contador de "Total Leads" en el panel admin se actualiza en tiempo real. Se recomienda revisar el panel al menos una vez al día, o configurar notificaciones desde Supabase.

**¿Se puede usar desde el teléfono?**  
Sí. Toda la plataforma está optimizada para móvil. El panel admin tiene vista Kanban con scroll horizontal y todos los formularios se adaptan a pantallas pequeñas.

**¿Qué significa el número de cuenta de la tarjeta del cliente?**  
Es un identificador interno generado automáticamente por el sistema. No es un número de cuenta bancaria real, es el identificador de Nexo Capital para ese cliente.

**¿Cómo agregar nuevos asesores al sistema?**  
1. El nuevo asesor crea una cuenta (o el admin la crea en Supabase → Authentication → Users)
2. En Supabase → tabla `profiles` → buscar al usuario → cambiar `is_admin` a `true`
3. El nuevo asesor ya puede ingresar al panel admin

**¿Se puede eliminar un lead?**  
Desde la interfaz, los leads se **archivan** en vez de eliminarse. Esto mantiene el historial completo y permite restaurarlos si se necesita. Si se requiere eliminar un registro permanentemente, se hace directamente desde Supabase → tabla `leads`. No se recomienda para mantener integridad de datos.

**¿El contrato es un documento legal?**  
El contrato generado por la plataforma es un documento de referencia entre Nexo Capital y el cliente. Para validez legal completa se recomienda revisión por asesor legal según las regulaciones del estado correspondiente.

**¿Por qué el cliente ve su perfil actualizado sin haberlo llenado?**  
Cuando el asesor ingresa los datos del cliente en el panel admin (fecha de nacimiento, dirección, estado civil, código postal), el sistema los sincroniza automáticamente al perfil del cliente. Es una funcionalidad diseñada para que el asesor pueda completar la información durante las llamadas.

**¿Qué son los leads archivados?**  
Los leads archivados son solicitudes que ya no están activas (rechazadas, abandonadas, sin respuesta, etc.) pero que se conservan en el sistema por historial. No aparecen en el pipeline normal ni en las estadísticas, pero se pueden ver y restaurar en cualquier momento desde el botón "Archivados (N)" del panel admin.

---

## Información de Contacto del Desarrollador

Para soporte técnico, nuevas funcionalidades o reportar problemas:

> Esta plataforma fue diseñada y desarrollada a medida para **Nexo Capital**.  
> Para modificaciones, actualizaciones o nuevas funcionalidades, contactar al desarrollador.

---

*Documento actualizado en Mayo 2026 · Nexo Capital Platform v0.4*
