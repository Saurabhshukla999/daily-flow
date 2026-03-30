const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-url.vercel.app' 
  : 'http://localhost:3001';

export async function query(text: string, params?: any[]) {
  // This is a simplified version - in production, you'd map SQL to REST API calls
  console.log('Query would be executed:', text, params);
  throw new Error('Direct database queries not supported in browser. Use API endpoints instead.');
}

// API client functions
export const api = {
  // Auth
  async signup(email: string, password: string) {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  // Tasks
  async getTasks(token: string) {
    const response = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async createTask(token: string, task: any) {
    const response = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(task)
    });
    return response.json();
  },

  async updateTask(token: string, id: string, updates: any) {
    const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  async deleteTask(token: string, id: string) {
    const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Logs
  async getLogs(token: string, date: string) {
    const response = await fetch(`${API_BASE}/api/logs?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async upsertLog(token: string, log: any) {
    const response = await fetch(`${API_BASE}/api/logs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(log)
    });
    return response.json();
  }
};
