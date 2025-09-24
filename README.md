# 🎲 n8n Random Number Generator

Um nó personalizado para n8n que gera números verdadeiramente aleatórios usando a API do **Random.org**. 

## 🚀 Características

- ✅ Números **verdadeiramente aleatórios** (não pseudo-aleatórios)
- 🌐 Powered by **Random.org API**
- 🎯 Interface amigável com validação de parâmetros
- 📊 Dados de saída enriquecidos com metadados
- 🔧 Tratamento robusto de erros
- 🐳 Pronto para Docker

## 📋 Pré-requisitos

- **Node.js v22+** (LTS)
- **Docker** e **Docker Compose**
- **npm** ou **yarn**

## 🛠️ Instalação e Configuração

### 1. Preparação do Projeto

```powershell
# Clone o repositório
git clone <repository-url>
cd Desafio-n8n-onfly-random

# Instale as dependências
npm install

# Construa o projeto
npm run build
```

### 2. Configuração do Ambiente

O arquivo `.env` já está configurado com valores padrão seguros:

```env
# Database
POSTGRES_USER=n8n
POSTGRES_PASSWORD=n8n_secure_password
POSTGRES_DB=n8n

# n8n Settings
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123_change_me
TIMEZONE=America/Sao_Paulo
```

### 3. Inicialização do Ambiente

```powershell
# Construir e executar os containers
docker-compose up -d --build

# Verificar se os serviços estão rodando
docker-compose ps
```

### 4. Acesso ao n8n

- **URL**: http://localhost:5678
- **Usuário**: admin
- **Senha**: admin123_change_me

## 📖 Como Usar o Nó Random

### 1. No Editor n8n

1. Acesse o n8n em http://localhost:5678
2. Crie um novo workflow
3. Procure por "Random" na barra lateral de nós
4. Arraste o nó para o canvas
5. Configure os parâmetros:
   - **Min**: Valor mínimo (ex: 1)
   - **Max**: Valor máximo (ex: 100)

### 2. Configurações Disponíveis

| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|---------|
| **Operação** | Seleção | True Random Number Generator | `generate` |
| **Min** | Número | Valor mínimo (incluído no intervalo) | `1` |
| **Max** | Número | Valor máximo (incluído no intervalo) | `100` |

### 3. Dados de Saída

O nó retorna um objeto JSON enriquecido:

```json
{
  "randomNumber": 42,
  "min": 1,
  "max": 100,
  "source": "Random.org",
  "timestamp": "2025-09-24T18:13:45.123Z",
  "requestUrl": "https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new"
}
```

### 4. Exemplo de Uso

```javascript
// Exemplo de workflow simples
// Input: { min: 1, max: 10 }
// Output: { randomNumber: 7, min: 1, max: 10, ... }
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```powershell
# Desenvolvimento com watch mode
npm run dev

# Build completo
npm run build

# Formatação de código
npm run format

# Linting
npm run lint
npm run lintfix
```

### Estrutura do Projeto

```
├── nodes/
│   └── Random/
│       ├── Random.node.ts      # Implementação principal
│       ├── Random.node.json    # Configuração do nó
│       └── random.svg          # Ícone personalizado
├── dist/                       # Arquivos compilados
├── docker-compose.yml          # Configuração Docker
├── Dockerfile                  # Build multi-stage
├── package.json               # Dependências e scripts
└── tsconfig.json              # Configuração TypeScript
```

## 🛡️ Tratamento de Erros

O nó inclui validações robustas:

- ✅ Validação de parâmetros (min < max)
- ✅ Timeout de 10 segundos para requests
- ✅ Tratamento de respostas inválidas da API
- ✅ Modo "Continue on Fail" suportado

## 🧪 Testando o Nó

### 1. Teste Básico

1. Crie um workflow simples
2. Adicione o nó Random
3. Configure Min=1, Max=10
4. Execute e verifique o resultado

### 2. Teste de Validação

1. Configure Min=10, Max=5 (inválido)
2. Execute e observe a mensagem de erro
3. Corrija os valores e teste novamente

## 🐳 Docker

### Build Local

```powershell
# Build apenas da imagem
docker build -t n8n-random .

# Build com compose
docker-compose build
```

### Logs e Debug

```powershell
# Logs do n8n
docker-compose logs n8n

# Logs do banco
docker-compose logs postgres

# Logs em tempo real
docker-compose logs -f
```

## 📊 API do Random.org

O nó utiliza o endpoint oficial do Random.org:

- **URL**: `https://www.random.org/integers/`
- **Parâmetros**:
  - `num=1`: Quantidade de números
  - `min={min}`: Valor mínimo
  - `max={max}`: Valor máximo
  - `col=1`: Uma coluna
  - `base=10`: Base decimal
  - `format=plain`: Formato texto simples
  - `rnd=new`: Novo seed aleatório

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique os logs: `docker-compose logs n8n`
2. Consulte a documentação do n8n: https://docs.n8n.io/
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para a comunidade n8n**