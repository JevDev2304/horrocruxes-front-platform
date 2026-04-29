export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',

  cognito: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_VmpTThD7q',
    clientId: '1htoo8ovmebc0mr97q50lcit86',
    domain: 'https://YOUR_CORRECT_DOMAIN.auth.us-east-1.amazoncognito.com',

    redirectSignIn: 'http://localhost:4200',
    redirectSignOut: 'http://localhost:4200',
  },
} as const;
