
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { CreditCard, Lock, DollarSign } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  serviceId?: string;
  providerId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  serviceId,
  providerId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const response = await apiClient.createPaymentIntent(amount, serviceId, providerId);
      if (response.success && response.data) {
        const { clientSecret } = response.data as { clientSecret: string };
        
        // In a real app, you would use Stripe Elements here
        // For now, we'll simulate the payment process
        toast({
          title: "Payment Processing",
          description: "Redirecting to Stripe checkout...",
        });

        // Simulate payment confirmation
        setTimeout(async () => {
          try {
            const confirmResponse = await apiClient.confirmPayment(clientSecret);
            if (confirmResponse.success) {
              toast({
                title: "Payment Successful",
                description: "Your payment has been processed successfully!",
              });
              onSuccess?.();
            }
          } catch (error) {
            toast({
              title: "Payment Failed",
              description: "There was an error processing your payment.",
              variant: "destructive",
            });
          }
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    setLoading(true);
    try {
      // PayPal integration would go here
      toast({
        title: "PayPal Payment",
        description: "PayPal integration coming soon!",
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initiate PayPal payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'stripe') {
      handleStripePayment();
    } else if (paymentMethod === 'paypal') {
      handlePayPalPayment();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Total Amount:</span>
            <div className="flex items-center font-bold text-lg">
              <DollarSign className="h-4 w-4" />
              {(amount / 100).toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Credit/Debit Card (Stripe)</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === 'stripe' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  className="font-mono"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            Your payment information is secure and encrypted
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
