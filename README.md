# ⚜️ Peaky Blinders — Sistema de Guilda

> Sistema de gerenciamento de ouro para a guilda **Peaky Blinders** do servidor **Colorado RP** (Red Dead Redemption 2 RP).

---

## 📋 Funcionalidades

- 🔐 Autenticação com JWT (login seguro para administradores)
- 👥 Cadastro, edição e remoção de membros
- 🪙 Controle de ouro por membro (adicionar, remover, definir)
- 🏦 Banco da Guilda com transferências bidirecionais
- 📜 Histórico completo e imutável de todas as movimentações
- 📊 Estatísticas e gráficos com Chart.js
- 🏆 Ranking de membros por ouro
- 📤 Exportação em PDF, Excel e CSV
- 🔍 Pesquisa em tempo real de membros
- 📱 Interface responsiva (desktop e mobile)

---

## 🗂️ Estrutura do Projeto

```
guilda-peaky/
├── client/               # Frontend React + Vite
│   └── src/
│       ├── components/
│       │   ├── layout/   # Sidebar, Layout
│       │   └── ui/       # Modal, ConfirmModal, HistoricoModal, ExportButtons
│       ├── context/      # AuthContext, ToastContext
│       ├── pages/        # Dashboard, Membros, Banco, Histórico, Estatísticas, Login
│       ├── services/     # api.js (axios)
│       └── styles/       # global.css
└── server/               # Backend Node.js + Express
    ├── prisma/
    │   └── schema.prisma # Modelos do banco de dados
    └── src/
        ├── controllers/  # auth, membro, banco, historico, dashboard
        ├── middleware/    # auth.middleware.js
        ├── routes/       # Rotas da API REST
        ├── services/     # historico.service.js
        └── utils/        # seed.js
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v8 ou superior

### Passo 1 — Clone ou extraia o projeto

```bash
# Se veio como ZIP, extraia e entre na pasta:
cd guilda-peaky
```

### Passo 2 — Instale todas as dependências

```bash
# Na raiz do projeto (instala root + server + client):
npm run install:all
```

Ou instale manualmente em cada pasta:

```bash
# Raiz
npm install

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### Passo 3 — Configure o banco de dados

```bash
cd server

# Gerar o cliente Prisma
npx prisma generate

# Criar as tabelas no banco SQLite
npx prisma migrate dev --name init

# Popular o banco com dados iniciais
node src/utils/seed.js
```

Ou use o atalho na raiz:

```bash
npm run setup
```

### Passo 4 — Iniciar o sistema

```bash
# Na raiz do projeto, inicia backend + frontend simultaneamente:
npm run dev
```

Ou inicie separadamente:

```bash
# Terminal 1 — Backend (porta 3001)
cd server && npm run dev

# Terminal 2 — Frontend (porta 5173)
cd client && npm run dev
```

### Passo 5 — Acessar o sistema

Abra o navegador em: **http://localhost:5173**

---

## 🔑 Credenciais Iniciais

Após executar o seed, o sistema terá um administrador padrão:

| Campo   | Valor      |
|---------|------------|
| Usuário | `admin`    |
| Senha   | `peaky2024` |

> ⚠️ **Recomendado:** Altere a senha padrão no banco de dados após o primeiro acesso.

---

## 👤 Como Criar um Novo Administrador

Para criar um administrador adicional, execute no terminal dentro de `server/`:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('SUA_SENHA_AQUI', 10);
  await prisma.admin.create({
    data: { username: 'SEU_USUARIO', password: hash, name: 'Seu Nome' }
  });
  console.log('Admin criado!');
}
main().finally(() => prisma.\$disconnect());
"
```

---

## 🗄️ Banco de Dados

### Visualizar dados com Prisma Studio

```bash
cd server
npx prisma studio
```

Abre uma interface visual em http://localhost:5555 para visualizar e editar as tabelas.

### Resetar banco de dados

```bash
cd server
npx prisma migrate reset
node src/utils/seed.js
```

### Fazer backup do banco

O banco SQLite fica em `server/prisma/dev.db`. Para fazer backup:

```bash
cp server/prisma/dev.db server/prisma/dev.db.backup-$(date +%Y%m%d)
```

---

## 🌐 API REST

Base URL: `http://localhost:3001/api`

Todas as rotas (exceto `/auth/login`) exigem o header:
```
Authorization: Bearer <token>
```

### Autenticação
| Método | Rota           | Descrição        |
|--------|----------------|------------------|
| POST   | /auth/login    | Login            |
| GET    | /auth/me       | Dados do admin   |

### Membros
| Método | Rota                   | Descrição                      |
|--------|------------------------|--------------------------------|
| GET    | /membros               | Listar membros (com ?search=)  |
| GET    | /membros/:id           | Buscar membro por ID           |
| POST   | /membros               | Criar membro                   |
| PUT    | /membros/:id           | Editar membro                  |
| DELETE | /membros/:id           | Desativar membro               |
| POST   | /membros/:id/ouro      | Operação de ouro (ADD/REMOVE/SET) |

### Banco da Guilda
| Método | Rota                         | Descrição                    |
|--------|------------------------------|------------------------------|
| GET    | /banco                       | Saldo do banco               |
| GET    | /banco/historico             | Histórico do banco           |
| POST   | /banco/banco-para-membro     | Banco envia ouro ao membro   |
| POST   | /banco/membro-para-banco     | Membro deposita no banco     |

### Histórico
| Método | Rota                          | Descrição                  |
|--------|-------------------------------|----------------------------|
| GET    | /historico                    | Listar histórico (filtros) |
| GET    | /historico/membro/:membroId   | Histórico de um membro     |

### Dashboard
| Método | Rota                     | Descrição              |
|--------|--------------------------|------------------------|
| GET    | /dashboard               | Dados do painel        |
| GET    | /dashboard/estatisticas  | Dados para gráficos    |

---

## ⚙️ Variáveis de Ambiente

### server/.env
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

### client/.env
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🛠️ Scripts Disponíveis

Na raiz do projeto:

| Script              | Descrição                                      |
|---------------------|------------------------------------------------|
| `npm run dev`       | Inicia backend + frontend simultaneamente      |
| `npm run dev:server`| Inicia apenas o backend                        |
| `npm run dev:client`| Inicia apenas o frontend                       |
| `npm run install:all`| Instala dependências de todos os pacotes      |
| `npm run setup`     | Gera Prisma, migra e semeia o banco            |
| `npm run build`     | Gera build de produção do frontend             |

---

## 🎨 Design

O sistema foi desenvolvido com tema inspirado em **Peaky Blinders** e **Red Dead Redemption 2**:

- Fundo preto carvão (`#0a0806`)
- Tons de madeira escura (`#1a1208`)
- Detalhes dourados (`#c9a84c`)
- Fontes: **Cinzel** (display), **Playfair Display** (headings), **Inter** (corpo)
- Animações suaves e sombras elegantes

---

## 📦 Tecnologias Utilizadas

**Frontend:**
- React 18 + Vite
- React Router DOM v6
- Chart.js + react-chartjs-2
- Axios
- date-fns
- jsPDF + jspdf-autotable
- SheetJS (xlsx)

**Backend:**
- Node.js + Express
- Prisma ORM
- SQLite
- JWT (jsonwebtoken)
- bcryptjs
- cors

---

## 📄 Licença

Projeto privado — Guilda Peaky Blinders, Colorado RP.

---

*By order of the Peaky Blinders* ⚜️
