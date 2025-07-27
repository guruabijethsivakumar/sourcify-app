document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) {
        window.location.href = '/login.html';
        return;
    }

    const ordersListDiv = document.getElementById('orders-list');

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders/my-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch orders.');
            const orders = await res.json();
            
            ordersListDiv.innerHTML = '';
            if (orders.length === 0) {
                ordersListDiv.innerHTML = '<p class="text-center">You have no orders yet.</p>';
                return;
            }
            
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Auction Title</th>
                        <th>Role</th>
                        <th>Counterparty</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            const tbody = table.querySelector('tbody');

            orders.forEach(order => {
                const isBuyer = order.buyer._id === user._id;
                const role = isBuyer ? 'Buyer' : 'Seller';
                const counterparty = isBuyer ? order.seller.name : order.buyer.name;

                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${order.auction.title}</td>
                    <td>${role}</td>
                    <td>${counterparty}</td>
                    <td>₹${order.amount.toFixed(2)}</td>
                    <td><span class="status-badge status-${order.status}">${order.status.replace('_', ' ')}</span></td>
                    <td class="action-cell"></td>
                `;

                // Add a "Give Review" button for buyers on delivered orders
                if (isBuyer && order.status === 'delivered') {
                    const actionCell = row.querySelector('.action-cell');
                    actionCell.innerHTML = `<a href="/give_review.html?orderId=${order._id}" class="btn btn-small">Give Review</a>`;
                }
            });
            ordersListDiv.appendChild(table);

        } catch (err) {
            ordersListDiv.innerHTML = `<p class="text-error text-center">${err.message}</p>`;
        }
    };

    fetchOrders();
});