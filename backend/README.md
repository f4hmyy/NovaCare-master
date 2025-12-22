# NovaCare Backend Server

Express.js server with OracleDB connection for the NovaCare application.

## Setup

### Prerequisites
- Node.js (v18 or higher)
- Oracle Database (or Oracle XE/Free)
- Oracle Instant Client (required for oracledb package)

### Oracle Instant Client Installation

**Windows:**
1. Download Oracle Instant Client from: https://www.oracle.com/database/technologies/instant-client/downloads.html
2. Extract to a directory (e.g., `C:\oracle\instantclient_21_13`)
3. Add the directory to your PATH environment variable

**Linux/Mac:**
```bash
# Download and extract instant client
# Add to LD_LIBRARY_PATH or DYLD_LIBRARY_PATH
```

### Installation

1. Copy `.env.example` to `.env` and update with your database credentials:
```bash
cp .env.example .env
```

2. Install dependencies:
```bash
npm install
```

3. Configure your database connection in `.env`:
```
DB_USER=your_username
DB_PASSWORD=your_password
DB_CONNECT_STRING=localhost:1521/FREEPDB1
```

## Running the Server

### Development mode:
```bash
npm run server
```

### With auto-restart (using nodemon):
```bash
npm run server:dev
```

The server will start on http://localhost:5000

## API Endpoints

### Test Endpoints

- `GET /api/test` - Check if API is running
- `GET /api/test/db` - Test database connection

### Example Response:
```json
{
  "message": "API is running!",
  "timestamp": "2025-12-18T10:30:00.000Z"
}
```

## Middleware Configured

1. **CORS** - Allows cross-origin requests from frontend
2. **Body Parser** - Parses JSON and URL-encoded request bodies
3. **Request Logger** - Logs all incoming requests
4. **Error Handler** - Global error handling middleware

## Database Connection

The server uses OracleDB connection pooling with the following configuration:
- Pool Min: 4 connections
- Pool Max: 10 connections
- Pool Increment: 2
- Pool Timeout: 60 seconds

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| CLIENT_URL | Frontend URL for CORS | http://localhost:3000 |
| DB_USER | Oracle DB username | PDBADMIN |
| DB_PASSWORD | Oracle DB password | PDBADMIN |
| DB_CONNECT_STRING | Oracle DB connection string | localhost:1521/FREEPDB1 |

## Troubleshooting

### Error: DPI-1047: Cannot locate an Oracle Client library
- Install Oracle Instant Client
- Add Instant Client directory to PATH (Windows) or LD_LIBRARY_PATH (Linux)

### Error: ORA-12541: TNS:no listener
- Ensure Oracle database is running
- Verify the connection string in `.env`

### Error: ORA-01017: invalid username/password
- Check your database credentials in `.env`
