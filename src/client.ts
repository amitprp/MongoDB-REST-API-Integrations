

// CONSTANTS
const PORT = 3000
const HOST = '0.0.0.0'

async function fetchHello(name: string) {
    try {
        const response: Response = await fetch(`http://${HOST}:${PORT}/hello?name=World`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response:', data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
}

async function fetchError() {
  try {
      const response: Response = await fetch(`http://${HOST}:${PORT}/error`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
}



// fetchHello('Amit');
fetchError()