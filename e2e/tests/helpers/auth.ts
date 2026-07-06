const AUTH_URL = 'http://gateway:3003';

export async function createUser(
  email: string,
  password: string,
): Promise<void> {
  await fetch(`${AUTH_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(
  email: string,
  password: string,
): Promise<string> {
  const response = await fetch(`${AUTH_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  const setCookie = response.headers.get('set-cookie');
  return setCookie?.split(';')[0] ?? '';
}

export async function deleteUser(token: string): Promise<void> {
  await fetch(`${AUTH_URL}/user`, {
    method: 'DELETE',
    headers: { Cookie: token },
  });
}
