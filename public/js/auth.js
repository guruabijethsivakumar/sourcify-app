document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // If on a page with a login form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phoneNumber = document.getElementById('phoneNumber').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber, password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = 'dashboard.html'; // Redirect to new dashboard

            } catch (err) {
                alert('Login failed: ' + err.message);
            }
        });
    }

    // If on a page with a registration form
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            const communityId = document.getElementById('community').value;

            const requestBody = { name, phoneNumber, password, role };
            if (role === 'buyer' && communityId) {
                requestBody.communityId = communityId;
            }

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = 'dashboard.html'; // Redirect to new dashboard

            } catch (err) {
                alert('Registration failed: ' + err.message);
            }
        });
        
        const roleSelect = document.getElementById('role');
        const communityGroup = document.getElementById('community-group');
        const communitySelect = document.getElementById('community');

        const fetchCommunities = async () => {
            try {
                const res = await fetch('/api/communities');
                if (!res.ok) throw new Error('Could not fetch business types');
                const communities = await res.json();
                communitySelect.innerHTML = '<option value="">-- Select your business type --</option>';
                communities.forEach(c => {
                    communitySelect.innerHTML += `<option value="${c._id}">${c.name}</option>`;
                });
            } catch (err) {
                communitySelect.innerHTML = `<option value="">${err.message}</option>`;
            }
        };

        roleSelect.addEventListener('change', () => {
            if (roleSelect.value === 'buyer') {
                communityGroup.style.display = 'block';
                fetchCommunities();
            } else {
                communityGroup.style.display = 'none';
            }
        });
    }
});