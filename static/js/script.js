// Global variables
let currentEditTodoId = null;
let currentDeleteTodoId = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-hide flash messages
    autoHideFlashMessages();
});

// Initialize application
function initializeApp() {
    // Set today's date as minimum for due date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        input.min = today;
    });
    
    // Initialize filter functionality
    initializeFilters();
    
    // Update stats on page load
    updateStats();
}

// Set up all event listeners
function setupEventListeners() {
    // Registration form validation
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', validateRegistrationForm);
    }
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterTodos(filter);
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const editModal = document.getElementById('editModal');
        const deleteModal = document.getElementById('deleteModal');
        
        if (event.target === editModal) {
            closeEditModal();
        }
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Escape key closes modals
        if (event.key === 'Escape') {
            closeEditModal();
            closeDeleteModal();
        }
        
        // Ctrl/Cmd + N opens add todo form focus
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            const titleInput = document.getElementById('title');
            if (titleInput) {
                titleInput.focus();
                titleInput.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

// Auto-hide flash messages
function autoHideFlashMessages() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.style.display = 'none';
            }, 300);
        }, 5000);
    });
}

// Registration form validation
function validateRegistrationForm(event) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    
    if (password !== confirmPassword) {
        event.preventDefault();
        showAlert('Passwords do not match!', 'error');
        return false;
    }
    
    if (password.length < 6) {
        event.preventDefault();
        showAlert('Password must be at least 6 characters long!', 'error');
        return false;
    }
    
    return true;
}

// Show custom alert
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `custom-alert alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="close-btn">&times;</button>
    `;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    const firstChild = container.firstChild;
    container.insertBefore(alert, firstChild);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Initialize filters
function initializeFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter') || 'all';
    
    // Set active filter button
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Apply filter
    filterTodos(filter);
}

