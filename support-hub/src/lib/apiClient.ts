const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Gestion du token
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('access_token');
};

// Client API avec gestion automatique du token
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré ou invalide
        removeToken();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    // Si la réponse est vide (204 No Content), retourner null
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error: any) {
    // Si c'est une erreur réseau (Failed to fetch)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur ${API_BASE_URL}`);
    }
    throw error;
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

// Pour les formulaires (application/x-www-form-urlencoded)
export async function apiFormRequest<T>(
  endpoint: string,
  formData: URLSearchParams
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] POST ${url}`);
    console.log(`[API] Headers:`, headers);
    console.log(`[API] Body:`, formData.toString());
    
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include', // Inclure les credentials pour correspondre à allow_credentials=True
      headers,
      body: formData,
    });

    console.log(`[API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
        console.error('[API] Error response:', error);
      } catch (e) {
        // Si la réponse n'est pas du JSON, utiliser le texte
        try {
          const text = await response.text();
          console.error('[API] Error text:', text);
        } catch (e2) {
          // Ignorer
        }
      }
      
      if (response.status === 401) {
        removeToken();
        throw new Error(errorMessage || 'Nom d\'utilisateur ou mot de passe incorrect');
      }
      throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Success response:', data);
    return data;
  } catch (error: any) {
    console.error('[API] Request error:', error);
    // Si c'est une erreur réseau (Failed to fetch)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError' || error.message.includes('CORS')) {
      throw new Error(`Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur ${API_BASE_URL}`);
    }
    throw error;
  }
}

