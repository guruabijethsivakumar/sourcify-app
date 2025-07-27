document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) {
        window.location.href = '/login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const auctionId = params.get('id');
    if (!auctionId) {
        window.location.href = '/index.html';
        return;
    }

    const auctionDetailsDiv = document.getElementById('auction-details');
    const bidList = document.getElementById('bid-list');
    const sellerSection = document.getElementById('seller-section');
    const currentPriceSpan = document.getElementById('current-price');
    const decrementBidBtn = document.getElementById('decrement-bid-btn');
    const bidErrorP = document.getElementById('bid-error');

    const renderBids = (bids) => {
        bidList.innerHTML = '';
        if (bids.length === 0) {
            bidList.innerHTML = '<li>No bids yet. Be the first!</li>';
            return;
        }
        bids.forEach(bid => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${bid.sellerName}</span> <span class="bid-price">₹${bid.price.toFixed(2)}</span>`;
            bidList.appendChild(li);
        });
    };

    const fetchAuctionDetails = async () => {
        const res = await fetch(`/api/auctions/${auctionId}`);
        const auction = await res.json();

        auctionDetailsDiv.innerHTML = `
            <h1>${auction.title}</h1>
            <p>Posted by: ${auction.postedBy.name}</p>
            <h4>Required Products:</h4>
            <ul>
                ${auction.products.map(p => `<li>${p.quantity} ${p.name}</li>`).join('')}
            </ul>
        `;
        renderBids(auction.bids);
    };

    fetchAuctionDetails();

    // Show bidding form only for sellers
    if (user.role === 'seller') {
        sellerSection.classList.remove('hidden');
    }

    // --- REAL-TIME BIDDING WITH SOCKET.IO ---
    const socket = io();
    socket.emit('join_auction_room', auctionId);
    socket.on('bid_update', (data) => {
        console.log('Received bid update:', data);
        currentPriceSpan.textContent = `₹${data.currentPrice.toFixed(2)}`;
        renderBids(data.bids);
        bidErrorP.textContent = ''; // Clear any previous error
    });

     decrementBidBtn.addEventListener('click', async () => {
        bidErrorP.textContent = ''; // Clear previous errors
        decrementBidBtn.disabled = true; // Prevent double-clicking

        try {
            const res = await fetch(`/api/auctions/${auctionId}/decrement-bid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to place bid');
            }
            // SUCCESS! No need to do anything else.
            // The socket 'bid_update' event from the server will update the UI for everyone.
        } catch(err) {
            bidErrorP.textContent = 'Error: ' + err.message;
        } finally {
            // Re-enable the button after a short delay
            setTimeout(() => { decrementBidBtn.disabled = false; }, 1500);
        }
    });
    
    // // --- HANDLE BID FORM SUBMISSION ---
    // bidForm.addEventListener('submit', async (e) => {
    //     e.preventDefault();
    //     const price = document.getElementById('price').value;
    //     try {
    //         const res = await fetch(`/api/auctions/${auctionId}/bids`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: JSON.stringify({ price })
    //         });
    //         if (!res.ok) {
    //             const errorData = await res.json();
    //             throw new Error(errorData.message || 'Failed to place bid');
    //         }
    //         document.getElementById('price').value = ''; // Clear input on success
    //     } catch(err) {
    //         alert('Error placing bid: ' + err.message);
    //     }
    // });
});