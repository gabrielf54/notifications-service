# SMS Notification Service

[![Node.js CI](https://github.com/seu-usuario/sms-notification-service/actions/workflows/node.js.yml/badge.svg)](https://github.com/seu-usuario/sms-notification-service/actions/workflows/node.js.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um microsserviço flexível para envio de mensagens SMS, suportando múltiplos provedores (Twilio e AWS SNS). Permite alternar entre provedores através de configuração simples, sem necessidade de alterar o código.

## 🚀 Funcionalidades

- 📱 Envio de SMS via Twilio ou AWS SNS
- 🔄 Alternância fácil entre provedores
- 📊 Logging completo
- 🔒 Segurança implementada
- 📝 API REST documentada
- 🧪 Testes automatizados

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
npm test
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
│   └── app.js           # Aplicação principal
├── tests/               # Testes automatizados
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

## 📞 Suporte

Para suporte, envie um email para gabrielfcosta.dev@gmail.com ou abra uma issue no GitHub.

---

Desenvolvido com ❤️ por [Gabriel Ferreira](https://github.com/gabrielf54) 