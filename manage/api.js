// File: /manage/api.js
class JokeAPI {
  constructor() {
    this.baseUrl = CONFIG.APPS_SCRIPT_URL;
  }

  async makeRequest(action, data = {}) {
    const url = `${this.baseUrl}?action=${action}`;
    
    try {
      let response;
      
      if (Object.keys(data).length > 0) {
        // POST request for saving data
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      } else {
        // GET request for fetching data
        response = await fetch(url, {
          method: 'GET'
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }
      
      return result.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getJokesForManagement() {
    return this.makeRequest('getJokesForManagement');
  }

  async saveJokeManagement(jokeData) {
    return this.makeRequest('saveJokeManagement', jokeData);
  }

  async getCategories() {
    return this.makeRequest('getCategories');
  }

  async testConnection() {
    return this.makeRequest('test');
  }
}