// Filter todos based on status
function filterTodos(filter) {
    const todoCards = document.querySelectorAll('.todo-card');
    
    todoCards.forEach(card => {
        const status = card.getAttribute('data-status');
        
        if (filter === 'all' || filter === status) {
            card.style.display = 'block';
            // Add fade-in animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update URL without refresh
    const url = new URL(window.location);
    if (filter === 'all') {
        url.searchParams.delete('filter');
    } else {
        url.searchParams.set('filter', filter);
    }
    window.history.replaceState({}, '', url);
    
    // Show empty state if no todos visible
    showEmptyStateIfNeeded(filter);
}

// Show empty state when no todos match filter
function showEmptyStateIfNeeded(filter) {
    const todoCards = document.querySelectorAll('.todo-card[style*="display: block"], .todo-card:not([style*="display: none"])');
    const visibleTodos = Array.from(todoCards).filter(card => {
        return window.getComputedStyle(card).display !== 'none';
    });
    
    let emptyState = document.querySelector('.filter-empty-state');
    
    if (visibleTodos.length === 0 && document.querySelectorAll('.todo-card').length > 0) {
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'filter-empty-state empty-state';
            
            const messages = {
                'pending': {
                    icon: 'fas fa-check-circle',
                    title: 'No pending tasks!',
                    text: 'All your tasks are completed. Great job!'
                },
                'done': {
                    icon: 'fas fa-clock',
                    title: 'No completed tasks yet!',
                    text: 'Complete some tasks to see them here.'
                }
            };
            
            const message = messages[filter] || {
                icon: 'fas fa-search',
                title: 'No tasks found!',
                text: 'Try a different filter or add some tasks.'
            };
            
            emptyState.innerHTML = `
                <i class="${message.icon} empty-icon"></i>
                <h3>${message.title}</h3>
                <p>${message.text}</p>
            `;
            
            document.querySelector('.todos-grid').appendChild(emptyState);
        }
    } else if (emptyState) {
        emptyState.remove();
    }
}

// Toggle todo status
async function toggleStatus(todoId) {
    try {
        const response = await fetch(`/toggle_status/${todoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update the UI
            const todoCard = document.querySelector(`[data-id="${todoId}"]`);
            const statusButton = todoCard.querySelector('.status-toggle');
            const titleElement = todoCard.querySelector('.todo-title');
            const statusIcon = statusButton.querySelector('i');
            
            // Update status
            todoCard.setAttribute('data-status', data.status);
            todoCard.className = `todo-card ${data.status}`;
            
            // Update icon
            if (data.status === 'done') {
                statusIcon.className = 'fas fa-check-circle completed';
                titleElement.classList.add('completed');
            } else {
                statusIcon.className = 'far fa-circle pending';
                titleElement.classList.remove('completed');
            }
            
            // Add completion animation
            if (data.status === 'done') {
                todoCard.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    todoCard.style.transform = 'scale(1)';
                }, 200);
            }
            
            // Update stats
            updateStats();
            
            // Show success message
            showAlert('Task status updated!', 'success');
            
        } else {
            throw new Error(data.error || 'Failed to update status');
        }
    } catch (error) {
        console.error('Error toggling status:', error);
        showAlert('Failed to update task status', 'error');
    }
}

// Update statistics
function updateStats() {
    const todoCards = document.querySelectorAll('.todo-card');
    const pendingTasks = document.querySelectorAll('.todo-card[data-status="pending"]');
    const completedTasks = document.querySelectorAll('.todo-card[data-status="done"]');
    
    // Update stat numbers
    const totalElement = document.getElementById('total-tasks');
    const pendingElement = document.getElementById('pending-tasks');
    const completedElement = document.getElementById('completed-tasks');
    
    if (totalElement) totalElement.textContent = todoCards.length;
    if (pendingElement) pendingElement.textContent = pendingTasks.length;
    if (completedElement) completedElement.textContent = completedTasks.length;
    
    // Add animation to updated stats
    [totalElement, pendingElement, completedElement].forEach(element => {
        if (element) {
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    });
}

// Edit todo functionality
function editTodo(todoId) {
    currentEditTodoId = todoId;
    
    // Get todo data from the card
    const todoCard = document.querySelector(`[data-id="${todoId}"]`);
    const title = todoCard.querySelector('.todo-title').textContent.trim();
    const description = todoCard.querySelector('.todo-description')?.textContent.trim() || '';
    const dueDateElement = todoCard.querySelector('.due-date span');
    const status = todoCard.getAttribute('data-status');
    
    // Parse due date
    let dueDate = '';
    if (dueDateElement) {
        const dueDateText = dueDateElement.textContent.replace('Due: ', '');
        // Convert "Jan 15, 2024" to "2024-01-15"
        const date = new Date(dueDateText);
        if (!isNaN(date.getTime())) {
            dueDate = date.toISOString().split('T')[0];
        }
    }
    
    // Populate the edit form
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-description').value = description;
    document.getElementById('edit-due-date').value = dueDate;
    document.getElementById('edit-status').value = status;
    
    // Set form action
    document.getElementById('editForm').action = `/update_todo/${todoId}`;
    
    // Show modal
    showEditModal();
}

// Show edit modal
function showEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Focus on title input
    setTimeout(() => {
        document.getElementById('edit-title').focus();
    }, 100);
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    currentEditTodoId = null;
}

// Delete todo functionality
function deleteTodo(todoId) {
    currentDeleteTodoId = todoId;
    
    // Set form action
    document.getElementById('deleteForm').action = `/delete_todo/${todoId}`;
    
    // Show modal
    showDeleteModal();
}

// Show delete modal
function showDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.add('show');
    modal.style.display = 'flex';
}

// Close delete modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    currentDeleteTodoId = null;
}

// Search functionality (if you want to add it later)
function searchTodos(searchTerm) {
    const todoCards = document.querySelectorAll('.todo-card');
    
    todoCards.forEach(card => {
        const title = card.querySelector('.todo-title').textContent.toLowerCase();
        const description = card.querySelector('.todo-description')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Theme toggle (for future enhancement)
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Check for overdue tasks
function checkOverdueTasks() {
    const today = new Date();
    const todoCards = document.querySelectorAll('.todo-card[data-status="pending"]');
    
    todoCards.forEach(card => {
        const dueDateElement = card.querySelector('.due-date span');
        if (dueDateElement) {
            const dueDateText = dueDateElement.textContent.replace('Due: ', '');
            const dueDate = new Date(dueDateText);
            
            if (dueDate < today) {
                const dueDateContainer = card.querySelector('.due-date');
                dueDateContainer.classList.add('overdue');
                
                // Add overdue indicator
                if (!dueDateContainer.querySelector('.overdue-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'overdue-badge';
                    badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Overdue';
                    dueDateContainer.appendChild(badge);
                }
            }
        }
    });
}

// Drag and drop functionality (for future enhancement)
function initializeDragAndDrop() {
    const todoCards = document.querySelectorAll('.todo-card');
    
    todoCards.forEach(card => {
        card.draggable = true;
        
        card.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
            this.classList.add('dragging');
        });
        
        card.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    // Drop zones could be status sections
    const statusSections = document.querySelectorAll('.status-section');
    statusSections.forEach(section => {
        section.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        section.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        section.addEventListener('drop', function(e) {
            e.preventDefault();
            const todoId = e.dataTransfer.getData('text/plain');
            const newStatus = this.getAttribute('data-status');
            
            // Update todo status via AJAX
            updateTodoStatus(todoId, newStatus);
            this.classList.remove('drag-over');
        });
    });
}

// Bulk actions functionality
function initializeBulkActions() {
    // Add checkboxes to todo cards
    const todoCards = document.querySelectorAll('.todo-card');
    
    todoCards.forEach(card => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'bulk-select';
        checkbox.addEventListener('change', updateBulkActionButtons);
        
        // Insert checkbox in todo header
        const todoHeader = card.querySelector('.todo-header');
        todoHeader.insertBefore(checkbox, todoHeader.firstChild);
    });
    
    // Add bulk action buttons
    const bulkActions = document.createElement('div');
    bulkActions.className = 'bulk-actions';
    bulkActions.innerHTML = `
        <button onclick="selectAllTodos()" class="btn btn-secondary">Select All</button>
        <button onclick="bulkMarkComplete()" class="btn btn-success">Mark Complete</button>
        <button onclick="bulkMarkPending()" class="btn btn-warning">Mark Pending</button>
        <button onclick="bulkDelete()" class="btn btn-danger">Delete Selected</button>
    `;
    
    const todosSection = document.querySelector('.todos-section');
    todosSection.insertBefore(bulkActions, todosSection.firstChild);
}

function updateBulkActionButtons() {
    const selectedTodos = document.querySelectorAll('.bulk-select:checked');
    const bulkActions = document.querySelector('.bulk-actions');
    
    if (selectedTodos.length > 0) {
        bulkActions.style.display = 'block';
    } else {
        bulkActions.style.display = 'none';
    }
}

function selectAllTodos() {
    const checkboxes = document.querySelectorAll('.bulk-select');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
    
    updateBulkActionButtons();
}

// Progressive Web App functionality
function initializePWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
    
    // Install prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        deferredPrompt = e;
        showInstallButton();
    });
    
    function showInstallButton() {
        const installButton = document.createElement('button');
        installButton.className = 'install-app-btn';
        installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
        installButton.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                installButton.remove();
            });
        });
        
        document.querySelector('.nav-content').appendChild(installButton);
    }
}

// Notification functionality
function requestNotificationPermission() {
    if ('Notification' in window && navigator.serviceWorker) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
                scheduleTaskReminders();
            }
        });
    }
}

function scheduleTaskReminders() {
    const pendingTasks = document.querySelectorAll('.todo-card[data-status="pending"]');
    
    pendingTasks.forEach(card => {
        const dueDateElement = card.querySelector('.due-date span');
        if (dueDateElement) {
            const dueDateText = dueDateElement.textContent.replace('Due: ', '');
            const dueDate = new Date(dueDateText);
            const now = new Date();
            const timeUntilDue = dueDate.getTime() - now.getTime();
            
            // Schedule notification 1 day before due date
            const reminderTime = timeUntilDue - (24 * 60 * 60 * 1000);
            
            if (reminderTime > 0) {
                setTimeout(() => {
                    const title = card.querySelector('.todo-title').textContent;
                    new Notification('Task Reminder', {
                        body: `"${title}" is due tomorrow!`,
                        icon: '/static/icon-192x192.png'
                    });
                }, reminderTime);
            }
        }
    });
}

// Export functionality
function exportTodos() {
    const todos = [];
    const todoCards = document.querySelectorAll('.todo-card');
    
    todoCards.forEach(card => {
        const title = card.querySelector('.todo-title').textContent.trim();
        const description = card.querySelector('.todo-description')?.textContent.trim() || '';
        const status = card.getAttribute('data-status');
        const dueDateElement = card.querySelector('.due-date span');
        const dueDate = dueDateElement ? dueDateElement.textContent.replace('Due: ', '') : '';
        
        todos.push({
            title,
            description,
            status,
            dueDate
        });
    });
    
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'my-todos.json';
    link.click();
}

// Keyboard shortcuts info
function showKeyboardShortcuts() {
    const shortcuts = [
        { key: 'Ctrl/Cmd + N', action: 'Focus on new task input' },
        { key: 'Escape', action: 'Close modals' },
        { key: '/', action: 'Focus on search (if implemented)' }
    ];
    
    let shortcutsHTML = '<h3>Keyboard Shortcuts</h3><ul>';
    shortcuts.forEach(shortcut => {
        shortcutsHTML += `<li><kbd>${shortcut.key}</kbd> - ${shortcut.action}</li>`;
    });
    shortcutsHTML += '</ul>';
    
    showAlert(shortcutsHTML, 'info');
}

// Initialize all features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check for overdue tasks
    checkOverdueTasks();
    
    // Initialize PWA features
    initializePWA();
    
    // Request notification permission after user interaction
    document.addEventListener('click', function() {
        requestNotificationPermission();
    }, { once: true });
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}