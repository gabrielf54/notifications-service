class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

class ProviderError extends Error {
  constructor(message, provider) {
    super(message);
    this.name = 'ProviderError';
    this.provider = provider;
    this.statusCode = 500;
  }
}

class ServiceError extends Error {
  constructor(message, service) {
    super(message);
    this.name = 'ServiceError';
    this.service = service;
    this.statusCode = 500;
  }
}

module.exports = {
  ValidationError,
  ProviderError,
  ServiceError
}; 