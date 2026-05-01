# 🧙‍♂️ Horrocruxes

Harry Potter themed chat app. Talk with iconic HP characters powered by a multi-agent AI system.

---

## ✨ Features

* 🧠 **Character Chat** — conversations with Dumbledore, Hermione, Ron, Snape, or Luna, each with unique personality and tone
* 🧩 **HP Quiz** — 9-question personality test to discover your matching character
* 🔐 **Authentication** — secure login/registration via AWS Cognito
* ☁️ **Cloud Deployment** — frontend hosted on AWS (S3 + CloudFront)
* ⚙️ **CI/CD Pipeline** — automated build & deploy using GitHub Actions

---

## 🛠 Tech Stack

* Angular 19
* Tailwind CSS
* Lucide Icons
* Amazon Cognito (authentication)
* Amazon S3 + Amazon CloudFront (hosting)
* GitHub Actions (CI/CD)

---

## 🚀 Getting Started

```bash
npm install

cp src/environments/environment.example.ts src/environments/environment.ts
# Fill in your Cognito credentials in environment.ts

npm start
```

App will be available at:

```bash
http://localhost:4200
```

---

## 🔐 Environment Configuration

Edit:

```bash
src/environments/environment.ts
```

Example:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',

  cognito: {
    region: 'us-east-1',
    userPoolId: 'YOUR_USER_POOL_ID',
    clientId: 'YOUR_CLIENT_ID',
    domain: 'https://your-domain.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'http://localhost:4200',
    redirectSignOut: 'http://localhost:4200',
  },
};
```

---

## ⚙️ CI/CD with GitHub Actions

This project includes a deployment pipeline that:

1. Installs dependencies
2. Builds the Angular app
3. Uploads static files to S3
4. Invalidates CloudFront cache

### 🔑 Requirements

* AWS IAM Role (recommended via OIDC)
* S3 bucket configured for hosting
* CloudFront distribution
* GitHub repository secrets or OIDC role configured

### 📦 Workflow Overview

```yaml
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    steps:
      - build Angular app
      - upload to S3
      - invalidate CloudFront
```

---

## 🌐 Deployment Architecture

```text
GitHub → GitHub Actions → S3 → CloudFront → Users
```

Optional backend:

```text
Angular → /api → ALB → ECS Fargate
```

---

## 🧪 Troubleshooting

### ❌ Angular build fails (environment not found)

```bash
Could not resolve environments/environment
```

**Fix:**

* Ensure files exist:

  ```bash
  src/environments/environment.ts
  src/environments/environment.prod.ts
  ```
* Commit them to the repo

---

### ❌ AWS credentials error (GitHub Actions)

```bash
Credentials could not be loaded
Did you mean to set the id-token permission?
```

**Fix (OIDC):**

```yaml
permissions:
  id-token: write
  contents: read
```

---

### ❌ Cognito login redirect fails

**Check:**

* Callback URLs match exactly:

  ```bash
  http://localhost:4200
  https://your-domain.com
  ```
* Domain is correct:

  ```bash
  https://<your-domain>.auth.us-east-1.amazoncognito.com
  ```

---

### ❌ Angular routes return 404 on refresh

**Fix CloudFront:**

* Add custom error responses:

  * 403 → `/index.html`
  * 404 → `/index.html`

---

### ❌ API calls fail in production

**Check:**

* `apiUrl` in `environment.prod.ts`
* CORS settings in backend
* Use `/api` path with CloudFront routing if possible

---

## 📌 Future Improvements

* Environment variable injection at runtime
* Multi-environment deployments (dev/staging/prod)
* JWT validation in backend (Fargate)
* Observability (logs + metrics)

---

## 🤝 Contributing

PRs and issues are welcome!
Feel free to suggest improvements or report bugs.

---

## ⚡ License

MIT

