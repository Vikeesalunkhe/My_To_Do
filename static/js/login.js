        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.querySelector('.password-toggle');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                toggleIcon.textContent = '👁️';
            }
        }

        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const container = document.querySelector('.login-container');
            
            // Clear previous errors
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error');
            });
            
            let hasError = false;
            
            // Validate username
            if (!username || username.length < 3) {
                document.querySelector('#username').parentElement.classList.add('error');
                hasError = true;
            }
            
            // Validate password
            if (!password || password.length < 6) {
                document.querySelector('#password').parentElement.classList.add('error');
                hasError = true;
            }
            
            if (hasError) {
                container.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    container.style.animation = '';
                }, 500);
                return;
            }
            
            // Simulate loading
            container.classList.add('loading');
            document.querySelector('.signin-btn').textContent = 'Signing In...';
            
            // Simulate API call
            setTimeout(() => {
                container.classList.remove('loading');
                document.querySelector('.signin-btn').textContent = 'Sign In';
            }, 2000);
        });

        // Add shake animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);

        // Add floating animation to background
        document.body.style.backgroundImage = `
            linear-gradient(135deg, #667eea 0%, #764ba2 100%),
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)
        `;