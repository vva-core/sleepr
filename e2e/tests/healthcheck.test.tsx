import { createUser, loginUser, deleteUser } from './helpers/auth';

describe('Health', () => {
  let token: string;

  beforeAll(async () => {
    await createUser('test2@example.com', 'Test123!@#');
    token = await loginUser('test2@example.com', 'Test123!@#');
  });

  afterAll(async () => {
    await deleteUser(token);
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
