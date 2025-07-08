const User = require('../models/User');

// Like a user and check for matches
const likeUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const swiperId = req.user.id;

        // Prevent self-liking
        if (userId === swiperId) {
            return res.status(400).json({ error: "You cannot like yourself" });
        }

        // Add to likes array
        await User.findByIdAndUpdate(
            swiperId,
            { $addToSet: { likes: userId } },
            { new: true }
        );

        // Check if it's a mutual like (match)
        const targetUser = await User.findById(userId);
        if (targetUser.likes.includes(swiperId)) {
            // Update both users' matches
            await User.findByIdAndUpdate(
                swiperId,
                { $addToSet: { matches: userId } }
            );
            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { matches: swiperId } }
            );

            // Get updated target user data
            const updatedTarget = await User.findById(userId)
                .select('name photos age gender');

            return res.json({
                match: true,
                user: updatedTarget,
                message: "It's a match!"
            });
        }

        res.json({ match: false });
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all matches for current user
const getMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('matches', 'name photos age gender bio')
            .select('matches');

        res.json(user.matches);
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    likeUser,
    getMatches
};