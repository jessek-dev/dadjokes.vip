// Updated api.js with better error handling and debugging
// Replace your current api.js with this version

class JokeAPI {
  constructor() {
    this.baseUrl = CONFIG.APPS_SCRIPT_URL;
    console.log('JokeAPI initialized with URL:', this.baseUrl);
  }

  async makeRequest(action, data = {}) {
    console.log('Making request:', action, data);
    
    try {
      let response;
      const isPostRequest = Object.keys(data).length > 0;
      
      if (isPostRequest) {
        // POST request for saving data
        const url = `${this.baseUrl}?action=${action}`;
        console.log('POST URL:', url);
        console.log('POST Data:', JSON.stringify(data));
        
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          mode: 'cors' // Add CORS mode
        });
      } else {
        // GET request for fetching data
        const url = `${this.baseUrl}?action=${action}`;
        console.log('GET URL:', url);
        
        response = await fetch(url, {
          method: 'GET',
          mode: 'cors' // Add CORS mode
        });
      }

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('Parsed result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown server error');
      }
      
      return result.data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        action: action,
        data: data
      });
      throw error;
    }
  }

  async getJokesForManagement() {
    return this.makeRequest('getJokesForManagement');
  }

  async saveJokeManagement(jokeData) {
    // Add validation before sending
    if (!jokeData.jokeId) {
      throw new Error('Missing joke ID');
    }
    if (!jokeData.category) {
      throw new Error('Missing category');
    }
    if (!jokeData.approval) {
      throw new Error('Missing approval status');
    }
    
    return this.makeRequest('saveJokeManagement', jokeData);
  }

  async getCategories() {
    return this.makeRequest('getCategories');
  }

  async testConnection() {
    return this.makeRequest('test');
  }
}

// Add a global function to test the API from browser console
window.testAPI = async function() {
  try {
    console.log('Testing API connection...');
    const api = new JokeAPI();
    
    console.log('1. Testing connection...');
    const testResult = await api.testConnection();
    console.log('Test result:', testResult);
    
    console.log('2. Testing get categories...');
    const categories = await api.getCategories();
    console.log('Categories:', categories);
    
    console.log('3. Testing get jokes...');
    const jokes = await api.getJokesForManagement();
    console.log('Jokes result:', jokes);
    
    if (jokes.jokes && jokes.jokes.length > 0) {
      console.log('4. Testing save joke...');
      const testSave = await api.saveJokeManagement({
        jokeId: jokes.jokes[0].id,
        category: 'Dad Jokes',
        secondary: '',
        rating: 3,
        approval: 'Approved',
        queue: 'Queued',
        notes: 'Test save from browser'
      });
      console.log('Save result:', testSave);
    }
    
    console.log('✅ All API tests passed!');
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
};

// Test the connection immediately when the file loads
console.log('API module loaded. Run testAPI() in console to debug.');
