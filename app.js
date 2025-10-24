// People Manager Application
class PeopleManager {
    constructor() {
        this.people = this.loadPeople();
        this.form = document.getElementById('addPersonForm');
        this.peopleList = document.getElementById('peopleList');
        this.peopleCount = document.getElementById('peopleCount');
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.renderPeople();
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const person = {
            id: Date.now().toString(),
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            role: document.getElementById('role').value.trim(),
            addedAt: new Date().toISOString()
        };
        
        this.addPerson(person);
        this.form.reset();
        document.getElementById('name').focus();
    }
    
    addPerson(person) {
        this.people.push(person);
        this.savePeople();
        this.renderPeople();
        this.showNotification('Person added successfully!');
    }
    
    deletePerson(id) {
        if (confirm('Are you sure you want to delete this person?')) {
            this.people = this.people.filter(p => p.id !== id);
            this.savePeople();
            this.renderPeople();
            this.showNotification('Person deleted successfully!');
        }
    }
    
    loadPeople() {
        const stored = localStorage.getItem('people');
        return stored ? JSON.parse(stored) : [];
    }
    
    savePeople() {
        localStorage.setItem('people', JSON.stringify(this.people));
    }
    
    renderPeople() {
        this.peopleCount.textContent = `Total: ${this.people.length} ${this.people.length === 1 ? 'person' : 'people'}`;
        
        if (this.people.length === 0) {
            this.peopleList.innerHTML = '<p class="empty-message">No people added yet. Add your first person above!</p>';
            return;
        }
        
        this.peopleList.innerHTML = this.people
            .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
            .map(person => this.createPersonCard(person))
            .join('');
        
        // Add event listeners to delete buttons
        this.peopleList.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.deletePerson(id);
            });
        });
    }
    
    createPersonCard(person) {
        return `
            <div class="person-card">
                <div class="person-info">
                    <h3 class="person-name">${this.escapeHtml(person.name)}</h3>
                    <p class="person-email">📧 ${this.escapeHtml(person.email)}</p>
                    ${person.phone ? `<p class="person-phone">📱 ${this.escapeHtml(person.phone)}</p>` : ''}
                    ${person.role ? `<p class="person-role">💼 ${this.escapeHtml(person.role)}</p>` : ''}
                    <p class="person-date">Added: ${new Date(person.addedAt).toLocaleString()}</p>
                </div>
                <div class="person-actions">
                    <button class="btn btn-delete" data-id="${person.id}">Delete</button>
                </div>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PeopleManager();
});
