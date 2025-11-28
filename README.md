# Servicio de Redirección por Código (URL Shortener)

- Este servicio recibe un código vía URL y valida si existe un registro asociado en DynamoDB.
Si existe, el servicio redirecciona al usuario hacia la URL original mediante un HTTP 302.
Si no existe, retorna un error apropiado.

# Tecnologías utilizadas

- AWS Lambda → Lógica del redireccionamiento

- API Gateway → Exponer el endpoint GET /{codigo}

- DynamoDB (tabla compartida) → Almacena codigo → url_original

- Terraform → Infraestructura IaC para Lambda + API Gateway

- GitHub Actions → CI/CD para despliegue automático

# Estructura del proyecto
app/
├── src/
│   ├── databases/
│   │   └── dynamodb.ts
│   ├── handlers/
│   │   └── redirect-url-lambda.ts
│   └── index.ts (opcional)
│
└── terraform/
    ├── main.tf
    ├── providers.tf
    ├── variables.tf
    ├── backend.tf
    └── data.tf
