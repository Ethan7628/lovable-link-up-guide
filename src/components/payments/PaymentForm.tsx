
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { CreditCard, Lock, DollarSign } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  serviceId?: string;
  providerId?: string;
  onPaymentSuccess?: () => void;
  onPaymentCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  serviceId,
  providerId,
  onPaymentSuccess,
  onPaymentCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  const handleInputChange = (field: string, value: string) => {
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) return; // Limit to 16 digits + spaces
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
      if (value.length > 5) return;
    }
    
    // Format CVV
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    }

    setPaymentMethod(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    // Basic validation
    if (!paymentMethod.cardNumber.replace(/\s/g, '') || 
        !paymentMethod.expiryDate || 
        !paymentMethod.cvv || 
        !paymentMethod.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all payment details",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const response = await apiClient.createPaymentIntent(amount, serviceId, providerId);
      
      if (response.success && response.data) {
        // In a real implementation, you would use Stripe Elements here
        // For demo purposes, we'll simulate a successful payment
        setTimeout(async () => {
          try {
            const confirmResponse = await apiClient.confirmPayment(response.data.paymentIntentId);
            
            if (confirmResponse.success) {
              toast({
                title: "Payment successful!",
                description: `Payment of $${amount} has been processed successfully.`,
              });
              onPaymentSuccess?.();
            } else {
              throw new Error('Payment confirmation failed');
            }
          } catch (error) {
            toast({
              title: "Payment failed",
              description: "There was an issue processing your payment. Please try again.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        }, 2000);
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      toast({
        title: "Payment error",
        description: "Unable to process payment. Please check your details and try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
          <span>Payment Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <div className="flex items-center text-2xl font-bold text-purple-600">
              <DollarSign className="h-5 w-5" />
              <span>{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              value={paymentMethod.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              value={paymentMethod.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                value={paymentMethod.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="MM/YY"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={paymentMethod.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onPaymentCancel}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
