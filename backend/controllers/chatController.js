const User = require('../models/User');

// Get chat partner info
const getChatPartner = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;

        // Verify match exists
        const user = await User.findById(userId);
        if (!user.matches.includes(matchId)) {
            return res.status(403).json({ error: 'You are not matched with this user' });
        }

        // Get partner info and last 20 messages
        const partner = await User.findById(matchId)
            .select('name photos age gender');

        const messages = await User.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            {
                $match: {
                    $or: [
                        { 'messages.to': matchId },
                        { 'messages.from': matchId }
                    ]
                }
            },
            { $sort: { 'messages.timestamp': -1 } },
            { $limit: 20 },
            {
                $project: {
                    text: '$messages.text',
                    sender: '$messages.from',
                    receiver: '$messages.to',
                    timestamp: '$messages.timestamp'
                }
            }
        ]);

        res.json({
            partner,
            messages: messages.reverse() // Show oldest first
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Save message to database (called from socket.io)
const saveMessage = async (sender, receiver, text) => {
    try {
        await User.findByIdAndUpdate(sender, {
            $push: {
                messages: {
                    to: receiver,
                    from: sender,
                    text,
                    timestamp: new Date()
                }
            }
        });
    } catch (error) {
        console.error('Save message error:', error);
    }
};

module.exports = {
    getChatPartner,
    saveMessage
};