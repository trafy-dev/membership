const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

// ── Auth ──

export async function signup(formData: FormData) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.json();
}

export async function getSession() {
  const res = await fetch(`${API_BASE}/auth/session`, {
    credentials: 'include',
  });
  return res.json();
}

// ── Member ──

export async function getProfile() {
  const res = await fetch(`${API_BASE}/member/profile`, {
    credentials: 'include',
  });
  return res.json();
}

export async function updateProfile(data: Record<string, string>) {
  const res = await fetch(`${API_BASE}/member/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return res.json();
}

export async function updateProfilePicture(formData: FormData) {
  const res = await fetch(`${API_BASE}/member/profile-picture`, {
    method: 'PUT',
    body: formData,
    credentials: 'include',
  });
  return res.json();
}

export async function downloadIdCard() {
  const res = await fetch(`${API_BASE}/member/id-card`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to download ID card');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Membership-ID-Card.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function changePassword(current_password: string, new_password: string) {
  const res = await fetch(`${API_BASE}/member/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password, new_password }),
    credentials: 'include',
  });
  return res.json();
}
