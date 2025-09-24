# 🧪 Testes - Random Node para n8n

Este diretório contém todos os testes para o conector Random do n8n.

## 📁 Estrutura de Testes

```
tests/
├── setup.ts                           # Configuração global dos testes
├── nodes/
│   └── Random/
│       └── Random.node.test.ts        # Testes unitários principais
└── README.md                          # Este arquivo
```

## 🚀 Executando os Testes

### Todos os testes
```bash
npm test
```

### Testes com coverage
```bash
npm run test:coverage
```

### Testes em modo watch (durante desenvolvimento)
```bash
npm run test:watch
```

### Testes específicos
```bash
# Apenas testes unitários do node
npm test tests/nodes/Random/Random.node.test.ts

# Com padrão de nome
npm test -- --testNamePattern="should generate"
```

## 📊 Cobertura de Testes

Os testes cobrem:

### ✅ **Funcionalidade Principal**
- ✅ Geração de números aleatórios
- ✅ Processamento de múltiplos items
- ✅ Integração com API Random.org

### ✅ **Validações e Sanitização**
- ✅ Validação de parâmetros (Min/Max)
- ✅ Conversão de decimais para inteiros
- ✅ Troca automática se Min > Max
- ✅ Limites da API Random.org

### ✅ **Tratamento de Erros**
- ✅ Operação inválida
- ✅ Parâmetros não-numéricos (NaN, undefined)
- ✅ Valores fora dos limites (-1B a 1B)
- ✅ Resposta inválida da API
- ✅ Erros de rede/HTTP

### ✅ **Edge Cases**
- ✅ Min = Max
- ✅ Números negativos
- ✅ Valores máximos permitidos
- ✅ Resposta com espaços em branco

### ✅ **Integração com n8n**
- ✅ Chamadas corretas à API
- ✅ Parâmetros de request adequados
- ✅ Estrutura de resposta correta

## 🔧 Configuração

### Jest Configuration (`jest.config.js`)
- **Environment**: Node.js
- **Test Pattern**: `**/*.test.ts`
- **Coverage**: Lines, Functions, Branches, Statements
- **Timeout**: 30 segundos
- **Setup**: `tests/setup.ts`

### TypeScript Support
- Usa `ts-jest` para compilação
- Suporte completo aos tipos n8n
- Mocks tipados para melhor IntelliSense

## 📈 Métricas de Cobertura

Alvos de cobertura configurados:
- **Linhas**: 80%
- **Funções**: 80%
- **Branches**: 80%
- **Statements**: 80%

## 🔍 Debugging Testes

### VSCode Debug Configuration
```json
{
    "type": "node",
    "request": "launch",
    "name": "Debug Jest Tests",
    "program": "${workspaceFolder}/node_modules/.bin/jest",
    "args": ["--runInBand", "--detectOpenHandles"],
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen"
}
```

### Executar teste específico com debug
```bash
npm test -- --testNamePattern="should generate random number" --detectOpenHandles
```

## 🛠️ Estrutura dos Mocks

### IExecuteFunctions Mock
```typescript
const mockExecuteFunctions = {
    getInputData: jest.fn(),
    getNodeParameter: jest.fn(), 
    getNode: jest.fn(),
    helpers: {
        httpRequest: mockHttpRequest,
    },
} as any;
```

### HTTP Request Mock
```typescript
const mockHttpRequest = jest.fn();
mockHttpRequest.mockResolvedValue('42\n');
```

## 📋 Checklist para Novos Testes

Ao adicionar novos testes, certifique-se de:

- [ ] Usar mocks adequados para `IExecuteFunctions`
- [ ] Testar casos de sucesso e erro
- [ ] Validar estrutura de resposta
- [ ] Incluir edge cases relevantes
- [ ] Seguir padrão de nomenclatura: `should [action] [expected result]`
- [ ] Agrupar testes relacionados com `describe()`
- [ ] Limpar mocks com `afterEach(() => jest.clearAllMocks())`

## 🚨 Troubleshooting

### Problema: "Cannot find module"
**Solução**: Execute `npm run build` antes dos testes para compilar TypeScript

### Problema: Mock não funciona
**Solução**: Verifique se está usando `jest.fn()` e chamando `mockReturnValue()`

### Problema: Timeout nos testes
**Solução**: Aumente timeout no Jest ou use `jest.setTimeout(60000)`

### Problema: Tipos TypeScript
**Solução**: Use `as any` para mocks complexos ou implemente interface completa

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [TypeScript Testing](https://jestjs.io/docs/getting-started#using-typescript)