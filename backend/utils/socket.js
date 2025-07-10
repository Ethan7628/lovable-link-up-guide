const socketio = require('socket.io');
const { saveMessage } = require('../controllers/chatController');

const setupSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: process.env.NODE_ENV === 'development' ? "*" : process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        // Join user's personal room
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} connected`);
        });

        // Handle messaging
        socket.on('sendMessage', async ({ sender, receiver, text }) => {
            try {
                // Save to database
                await saveMessage(sender, receiver, text);

                // Create message object
                const message = {
                    sender,
                    receiver,
                    text,
                    timestamp: new Date()
                };

                // Emit to both users
                io.to(receiver).to(sender).emit('receiveMessage', message);
            } catch (error) {
                console.error('Socket message error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

module.exports = setupSocket;