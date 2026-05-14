describe('Health', () => {
  let token: string | null;

  beforeAll(async () => {
    // Create a test user (ignore error if already exists)
    await fetch('http://auth:3001/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test2@example.com',
        password: 'Test123!@#',
      }),
    });

    // Login to get authentication token
    const loginResponse = await fetch('http://auth:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test2@example.com',
        password: 'Test123!@#',
      }),
      credentials: 'include',
    });

    const setCookie = loginResponse.headers.get('set-cookie');

    // Extract just "Authentication=<jwt>" from the set-cookie header
    token = setCookie?.split(';')[0] ?? '';
  });

  afterAll(async () => {
    await fetch('http://auth:3001/user', {
      method: 'DELETE',
      headers: {
        Cookie: token,
      },
    });
  });

  it('should return 200', async () => {
    const response = await fetch('http://reservations:3000/health');
    expect(response.status).toBe(200);
  });

  it('should return reservations', async () => {
    const response = await fetch('http://reservations:3000/reservations', {
      headers: {
        Cookie: token,
      },
    });
    expect(response.status).toBe(200);
  });
});
