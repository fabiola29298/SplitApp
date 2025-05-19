# Splitter DApp - Expense Sharing on Mantle

## Project Status: In Progress (Approx. 50% Complete)

This project is a decentralized application (DApp) for splitting expenses among friends.

✅ Figma Design  [URL](https://www.figma.com/design/A1sSjGq47lp0HrIczUl0lx/Splitter-Dapp?node-id=0-1&t=gs3B9HhM1uZfUH3E-1)

🌐 Live Web App Video [https://youtu.be/XxanCPlFegc](https://youtu.be/XxanCPlFegc)

🌐 Live Web App URL [https://split-app-mu-nine.vercel.app/](https://split-app-mu-nine.vercel.app/)

 

## Visión General del Proyecto

Esta DApp permite llevar un registro de los gastos y saldos compartidos con compañeros de piso, de viaje, grupos, amigos y familia. Permite a los usuarios:
*   Controla los gastos y saldos compartidos y quién debe a quién.
*   Salda deudas con amigos y registra cualquier pago
Además hay um chatbot inteligente que (simulando la integración con un LLM como Nebula de Thirdweb) permite a los usuarios:
*   Analizar sus deudas existentes en la blockchain.
*   Recibir sugerencias para optimizar los pagos (agrupando deudas).
*   Iniciar transacciones de pago utilizando comandos en lenguaje natural (interpretados por el chatbot).

## Funcionalidades Clave

*   **Gestión de Deudas Simplificada (Smart Contract):**
    *   Creación y actualización de deudas entre participantes para diferentes "grupos" (identificados por un ID).
    *   Pago de deudas enviando la moneda nativa (MNT) de la red Mantle.
    *   Funciones `view` para consultar deudas por usuario, por grupo, y deudas específicas.
*   **Interfaz de Frontend Intuitiva:**
    *   Conexión de wallet simplificada usando **Privy** (soporte para social logins y wallets tradicionales).
    *   Visualización de información del contrato.
*   **Chatbot Optimizador de Deudas (Funcionalidad Innovadora):**
    *   **Análisis de Deudas:** El usuario puede pedir al chatbot que analice sus deudas existentes. El chatbot consulta el smart contract desplegado en Mantle. 

## Tecnologías Utilizadas

*   **Blockchain:** Mantle (Sepolia Testnet para la demo)
*   **Smart Contracts:** Solidity ^0.8.20
    *   OpenZeppelin Contracts (para `Ownable` y `EnumerableSet`)
*   **Frontend:**
    *   Next.js 13+ (App Router)
    *   React
    *   TypeScript
    *   Tailwind CSS
    *   shadcn/ui (para componentes UI)
    *   Lucide React (para iconos)
*   **Interacción Web3 Frontend:**
    *   **Privy:** Para autenticación y gestión de wallets (social login, EOA).
    *   **Viem:** Librería ligera para interactuar con Ethereum/Mantle (reemplazando Ethers.js).
*   **Asistente IA (Simulado):**
    *   Lógica en el frontend para simular la interpretación de comandos y preparación de transacciones (emulando Nebula de Thirdweb).
    *   (Arquitectura descrita para usar la API real de Nebula a través de una API Route de Next.js para proteger claves secretas).

