# SMS Notification Service

[![Node.js CI](https://github.com/seu-usuario/sms-notification-service/actions/workflows/node.js.yml/badge.svg)](https://github.com/seu-usuario/sms-notification-service/actions/workflows/node.js.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-green.svg)](https://github.com/seu-usuario/sms-notification-service/actions)

Um microsserviço flexível para envio de mensagens SMS, suportando múltiplos provedores (Twilio e AWS SNS). Permite alternar entre provedores através de configuração simples, sem necessidade de alterar o código.

## 🚀 Funcionalidades

- 📱 Envio de SMS via Twilio ou AWS SNS
- 🔄 Alternância fácil entre provedores
- 📊 Logging completo
- 🔒 Segurança implementada
- 📝 API REST documentada
- 🧪 Testes automatizados
- ✅ Validação de dados robusta
- 🛡️ Tratamento de erros avançado

## 📋 Pré-requisitos

- Node.js >= 14
- npm ou yarn
- Conta no Twilio ou AWS (opcional para testes)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sms-notification-service.git
cd sms-notification-service
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
# Escolha do Provedor
SMS_PROVIDER=twilio # ou aws

# Configuração Twilio
TWILIO_ACCOUNT_SID=sua-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_PHONE_NUMBER=seu-numero

# Configuração AWS
AWS_REGION=sua-regiao
AWS_ACCESS_KEY=sua-access-key
AWS_SECRET_KEY=sua-secret-key
```

## 🏃‍♂️ Executando o Serviço

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Testes
```bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 📡 API Endpoints

### Enviar SMS
```bash
curl -X POST http://localhost:3000/api/messages \
-H "Content-Type: application/json" \
-d '{
    "to": "5511999999999",
    "message": "Teste de SMS"
}'
```

Resposta de sucesso:
```json
{
    "success": true,
    "provider": "twilio",
    "messageId": "SM123456789",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "status": "sent",
    "details": {
        "to": "5511999999999",
        "message": "Teste de SMS",
        "deliveryStatus": "delivered"
    }
}
```

Resposta de erro (exemplo):
```json
{
    "success": false,
    "error": {
        "message": "Invalid phone number format",
        "field": "to",
        "type": "validation"
    }
}
```

### Verificar Status
```bash
curl -X GET http://localhost:3000/api/status
```

Resposta:
```json
{
    "success": true,
    "data": {
        "service": "SMS Notification Service",
        "provider": "twilio",
        "status": "operational",
        "timestamp": "2024-01-01T12:00:00.000Z"
    }
}
```

## 🏗️ Estrutura do Projeto

```
sms-notification-service/
├── src/
│   ├── config/           # Configurações do serviço
│   ├── controllers/      # Controladores da API
│   ├── interfaces/       # Interfaces para provedores
│   ├── providers/        # Implementações dos provedores
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviço principal
│   ├── utils/           # Funções utilitárias
│   ├── validators/      # Validadores de dados
│   └── app.js           # Aplicação principal
├── tests/               # Testes automatizados
│   ├── unit/           # Testes unitários
│   ├── integration/    # Testes de integração
│   └── e2e/            # Testes end-to-end
├── .env.example         # Exemplo de variáveis de ambiente
├── .gitignore          # Arquivos ignorados pelo git
├── package.json         # Dependências
└── README.md            # Documentação
```

## 🔐 Segurança

- Todas as credenciais são armazenadas em variáveis de ambiente
- Middleware de segurança implementado (Helmet, CORS)
- Logging de todas as operações
- Tratamento de erros robusto
- Validação de dados de entrada

## 🧪 Testes

O projeto inclui uma suíte completa de testes:

- **Testes Unitários**: Testam componentes individuais
- **Testes de Integração**: Testam a integração entre componentes
- **Testes E2E**: Testam o fluxo completo da aplicação

Para executar os testes:
```bash
# Todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 🛡️ Tratamento de Erros

O serviço implementa um sistema robusto de tratamento de erros:

1. **Erros de Validação**
   - Validação de formato de número de telefone
   - Validação de tamanho da mensagem
   - Validação de campos obrigatórios

2. **Erros de Provedor**
   - Tratamento específico para cada provedor
   - Retry automático em caso de falha
   - Logging detalhado de erros

3. **Erros de Serviço**
   - Tratamento de erros internos
   - Mensagens de erro amigáveis
   - Logging completo

## 📈 Próximos Passos

- [ ] Implementar novos provedores
- [ ] Adicionar suporte a templates
- [ ] Implementar fila de mensagens
- [ ] Adicionar métricas de uso
- [ ] Implementar webhooks para status
- [ ] Adicionar autenticação na API

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para seu-email@exemplo.com ou abra uma issue no GitHub.

---

Desenvolvido com ❤️ por [Seu Nome](https://github.com/seu-usuario) 