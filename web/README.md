# BookBrow Web Frontend

A modern React-based web frontend for the BookBrow book discovery platform.

## Features

- 📚 Browse available books
- 🎨 Responsive and modern UI design
- 🔄 Real-time data fetching from backend API
- 📱 Mobile-friendly layout

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Backend Configuration

The frontend expects the backend API to be running on `http://localhost:8080`. To customize the API endpoint, modify the `fetchBooks` function in `src/App.js`:

```javascript
const response = await axios.get('http://your-api-url:8080/api/books');
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Creates a production build
- `npm test` - Runs the test suite

## Project Structure

```
src/
  ├── App.js          # Main application component
  ├── App.css         # Application styles
  ├── index.js        # Entry point
  └── index.css       # Global styles
public/
  └── index.html      # HTML template
package.json          # Project dependencies
```

## Technology Stack

- **React** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling

## License

MIT
