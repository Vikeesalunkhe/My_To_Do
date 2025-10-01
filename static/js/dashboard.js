// Add smooth scrolling and form enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add loading state to submit button
    const form = document.querySelector('form');
    const submitBtn = document.querySelector('.btn-submit');

    if (form && submitBtn) {
        form.addEventListener('submit', function() {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Task...';
            submitBtn.disabled = true;
        });
    }

    // Add focus animations
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    }
    );

    // Add hover effects to task items
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.borderLeftWidth = '8px';
        });

        item.addEventListener('mouseleave', function() {
            this.style.borderLeftWidth = '5px';
        });
    }
    );

    // Animate stats on load
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalNumber = parseInt(stat.textContent);
        let currentNumber = 0;
        const increment = Math.ceil(finalNumber / 30);

        const timer = setInterval( () => {
            currentNumber += increment;
            if (currentNumber >= finalNumber) {
                currentNumber = finalNumber;
                clearInterval(timer);
            }
            stat.textContent = currentNumber;
        }
        , 50);
    }
    );

    // Add loading state to action buttons
    const actionForms = document.querySelectorAll('.task-actions form');
    actionForms.forEach(form => {
        form.addEventListener('submit', function() {
            const button = this.querySelector('button');
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            button.disabled = true;

            // Restore button after 3 seconds as fallback
            setTimeout( () => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }
            , 3000);
        });
    }
    );
});

// Toggle edit form visibility
function toggleEditForm(taskId) {
    const editForm = document.getElementById(`edit-form-${taskId}`);
    const allEditForms = document.querySelectorAll('.edit-form');

    // Close all other edit forms
    allEditForms.forEach(form => {
        if (form.id !== `edit-form-${taskId}`) {
            form.style.display = 'none';
        }
    }
    );

    // Toggle current form
    if (editForm.style.display === 'none' || editForm.style.display === '') {
        editForm.style.display = 'block';
        // Focus on the title input
        const titleInput = editForm.querySelector(`#edit-title-${taskId}`);
        if (titleInput) {
            setTimeout( () => titleInput.focus(), 100);
        }
    } else {
        editForm.style.display = 'none';
    }
}

// Confirm delete action
function confirmDelete(taskTitle) {
    return confirm(`Are you sure you want to delete the task "${taskTitle}"?\n\nThis action cannot be undone.`);
}

// Enhanced form validation for edit forms
document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('edit-task-form')) {
        const titleInput = e.target.querySelector('input[name="title"]');
        if (!titleInput.value.trim()) {
            e.preventDefault();
            alert('Task title cannot be empty!');
            titleInput.focus();
            return false;
        }

        // Add loading state to save button
        const saveBtn = e.target.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.disabled = true;
        }
    }
});

// Close edit forms when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.edit-form') && !e.target.closest('.btn-edit')) {
        const openForms = document.querySelectorAll('.edit-form[style*="block"]');
        openForms.forEach(form => {
            form.style.display = 'none';
        }
        );
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key closes edit forms
    if (e.key === 'Escape') {
        const openForms = document.querySelectorAll('.edit-form[style*="block"]');
        openForms.forEach(form => {
            form.style.display = 'none';
        }
        );
    }

    // Ctrl/Cmd + Enter submits edit forms
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('.edit-task-form')) {
            const form = activeElement.closest('.edit-task-form');
            form.submit();
        }
    }
});

// Auto-save draft functionality (optional)
function saveDraft(taskId) {
    const form = document.getElementById(`edit-form-${taskId}`);
    const formData = new FormData(form.querySelector('.edit-task-form'));
    const draftData = {
        title: formData.get('title'),
        description: formData.get('description'),
        due_date: formData.get('due_date')
    };

    // Save to localStorage
    localStorage.setItem(`task-draft-${taskId}`, JSON.stringify(draftData));
}

// Load draft functionality (optional)
function loadDraft(taskId) {
    const draftData = localStorage.getItem(`task-draft-${taskId}`);
    if (draftData) {
        const data = JSON.parse(draftData);
        const form = document.getElementById(`edit-form-${taskId}`);

        form.querySelector(`#edit-title-${taskId}`).value = data.title || '';
        form.querySelector(`#edit-description-${taskId}`).value = data.description || '';
        form.querySelector(`#edit-due-date-${taskId}`).value = data.due_date || '';
    }
}

// Clear draft when form is submitted successfully
document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('edit-task-form')) {
        const taskId = e.target.closest('[data-task-id]').dataset.taskId;
        localStorage.removeItem(`task-draft-${taskId}`);
    }
});
