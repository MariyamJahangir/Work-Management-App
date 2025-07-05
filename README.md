# Aieera Digital Marketing Work Management System

A comprehensive work management system for digital marketing agencies built with React, TypeScript, and MongoDB.

## Features

- **Client Management**: Add and manage multiple clients
- **Multi-Service Support**: Assign multiple services per client with individual deadlines
- **Priority Calculation**: Automatic priority assignment based on submission dates
- **Dashboard**: Real-time overview of all projects with filtering and grouping options
- **CRUD Operations**: Full create, read, update, delete functionality
- **Responsive Design**: Works seamlessly across all device sizes

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Icons**: Lucide React
- **Build Tool**: Vite

## Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- MongoDB installed and running locally
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aieera-digital-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
MONGODB_URI=mongodb://localhost:27017/aieera-digital
PORT=3001
```

4. Start MongoDB service on your local machine

5. Run the application:
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend development server (port 5173) concurrently.

## Usage

1. **Adding Clients**: Use the "Add Client" button in the header to create new clients with multiple services
2. **Dashboard**: View all projects in a sortable table with filtering options
3. **Editing**: Click the edit icon on any service to modify its details
4. **Grouping**: Toggle "Group by Client" to organize services by client
5. **Filtering**: Filter by priority, status, or specific client

## Database Schema

### Clients Collection
```javascript
{
  _id: "unique-client-id",
  name: "Client Name",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### Services Collection
```javascript
{
  _id: "unique-service-id",
  clientId: "client-id",
  clientName: "Client Name",
  serviceName: "Web Development",
  workName: "E-commerce Website",
  submissionDate: "2024-02-01",
  priority: "High",
  status: "Active",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## API Endpoints

- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `DELETE /api/clients/:id` - Delete client and associated services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/health` - Health check

## Development

The application uses:
- **Concurrently** to run both frontend and backend simultaneously
- **Nodemon** for automatic server restarts during development
- **Hot Module Replacement** for instant frontend updates

## Production Deployment

1. Build the frontend:
```bash
npm run build
```

2. Set up MongoDB connection for production
3. Configure environment variables for production
4. Deploy both frontend build and backend server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.