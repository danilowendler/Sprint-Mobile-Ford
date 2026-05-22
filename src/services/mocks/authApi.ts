export type UserRole = 'client' | 'analyst';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
  isAnalyst?: boolean;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

const delay = (min = 400, max = 700) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min)) + min),
  );

const makeToken = () =>
  `mock.${Math.random().toString(36).slice(2)}.${Date.now().toString(36)}`;

const deriveNameFromEmail = (email: string) => {
  const local = email.split('@')[0] ?? 'Motorista';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  await delay();
  if (!payload.email || !payload.password) {
    throw new Error('Credenciais inválidas.');
  }
  return {
    token: makeToken(),
    user: {
      id: `usr_${payload.email}`,
      name: deriveNameFromEmail(payload.email),
      email: payload.email,
      role: payload.isAnalyst ? 'analyst' : 'client',
    },
  };
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  await delay(500, 800);
  return {
    token: makeToken(),
    user: {
      id: `usr_${payload.email}`,
      name: payload.name,
      email: payload.email,
      role: 'client',
    },
  };
}

export async function requestPasswordReset(
  payload: ForgotPasswordPayload,
): Promise<{ ok: true; sentTo: string }> {
  await delay(300, 600);
  return { ok: true, sentTo: payload.email };
}
