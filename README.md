# APP-SISTEMA EVENTOS

[![Licencia](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tecnologías](https://img.shields.io/badge/Tech-React%20%7C%20JavaScript%20%7C%20Node.js%20%7C%20HTML%20%7C%20Material%20UI-blue)](https://react.dev/)

## 📝 Descripción

Este proyecto fue desarrollado como parte del primer parcial de la asignatura "Manejo y Configuración de Software" de la Universidad Técnica de Ambato. El objetivo principal es aplicar conocimientos sobre Git y plataformas de repositorio remoto mediante la simulación de un entorno real de desarrollo colaborativo, utilizando el modelo GitFlow. Se enfoca en el desarrollo de una aplicación sencilla, siguiendo buenas prácticas de control de versiones y colaboración con Git. 

## 🚀 Comenzando

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas.

### 📋 Pre-requisitos

Asegúrate de tener instalado lo siguiente en tu sistema:

* **Node.js:** (Se recomienda la versión LTS 22.15.0 - Long Term Support). Puedes descargarlo desde [https://nodejs.org/](https://nodejs.org/).
* **npm** (viene instalado con Node.js).
* **Git:** (Si aún no lo tienes, descárgalo desde [https://git-scm.com/](https://git-scm.com/)).

### 🔧 Instalación

Sigue estos pasos para clonar y configurar el proyecto en tu máquina local:

1.  **Clonar el repositorio:**

    Abre tu terminal o línea de comandos y navega hasta la ubicación donde deseas clonar los repositorios frontend y backend del proyecto

    * **Mediante SSH (Obligatorio):**

        #FRONTEND
        ```bash
        git@github.com:PROYECTO-MANEJO/FRONTEND_APP.git
        ```

        #BACKEND
        ```bash
        git@github.com:PROYECTO-MANEJO/BACKEND_APP.git
        ```

2.  **Navegar al directorio del proyecto:**

    Una vez que los repositorio se hayan clonado, ingresa al directorio del proyecto con el siguiente comando:

    ```bash
    cd [nombre del directorio del proyecto]
    ```

    Reemplaza `[nombre del directorio del proyecto]` con el nombre de la carpeta que se creó al clonar el repositorio.

3.  **Instalar las dependencias:**

    Dentro del directorio del proyecto, ejecuta el siguiente comando para instalar las dependencias necesarias listadas en el archivo `package.json`:
    tanto de el front como del back.

    * **Con npm:**

        ```bash
        npm install
        ```

    Este proceso descargará todas las bibliotecas y herramientas requeridas para que el proyecto funcione correctamente.

### ▶️ Ejecución del Proyecto en Desarrollo

Una vez que las dependencias estén instaladas, puedes iniciar el servidor de desarrollo local con el siguiente comando:

* **Con npm:**

    ```bash
    npm run dev
    ```

    Esto iniciará el servidor de desarrollo del front y el back.

## ⚙️ Ejecutando pruebas

Este proyecto no incluye pruebas automatizadas, pero puedes verificar que cada módulo funciona correctamente accediendo a la interfaz y validando la integración visual.

## 📦 Despliegue

Para desplegar el proyecto puedes usar plataformas como Netlify o Vercel. Asegúrate de configurar correctamente las variables de entorno si se usan.

## 🛠️ Construido con

* [React](https://reactjs.org/) – Biblioteca de JavaScript para construir interfaces de usuario.
* [JavaScript (ES6+)](https://developer.mozilla.org/es/docs/Web/JavaScript) – Lenguaje de programación.
* [Node.js](https://nodejs.org/) - Entorno de ejecución para JavaScript del lado del servidor.
* [HTML](https://developer.mozilla.org/es/docs/Web/HTML) - Lenguaje de marcado estándar para páginas web.
* [Material UI](https://mui.com/) – Componentes de interfaz de usuario con estilo moderno.


## 🖇️ Contribuyendo

Por favor lee el archivo [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles de nuestras normas de colaboración. 

## 📌 Versionado

Este proyecto usa [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) para el control de versiones. 

* Se usará el flujo de trabajo de GitFlow, que deberán instalar en sus máquinas.
* Se bloquearán las ramas `main` y `develop` para la seguridad de la integridad del proyecto. Solo se podrá hacer push a ellas mediante pull request.

## ✒️ Autores

* Oscar Riofrio
* Cristian Ango
* Jorge Sailema
* Julio Jacho


## 📄 Licencia

Este proyecto está bajo la Licencia MIT – ver el archivo [LICENSE.md](./LICENSE.md) para más detalles. 

