# ANT61-Hackathon

## People Manager Application

A simple web-based application to add and manage people. Perfect for hackathon team management, contact lists, or any scenario where you need to keep track of people's information.

## Features

- ✨ **Add People**: Easily add people with name, email, phone, and role
- 📋 **View List**: See all added people in a clean, organized list
- 🗑️ **Delete People**: Remove people from the list when needed
- 💾 **Persistent Storage**: Data is saved in browser's local storage
- 📱 **Responsive Design**: Works great on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## How to Use

### Quick Start

1. Open `index.html` in your web browser
2. Fill in the form with person details:
   - **Name** (required): Full name of the person
   - **Email** (required): Email address
   - **Phone** (optional): Phone number
   - **Role** (optional): Role or position
3. Click "Add Person" to add them to the list
4. View all added people in the "People List" section below
5. Click "Delete" on any person card to remove them

### Running Locally

Simply open the `index.html` file in any modern web browser:

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Then visit http://localhost:8000
```

## Files

- `index.html` - Main HTML structure
- `app.js` - JavaScript functionality for managing people
- `styles.css` - Styling and responsive design

## Data Storage

All data is stored locally in your browser using `localStorage`. This means:
- Your data persists between sessions
- Data is private to your browser
- Clearing browser data will remove all stored people

## Browser Compatibility

Works with all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

This is a hackathon project. Feel free to fork and enhance!