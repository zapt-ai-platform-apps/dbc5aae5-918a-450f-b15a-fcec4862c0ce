import React, { useState, useEffect } from 'react';
import PriceHistory from './PriceHistory';
import * as Sentry from '@sentry/browser';

const PriceTracker = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [checking, setChecking] = useState(false);

  // The URL from the user's request
  const vehicleUrl = "https://www.easternwestern.co.uk/smart/used-vehicles/19174395-smart-hashtag%201-66kwh%20pro+%20auto%205dr/";

  useEffect(() => {
    // Check the price on component mount
    checkPrice();
  }, []);

  const checkPrice = async () => {
    if (checking) return;
    
    setChecking(true);
    setError(null);
    
    try {
      setLoading(true);
      console.log('Checking price for vehicle:', vehicleUrl);
      
      const response = await fetch('/api/checkPrice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: vehicleUrl }),
      });

      if (!response.ok) {
        throw new Error(`Failed to check price: ${response.status}`);
      }

      const data = await response.json();
      console.log('Price check result:', data);
      setPriceData(data);
      
      // If price decreased, show notification
      if (data.priceDecreased) {
        // Show browser notification if supported and permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Smart #1 Price Decreased!', {
            body: `The price has decreased from £${data.previousPrice.toLocaleString()} to £${data.currentPrice.toLocaleString()}`,
            icon: 'https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=128&height=128'
          });
        }
      }
    } catch (error) {
      console.error('Error checking price:', error);
      Sentry.captureException(error);
      setError('Failed to check the price. Please try again later.');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="mb-4">
        <a href={vehicleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-words text-sm">
          {vehicleUrl}
        </a>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-4">
          <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Checking price...</span>
        </div>
      ) : (
        priceData && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Current Price:</span>
              <span className="text-lg font-bold text-gray-900">£{priceData.currentPrice.toLocaleString()}</span>
            </div>
            
            {priceData.priceDecreased && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-2">
                <span className="block sm:inline">
                  Price decreased from £{priceData.previousPrice.toLocaleString()} to £{priceData.currentPrice.toLocaleString()}!
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Initial Price:</span>
              <span className="text-gray-900">£{priceData.vehicle.initialPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Last Checked:</span>
              <span className="text-gray-900">{new Date(priceData.vehicle.lastChecked).toLocaleString()}</span>
            </div>
          </div>
        )
      )}

      <button
        onClick={checkPrice}
        disabled={checking}
        className={`w-full px-4 py-2 rounded cursor-pointer font-medium ${
          checking ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {checking ? 'Checking...' : 'Check Price Now'}
      </button>

      {priceData?.history && priceData.history.length > 0 && (
        <PriceHistory history={priceData.history} />
      )}
    </div>
  );
};

export default PriceTracker;