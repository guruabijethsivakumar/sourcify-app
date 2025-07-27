document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Protect this page
    if (!token || !user || user.role !== 'admin') {
        alert('Access Denied. You are not an admin.');
        window.location.href = '/login.html';
        return;
    }

    const statsContainer = document.getElementById('stats-container');
    const usersTableBody = document.querySelector('#users-table tbody');

    const fetchStats = async () => {
        const res = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await res.json();
        statsContainer.innerHTML = `
            <p><strong>Total Users:</strong> ${stats.userCount}</p>
            <p><strong>Total Orders:</strong> ${stats.orderCount}</p>
            <p><strong>Open Auctions:</strong> ${stats.openAuctions}</p>
        `;
    };

    const fetchUsers = async () => {
        const res = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();
        usersTableBody.innerHTML = '';
        users.forEach(u => {
            const row = usersTableBody.insertRow();
            row.innerHTML = `
                <td>${u.name}</td>
                <td>${u.phoneNumber}</td>
                <td>${u.role}</td>
                <td>${u.rating ? u.rating.toFixed(1) : 'N/A'}</td>
            `;
        });
    };
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    fetchStats();
    fetchUsers();
});