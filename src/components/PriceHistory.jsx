import React from 'react';

const PriceHistory = ({ history }) => {
  // Sort history by timestamp in descending order (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Price History</h3>
      {sortedHistory.length === 0 ? (
        <p className="text-gray-500">No price history available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedHistory.map((record, index) => {
                // Calculate price change
                const prevRecord = sortedHistory[index + 1];
                const priceChange = prevRecord 
                  ? record.price - prevRecord.price
                  : 0;
                
                return (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      £{parseFloat(record.price).toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      priceChange === 0 
                        ? 'text-gray-500' 
                        : priceChange < 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                    }`}>
                      {priceChange === 0 
                        ? '-' 
                        : `${priceChange < 0 ? '-' : '+'}£${Math.abs(priceChange).toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PriceHistory;