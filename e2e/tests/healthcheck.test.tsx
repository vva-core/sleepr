describe('Health', () => {
  let token: string;

  beforeAll(async () => {
    // Create a test user
    const result = await fetch('http://auth:3001/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test2@example.com',
        password: 'Test123!@#',
      }),
    });

    console.log('User creation response status:', result);

    // Login to get authentication token
    const loginResponse = await fetch('http://auth:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123!@#',
      }),
      credentials: 'include',
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    token = loginData.token;
  });

  it('should return 200', async () => {
    const response = await fetch('http://reservations:3000/health');
    expect(response.status).toBe(200);
  });

  it('should return reservations', async () => {
    console.log('Using token:', token);

    const response = await fetch('http://reservations:3000/reservations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.status).toBe(200);
  });
});
