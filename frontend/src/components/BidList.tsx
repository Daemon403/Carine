import React from 'react';

interface Bid {
  id: string;
  artisanId: string;
  amount: number;
  accepted: boolean;
  createdAt: string;
  artisanName?: string;
  artisanRating?: number;
}

interface BidListProps {
  bids: Bid[];
  currentUserId?: string;
  onAcceptBid?: (bidId: string) => void;
}

const BidList: React.FC<BidListProps> = ({ bids, currentUserId, onAcceptBid }) => {
  const sortedBids = [...bids].sort((a, b) => {
    if (a.amount !== b.amount) {
      return a.amount - b.amount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {sortedBids.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No bids have been placed yet</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sortedBids.map((bid) => (
            <li key={bid.id} className="py-4">
              <div className={`flex justify-between items-start ${bid.accepted ? 'bg-green-50 p-3 rounded-lg' : ''}`}>
                <div>
                  <div className="flex items-center">
                    <p className="text-lg font-medium text-gray-900">
                      ₵{bid.amount.toFixed(2)}
                    </p>
                    {bid.accepted && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Accepted
                      </span>
                    )}
                    {bid.artisanId === currentUserId && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Your Bid
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-500">
                    {bid.artisanName ? (
                      <span>
                        By {bid.artisanName}
                        {bid.artisanRating && (
                          <span className="ml-1">
                            ★ {bid.artisanRating.toFixed(1)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span>By Artisan #{bid.artisanId.slice(0, 6)}</span>
                    )}
                  </div>
                  
                  <p className="mt-1 text-xs text-gray-400">
                    Placed on {formatDate(bid.createdAt)}
                  </p>
                </div>
                
                {onAcceptBid && !bid.accepted && (
                  <button
                    onClick={() => onAcceptBid(bid.id)}
                    className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Accept
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BidList;