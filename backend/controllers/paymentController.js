
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd', serviceId, providerId } = req.body;

        if (!amount || amount < 50) {
            return res.status(400).json({ 
                msg: 'Amount must be at least $0.50' 
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: {
                serviceId: serviceId || '',
                providerId: providerId || '',
                userId: req.user.id
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (err) {
        console.error('Payment intent creation error:', err.message);
        res.status(500).json({ msg: 'Payment processing error' });
    }
};

// Confirm payment
const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            // Update booking status or create booking record
            // This would integrate with your booking system
            res.json({ 
                success: true, 
                message: 'Payment confirmed successfully' 
            });
        } else {
            res.status(400).json({ 
                msg: 'Payment not completed' 
            });
        }
    } catch (err) {
        console.error('Payment confirmation error:', err.message);
        res.status(500).json({ msg: 'Payment confirmation error' });
    }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
    try {
        const payments = await stripe.paymentIntents.list({
            limit: 20,
            metadata: {
                userId: req.user.id
            }
        });

        res.json(payments.data);
    } catch (err) {
        console.error('Payment history error:', err.message);
        res.status(500).json({ msg: 'Unable to retrieve payment history' });
    }
};

module.exports = {
    createPaymentIntent,
    confirmPayment,
    getPaymentHistory
};
