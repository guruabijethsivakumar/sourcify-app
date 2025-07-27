document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (!orderId) {
        alert('No order specified.');
        window.location.href = '/my_orders.html';
        return;
    }

    document.getElementById('orderId').value = orderId;

    const reviewForm = document.getElementById('review-form');
    const statusP = document.getElementById('review-status');

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusP.textContent = '';
        const rating = document.getElementById('rating').value;
        const comment = document.getElementById('comment').value;

        if (!rating) {
            statusP.textContent = 'Please select a rating.';
            statusP.className = 'text-error';
            return;
        }

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, rating, comment })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to submit review');
            }
            statusP.textContent = 'Review submitted successfully!';
            statusP.className = 'text-success';
            reviewForm.reset();
            setTimeout(() => { window.location.href = '/my_orders.html'; }, 2000);

        } catch (err) {
            statusP.textContent = `Error: ${err.message}`;
            statusP.className = 'text-error';
        }
    });
});