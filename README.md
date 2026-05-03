# 🧙‍♂️ Horrocruxes

Harry Potter themed chat app. Talk with iconic HP characters powered by a multi-agent AI system.

---

## ✨ Features

* 🧠 **Character Chat** — conversations with Dumbledore, Hermione, Ron, Snape, or Luna, each with unique personality and tone
* 🧩 **HP Quiz** — 9-question personality test to discover your matching character
* 🔐 **Authentication** — secure login/registration via AWS Cognito

---

## 🛠 Tech Stack

* Angular 19
* Tailwind CSS
* Lucide Icons
* Amazon Cognito (authentication)

---

## 🚀 Getting Started

```bash
npm install

cp src/environments/environment.example.ts src/environments/environment.ts
# Fill in your Cognito credentials in environment.ts

npm start
# → http://localhost:4200
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


