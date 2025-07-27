document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Check if user is logged in. If not, redirect to login.
    if (!token || !user || !user.role) {
        // Clear any partial data and go to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }

    const dashboardTitle = document.getElementById('dashboard-title');
    const welcomeMessage = document.getElementById('welcome-message');
    const tabsContainer = document.querySelector('.tabs');
    const tabContentContainer = document.querySelector('.tab-content');

    // Make sure all required HTML elements exist before proceeding.
    if (!dashboardTitle || !welcomeMessage || !tabsContainer || !tabContentContainer) {
        console.error('Dashboard HTML is missing critical elements!');
        return;
    }

    welcomeMessage.innerHTML = `Welcome, <strong>${user.name}</strong> (${user.role}) <span class="user-icon"></span>`;

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // --- ROLE-BASED UI SETUP ---
    // Wrapped the setup in a try...catch to prevent a completely blank screen on error
    try {
        if (user.role === 'buyer') {
            setupBuyerDashboard();
        } else if (user.role === 'seller') {
            setupSellerDashboard();
        } else {
            tabContentContainer.innerHTML = `<p class="text-error">Unknown user role: ${user.role}</p>`;
        }
    } catch (error) {
        console.error("Failed to setup dashboard:", error);
        tabContentContainer.innerHTML = `<p class="text-error">An error occurred while loading the dashboard. Please try again later.</p>`;
    }
    
    // --- TAB SWITCHING LOGIC ---
    tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-link')) {
            document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            e.target.classList.add('active');
            const tabId = e.target.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        }
    });

    // --- BUYER FUNCTIONS ---
    function setupBuyerDashboard() {
        dashboardTitle.textContent = 'Buyer Dashboard';
        tabsContainer.innerHTML = `
            <button class="tab-link active" data-tab="overview">Overview</button>
            <button class="tab-link" data-tab="my-orders">My Orders</button>
            <button class="tab-link" data-tab="post-requirement">Post New Requirement</button>
        `;
        tabContentContainer.innerHTML = `
            <div id="overview" class="tab-pane active"><div class="loading-state">Loading Overview...</div></div>
            <div id="my-orders" class="tab-pane"><p>View your past orders and their status.</p><a href="/my_orders.html" class="btn">View My Orders</a></div>
            <div id="post-requirement" class="tab-pane"></div>
        `;
        loadBuyerOverview();
        loadPostRequirementForm();
    }
    
    async function loadBuyerOverview() {
        const overviewContainer = document.getElementById('overview');
        try {
            const res = await fetch('/api/orders/buyer-stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Could not fetch stats.');
            }
            const stats = await res.json();

            overviewContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalOrders ?? 0}</div>
                        <div class="stat-label">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.pendingPayment ?? 0}</div>
                        <div class="stat-label">Pending Payment</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">₹${(stats.outstandingFines ?? 0).toFixed(2)}</div>
                        <div class="stat-label">Outstanding Fines</div>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error("Error loading buyer overview:", err);
            overviewContainer.innerHTML = `<p class="text-error">Could not load stats: ${err.message}</p>`;
        }
    }

    function loadPostRequirementForm() {
        const container = document.getElementById('post-requirement');
        // ... (The rest of this function is likely fine, but the above changes are key)
        container.innerHTML = `
             <div class="card">
                <h2>Post a New Requirement</h2>
                <form id="create-auction-form">
                    <div class="form-group"><label for="title">Title</label><input type="text" id="title" required></div>
                    <div class="form-group"><label for="products">Products (e.g., "Tomato 50 kg")</label><textarea id="products" rows="4" required></textarea></div>
                    <div class="form-group"><label for="hours">Auction Duration (hours)</label><input type="number" id="hours" value="24" min="1" required></div>
                    <div class="form-group"><label for="startPrice">Starting Price per Unit (₹)</label><input type="number" id="startPrice" required></div>
                    <div class="form-group"><label>Location (Optional)</label><input type="text" id="lat" placeholder="Latitude"><input type="text" id="lng" placeholder="Longitude"></div>
                    <button type="submit" class="btn">Post Requirement</button>
                </form>
            </div>
        `;
        document.getElementById('create-auction-form').addEventListener('submit', handleCreateAuction);
    }
    
    // --- SELLER FUNCTIONS ---
    function setupSellerDashboard() {
        dashboardTitle.textContent = 'Seller Dashboard';
        tabsContainer.innerHTML = `
            <button class="tab-link active" data-tab="open-requirements">Open Requirements</button>
            <button class="tab-link" data-tab="my-orders">My Won Bids</button>
        `;
        tabContentContainer.innerHTML = `
            <div id="open-requirements" class="tab-pane active">
                <h2>Open Requirements Map</h2>
                <div id="map"></div>
                <h2>Open Requirements List</h2>
                <div id="auction-list"><div class="loading-state">Loading requirements...</div></div>
            </div>
            <div id="my-orders" class="tab-pane"><p>View the auctions you have won.</p><a href="/my_orders.html" class="btn">View My Orders</a></div>
        `;
        loadSellerAuctions();
    }

    async function loadSellerAuctions() {
        // ... (This function is likely fine, but the robust setup protects it)
        const map = L.map('map').setView([12.9716, 77.5946], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        const auctionList = document.getElementById('auction-list');
        try {
             const res = await fetch('/api/auctions');
             const auctions = await res.json();
             auctionList.innerHTML = ''; 
             auctions.forEach(auction => {
                const auctionCard = document.createElement('div');
                auctionCard.className = 'card';
                auctionCard.innerHTML = `<h3>${auction.title}</h3><p>Current Price: <span class="bid-price">₹${auction.currentPrice.toFixed(2)}</span></p><a href="auction.html?id=${auction._id}" class="btn">View & Bid</a>`;
                auctionList.appendChild(auctionCard);
                if (auction.location && auction.location.lat) {
                    L.marker([auction.location.lat, auction.location.lng]).addTo(map).bindPopup(`<b>${auction.title}</b>`);
                }
             });
        } catch(err) {
             auctionList.innerHTML = `<p class="text-error">Could not load auctions.</p>`;
        }
    }
    
    // Other functions like handleCreateAuction remain here...
    async function handleCreateAuction(e) {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const productsRaw = document.getElementById('products').value;
        const hours = document.getElementById('hours').value;
        const startPrice = document.getElementById('startPrice').value;
        const products = productsRaw.split('\n').filter(Boolean).map(line => ({ name: line, quantity: 'N/A' })); // Simplified parsing for robustness
        try {
            const res = await fetch('/api/auctions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, products, hours, startPrice, lat: document.getElementById('lat').value, lng: document.getElementById('lng').value })
            });
            if (!res.ok) {
                const errorData = await res.json(); throw new Error(errorData.message);
            }
            alert('Requirement posted!');
            e.target.reset();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }
});