#!/bin/bash

# BodyConnect Application Setup Script
# This script automates the setup process for the BodyConnect application

set -e  # Exit on any error

echo "🚀 BodyConnect Application Setup"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
        
        # Check if version is >= 16
        MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
        if [ "$MAJOR_VERSION" -lt 16 ]; then
            print_warning "Node.js version 16 or higher is recommended. Current: $NODE_VERSION"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Setup backend
setup_backend() {
    echo ""
    print_info "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install
    print_status "Backend dependencies installed"
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating backend .env file..."
        cp .env.example .env
        print_warning "Please update the .env file with your MongoDB Atlas credentials"
        print_info "Edit backend/.env and update the MONGO_URI with your connection string"
    else
        print_status "Backend .env file already exists"
    fi
    
    cd ..
}

# Setup frontend
setup_frontend() {
    echo ""
    print_info "Setting up frontend..."
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm install
    print_status "Frontend dependencies installed"
}

# Create development scripts
create_scripts() {
    echo ""
    print_info "Creating development scripts..."
    
    # Create start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash

# BodyConnect Development Server Starter
echo "🚀 Starting BodyConnect Development Servers"
echo "=========================================="

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "📡 Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started successfully!"
echo "📡 Backend: http://localhost:5000"
echo "🎨 Frontend: http://localhost:5173"
echo "🏥 Health Check: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
EOF

    chmod +x start-dev.sh
    print_status "Development starter script created: ./start-dev.sh"
}

# Create MongoDB Atlas setup guide
create_mongodb_guide() {
    echo ""
    print_info "Creating MongoDB Atlas setup guide..."
    
    cat > MONGODB_SETUP.md << 'EOF'
# MongoDB Atlas Setup Guide

## 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account or sign in
3. Create a new project

## 2. Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider and region
4. Name your cluster (e.g., "bodyconnect-cluster")
5. Click "Create Cluster"

## 3. Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Add Current IP Address"
4. For production: Add "0.0.0.0/0" (Allow access from anywhere)
5. Click "Confirm"

## 5. Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with your database name (e.g., "bodyconnect")

## 6. Update Environment File
1. Open `backend/.env`
2. Update the MONGO_URI with your connection string:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bodyconnect?retryWrites=true&w=majority
   ```

## Example Connection String
```
mongodb+srv://bodyconnect_user:mySecurePassword123@bodyconnect-cluster.abc123.mongodb.net/bodyconnect?retryWrites=true&w=majority
```

## Troubleshooting
- If connection fails, check Network Access settings
- Ensure database user has correct permissions
- Verify connection string format
- Check MongoDB Atlas cluster status
EOF

    print_status "MongoDB Atlas setup guide created: ./MONGODB_SETUP.md"
}

# Main setup function
main() {
    echo "Starting BodyConnect application setup..."
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    # Create helpful scripts
    create_scripts
    create_mongodb_guide
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Set up MongoDB Atlas (see MONGODB_SETUP.md)"
    echo "2. Update backend/.env with your MongoDB connection string"
    echo "3. Run './start-dev.sh' to start both servers"
    echo "4. Visit http://localhost:5173 to use the application"
    echo ""
    print_info "Health check available at: http://localhost:5000/api/health"
    print_info "Documentation available in: IMPROVEMENTS_SUMMARY.md"
    echo ""
    print_warning "Remember to:"
    echo "- Keep your MongoDB credentials secure"
    echo "- Update CORS settings for production"
    echo "- Set up proper environment variables for deployment"
}

# Run main function
main