const API_BASE = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? window.location.origin : 'http://localhost:3001'
);

function getAuthToken(): string {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('User not authenticated');
  return token;
}

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  return data;
}

export async function query(text: string, params?: any[]) {
  const sql = text.replace(/\s+/g, ' ').trim().toLowerCase();
  const token = getAuthToken();

  if (sql.includes('select * from tasks') && sql.includes('is_active = true')) {
    const rows = await api.getTasks(token);
    return { rows: Array.isArray(rows) ? rows : [] };
  }

  if (sql.startsWith('insert into tasks')) {
    const [task] = await Promise.all([
      api.createTask(token, {
        text: params?.[0],
        hours_per_day: params?.[1],
        days: params?.[2],
        end_date: params?.[3],
      })
    ]);
    return { rows: [task] };
  }

  if (sql.startsWith('update tasks set') && sql.includes('where id = $1 returning *')) {
    const taskId = params?.[0];
    const keys = [...text.matchAll(/([a-z_]+)\s*=\s*\$\d+/gi)].map((m) => m[1]);
    const values = params?.slice(1) ?? [];
    const updates = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
    const updated = await api.updateTask(token, taskId, updates);
    return { rows: [updated] };
  }

  if (sql.startsWith('update tasks set is_active = false where id = $1')) {
    await api.deleteTask(token, params?.[0]);
    return { rows: [] };
  }

  if (sql.includes('select * from daily_logs') && sql.includes('and date = $2')) {
    const rows = await api.getLogs(token, params?.[1]);
    return { rows: Array.isArray(rows) ? rows : [] };
  }

  if (sql.includes('select * from daily_logs') && sql.includes('date >= $2 and date <= $3')) {
    const rows = await api.getLogsRange(token, params?.[1], params?.[2]);
    return { rows: Array.isArray(rows) ? rows : [] };
  }

  if (sql.startsWith('insert into daily_logs')) {
    const log = await api.upsertLog(token, {
      task_id: params?.[1],
      date: params?.[2],
      checked: params?.[3],
      hours_logged: params?.[4],
    });
    return { rows: [log] };
  }

  if (sql.startsWith('update daily_logs set checked = false where user_id = $1 and date = $2')) {
    await api.resetLogsForDate(token, params?.[1]);
    return { rows: [] };
  }

  throw new Error(`Unsupported query mapping: ${text}`);
}

// API client functions
export const api = {
  // Auth
  async signup(email: string, password: string) {
    return request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  async login(email: string, password: string) {
    return request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  // Tasks
  async getTasks(token: string) {
    return request('/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  async createTask(token: string, task: any) {
    return request('/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(task)
    });
  },

  async updateTask(token: string, id: string, updates: any) {
    return request(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
  },

  async deleteTask(token: string, id: string) {
    return request(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Logs
  async getLogs(token: string, date: string) {
    return request(`/api/logs?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  async getLogsRange(token: string, start: string, end: string) {
    return request(`/api/logs/range?start=${start}&end=${end}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  async upsertLog(token: string, log: any) {
    return request('/api/logs', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(log)
    });
  },

  async resetLogsForDate(token: string, date: string) {
    return request('/api/logs/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ date })
    });
  },
};
