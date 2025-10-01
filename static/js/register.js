        // Password visibility toggle
        function togglePassword(fieldId) {
            const passwordInput = document.getElementById(fieldId);
            const toggleIcon = passwordInput.nextElementSibling;
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                toggleIcon.textContent = '👁️';
            }
        }

        // Password strength checker
        function checkPasswordStrength(password) {
            let strength = 0;
            let feedback = '';
            
            if (password.length >= 8) strength += 1;
            if (password.match(/[a-z]/)) strength += 1;
            if (password.match(/[A-Z]/)) strength += 1;
            if (password.match(/[0-9]/)) strength += 1;
            if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
            
            const strengthFill = document.getElementById('strengthFill');
            const strengthText = document.getElementById('strengthText');
            
            switch (strength) {
                case 0:
                case 1:
                    strengthFill.className = 'strength-fill strength-weak';
                    feedback = 'Weak password';
                    break;
                case 2:
                    strengthFill.className = 'strength-fill strength-fair';
                    feedback = 'Fair password';
                    break;
                case 3:
                case 4:
                    strengthFill.className = 'strength-fill strength-good';
                    feedback = 'Good password';
                    break;
                case 5:
                    strengthFill.className = 'strength-fill strength-strong';
                    feedback = 'Strong password';
                    break;
            }
            
            strengthText.textContent = feedback;
            return strength;
        }

        // Real-time validation
        document.getElementById('username').addEventListener('input', function() {
            const username = this.value;
            const group = this.parentElement;
            
            if (username.length >= 3 && username.length <= 20) {
                group.className = 'form-group has-icon success';
            } else if (username.length > 0) {
                group.className = 'form-group has-icon error';
            } else {
                group.className = 'form-group has-icon';
            }
            
            checkFormValidity();
        });

        document.getElementById('email').addEventListener('input', function() {
            const email = this.value;
            const group = this.parentElement;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (emailRegex.test(email)) {
                group.className = 'form-group has-icon success';
            } else if (email.length > 0) {
                group.className = 'form-group has-icon error';
            } else {
                group.className = 'form-group has-icon';
            }
            
            checkFormValidity();
        });

        document.getElementById('password').addEventListener('input', function() {
            const password = this.value;
            const group = this.parentElement;
            const strength = checkPasswordStrength(password);
            
            if (password.length >= 8 && strength >= 3) {
                group.className = 'form-group has-icon success';
            } else if (password.length > 0) {
                group.className = 'form-group has-icon error';
            } else {
                group.className = 'form-group has-icon';
            }
            
            // Check confirm password when password changes
            validateConfirmPassword();
            checkFormValidity();
        });

        document.getElementById('confirmPassword').addEventListener('input', validateConfirmPassword);

        function validateConfirmPassword() {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const group = document.getElementById('confirmPassword').parentElement;
            
            if (confirmPassword && password === confirmPassword) {
                group.className = 'form-group has-icon success';
            } else if (confirmPassword.length > 0) {
                group.className = 'form-group has-icon error';
            } else {
                group.className = 'form-group has-icon';
            }
            
            checkFormValidity();
        }

        document.getElementById('terms').addEventListener('change', checkFormValidity);

        function checkFormValidity() {
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            const registerBtn = document.getElementById('registerBtn');
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = username.length >= 3 && username.length <= 20 &&
                           emailRegex.test(email) &&
                           password.length >= 8 &&
                           password === confirmPassword &&
                           terms;
            
            registerBtn.disabled = !isValid;
        }

        // Form submission
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const container = document.querySelector('.register-container');
            const formData = new FormData(this);
            
            // Simulate loading
            container.classList.add('loading');
            document.getElementById('registerBtn').textContent = 'Creating Account...';
            
            // Simulate API call
            setTimeout(() => {
                alert('Account created successfully! (This is a demo)');
                container.classList.remove('loading');
                document.getElementById('registerBtn').textContent = 'Create Account';
                
                // Optionally redirect to login
                // window.location.href = '/login';
            }, 2500);
        });

        // Helper functions
        function showTerms() {
            alert('Terms of Service would be displayed here.');
        }

        function showPrivacy() {
            alert('Privacy Policy would be displayed here.');
        }

        function goToLogin() {
            // Redirect to login page
            alert('Redirecting to login page...');
            window.location.href = '/login';
        }

        // Initialize
        checkFormValidity();