# Recicla Entulhos — Sistema de Gerenciamento de Caçambas

Aplicação full-stack para gerenciamento de caçambas e controle de aluguel, desenvolvida como parte de um desafio técnico.

O sistema permite cadastrar caçambas, realizar aluguéis vinculados a endereços (com preenchimento automático via ViaCEP), visualizar histórico e finalizar aluguéis.

---

# Arquitetura

O projeto é dividido em dois serviços principais:
```
recicla-entulhos/  
│  
├── backend/ API REST (NestJS + Prisma)  
├── frontend/ Interface Web (Next.js)  
│  
└── docker-compose.yml
```


A aplicação roda completamente via **Docker**, incluindo banco de dados.

---

# Stack Tecnológica

## Backend

- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- Docker

## Frontend

- Next.js (App Router)
- React
- Tailwind CSS
- React Toastify
- Fetch API

## Infraestrutura

- Docker
- Docker Compose

---

# Funcionalidades

## Caçambas

- Cadastro de caçambas
- Edição de caçambas
- Listagem com status
- Identificação de caçamba disponível ou alugada

## Aluguéis

- Registro de aluguel
- Integração com **ViaCEP**
- Histórico de aluguéis
- Finalização de aluguel

## Endereço automático

Ao informar o CEP, o sistema consulta:
`https://viacep.com.br/ws/{cep}/json/`

Preenchendo automaticamente:  
- Rua  
- Bairro  
- Cidade  
  
---  
  
# Backend  
  
## Estrutura
```
backend/src  
├── dumpsters/  
├── rentals/  
├── prisma/  
│  
├── main.ts  
└── app.module.ts
```
## Principais módulos  
  
### Dumpsters  
Responsável pelo gerenciamento das caçambas.  
  
Endpoints:
`GET /api/dumpsters`
`POST /api/dumpsters`
`GET /api/dumpsters/:id`
`PATCH /api/dumpsters/:id`

---  
  
### Rentals    
Gerencia os aluguéis das caçambas.  
Endpoints:
`POST /api/rentals`
`GET /api/rentals/dumpster/:id`
`PATCH /api/rentals/:id/finish`

Regras de negócio:  
  
- Uma caçamba **não pode ter dois aluguéis abertos**  
- Um aluguel só pode ser finalizado **uma vez**  
- CEP é normalizado antes de salvar  
  
---  
  
### Exemplo de fluxo de aluguel  
  
1. Usuário seleciona uma caçamba  
2. Informa CEP  
3. Sistema consulta ViaCEP  
4. Endereço é preenchido automaticamente  
5. Aluguel é registrado  
  
---

## Principais telas

### Login
![Tela de login](/assets/img1.png)

### Listagem de caçambas
![Tela de caçambas](/assets/img7.png)

### Cadastro de caçamba
![Tela de cadastro caçambas](/assets/img2.png)

### Edição de caçamba
![Tela de edição caçambas](/assets/img3.png)

### Alugar caçamba
![Tela de alugar caçambas](/assets/img4.png)

### Histórico de aluguéis
![Tela de historico](/assets/img5.png)
![Tela de historico](/assets/img6.png)

---  
  
# Como rodar o projeto  
  
Pré-requisitos:  
  
- Docker  
- Docker Compose  
  
---  
  
## 1. Clonar repositório
```bash 
git clone <repo>  
cd recycling-debris
```

---  
  
## 2. Subir containers
```docker compose up --build```

Isso iniciará:
backend  
frontend  
postgres

  
---  
  
## 3. Aplicação disponível  
  
Frontend:
```http://localhost:3000```

Backend:
```http://localhost:5001```

---  
  
# Prisma  
  
Caso seja necessário rodar migrations manualmente:
```docker compose exec backend npx prisma migrate dev``` 

---  
  
# Autor  
  
Junior Paula  
> Engenheiro de Software