import React from 'react';

interface BidFormProps {
  bidAmount: string;
  setBidAmount: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  minBid?: number;
}

const BidForm: React.FC<BidFormProps> = ({ 
  bidAmount, 
  setBidAmount, 
  onSubmit, 
  minBid 
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setBidAmount(value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Place Your Bid</h3>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Bid Amount (GHS)
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₵</span>
            </div>
            <input
              type="text"
              id="bidAmount"
              value={bidAmount}
              onChange={handleAmountChange}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md"
              placeholder="0.00"
              aria-describedby="price-currency"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm" id="price-currency">
                GHS
              </span>
            </div>
          </div>
          {minBid && (
            <p className="mt-1 text-sm text-gray-500">
              Minimum suggested bid: ₵{minBid.toFixed(2)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!bidAmount || isNaN(parseFloat(bidAmount))}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !bidAmount || isNaN(parseFloat(bidAmount))
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          Submit Bid
        </button>
      </form>
    </div>
  );
};

export default BidForm;