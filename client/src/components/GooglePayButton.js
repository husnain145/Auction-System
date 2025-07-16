import { useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import axios from 'axios';

const GooglePayButton = ({ auctionId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
  if (!stripe || !amount) return;

  const pr = stripe.paymentRequest({
    country: 'US',
    currency: 'usd',
    total: { label: 'Auction Payment', amount: amount * 100 },
    requestPayerName: true,
    requestPayerEmail: true,
  });

  pr.canMakePayment().then((result) => {
    console.log("🟢 canMakePayment result:", result);
    if (result) setPaymentRequest(pr);
    else console.log("❌ PaymentRequest not available in this environment.");
  });

    // Handle payment
    pr.on('paymentmethod', async (ev) => {
      try {
        const res = await axios.post('http://localhost:5000/api/payments/create-intent', {
          auctionId,
          paymentMethodId: ev.paymentMethod.id,
        });

        const confirmRes = await stripe.confirmCardPayment(res.data.clientSecret, {
          payment_method: ev.paymentMethod.id,
        });

        if (confirmRes.paymentIntent.status === 'succeeded') {
          ev.complete('success');
          alert('✅ Payment successful!');
          window.location.href = '/payment-success';
        } else {
          ev.complete('fail');
          alert('❌ Payment failed.');
        }
      } catch (err) {
        console.error(err);
        ev.complete('fail');
        alert('❌ Error during payment.');
      }
    });
  }, [stripe, amount, auctionId]);

  // ❌ Don't render if not supported
  if (!paymentRequest) return null;

  return (
    <div className="mt-4">
      <PaymentRequestButtonElement
        options={{ paymentRequest }}
        className="w-full PaymentRequestButton"
      />
    </div>
  );
};

export default GooglePayButton;
