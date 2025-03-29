import Sentry from './_sentry.js';

export const captureError = (error, extra = {}) => {
  console.error(error);
  Sentry.captureException(error, { extra });
};

export async function fetchCarData(url) {
  try {
    console.log(`Fetching car data from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch car data: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Find price in the HTML
    // This regex looks for price patterns like £24,995 or £24995
    const priceMatch = html.match(/£([\d,]+)/);
    if (priceMatch && priceMatch[1]) {
      const price = parseFloat(priceMatch[1].replace(/,/g, ''));
      console.log(`Successfully found price: £${price}`);
      return { price, html };
    }
    
    throw new Error('Price not found in the webpage');
  } catch (error) {
    captureError(error, { url });
    throw error;
  }
}