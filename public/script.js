// API Base URL
const API_BASE = '/api';

// Store current class ID
let currentClassId = null;

// Load classes on page load
document.addEventListener('DOMContentLoaded', () => {
    loadClasses();
    setupModal();
});

// Load all classes
async function loadClasses() {
    try {
        const response = await fetch(`${API_BASE}/classes`);
        if (!response.ok) throw new Error('Failed to load classes');
        const classes = await response.json();
        displayClasses(classes);
    } catch (error) {
        console.error('Error loading classes:', error);
        showNotification('Error loading classes', 'error');
    }
}

// Display classes in grid
function displayClasses(classes) {
    const grid = document.getElementById('classesGrid');
    if (!grid) return;
    
    grid.innerHTML = classes.map(cls => `
        <div class="class-card" onclick="openClassModal('${cls.id}')">
            <h3>${cls.name}</h3>
            <div class="member-count">
                👥 ${cls.members?.length || 0} Members
            </div>
            <span class="status ${cls.gitRepository && cls.systemUrl ? 'configured' : 'pending'}">
                ${cls.gitRepository && cls.systemUrl ? '✅ Configured' : '⏳ Pending Setup'}
            </span>
        </div>
    `).join('');
}

// Setup modal
function setupModal() {
    const modal = document.getElementById('classModal');
    const span = document.getElementsByClassName('close')[0];

    if (span) {
        span.onclick = () => {
            modal.style.display = 'none';
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// Open class modal
async function openClassModal(classId) {
    currentClassId = classId;
    const modal = document.getElementById('classModal');
    
    try {
        const response = await fetch(`${API_BASE}/classes/${classId}`);
        if (!response.ok) throw new Error('Failed to load class details');
        
        const classData = await response.json();
        
        document.getElementById('modalClassName').textContent = classData.name;
        document.getElementById('gitRepository').value = classData.gitRepository || '';
        document.getElementById('systemUrl').value = classData.systemUrl || '';
        
        displayMembers(classData.members || []);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading class details:', error);
        showNotification('Error loading class details', 'error');
    }
}

// Display members
function displayMembers(members) {
    const membersList = document.getElementById('membersList');
    if (!membersList) return;
    
    if (members.length === 0) {
        membersList.innerHTML = '<p class="no-members">No members added yet</p>';
        return;
    }
    
    membersList.innerHTML = members.map(member => `
        <div class="member-item">
            <div class="member-info">
                <h4>${member.name}</h4>
                <p>ID: ${member.id.substring(0, 8)}...</p>
            </div>
            <span class="member-role">${member.role || 'Member'}</span>
            <button onclick="deleteMember('${member.id}')" class="delete-member" title="Remove member">
                🗑️
            </button>
        </div>
    `).join('');
}

// Save class details
async function saveClassDetails() {
    const gitRepository = document.getElementById('gitRepository').value;
    const systemUrl = document.getElementById('systemUrl').value;
    
    try {
        const response = await fetch(`${API_BASE}/classes/${currentClassId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gitRepository,
                systemUrl
            })
        });
        
        if (response.ok) {
            showNotification('Class details saved successfully', 'success');
            loadClasses(); // Refresh the grid
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save');
        }
    } catch (error) {
        console.error('Error saving class details:', error);
        showNotification('Error saving class details', 'error');
    }
}

// Add member
async function addMember() {
    const memberName = document.getElementById('memberName').value;
    const memberRole = document.getElementById('memberRole').value;
    
    if (!memberName) {
        showNotification('Please enter a member name', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/classes/${currentClassId}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: memberName,
                role: memberRole || 'Member'
            })
        });
        
        if (response.ok) {
            // Clear inputs
            document.getElementById('memberName').value = '';
            document.getElementById('memberRole').value = '';
            
            // Refresh members list
            const classResponse = await fetch(`${API_BASE}/classes/${currentClassId}`);
            const classData = await classResponse.json();
            displayMembers(classData.members);
            
            showNotification('Member added successfully', 'success');
            loadClasses(); // Refresh the grid
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add member');
        }
    } catch (error) {
        console.error('Error adding member:', error);
        showNotification('Error adding member', 'error');
    }
}

// Delete member
async function deleteMember(memberId) {
    if (!confirm('Are you sure you want to remove this member?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/classes/${currentClassId}/members/${memberId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Refresh members list
            const classResponse = await fetch(`${API_BASE}/classes/${currentClassId}`);
            const classData = await classResponse.json();
            displayMembers(classData.members);
            
            showNotification('Member removed successfully', 'success');
            loadClasses(); // Refresh the grid
        } else {
            throw new Error('Failed to remove member');
        }
    } catch (error) {
        console.error('Error removing member:', error);
        showNotification('Error removing member', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);