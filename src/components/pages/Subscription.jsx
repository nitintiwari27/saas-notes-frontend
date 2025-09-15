import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CreditCard, 
  Check, 
  Calendar, 
  ArrowRight,
  History,
  AlertTriangle
} from 'lucide-react';
import {
  fetchPlans,
  fetchMySubscription,
  createOrder,
  verifyPayment,
  fetchPaymentHistory,
  cancelSubscription,
  clearOrderData
} from '../../store/slices/subscriptionSlice';
import { Button, Card, Loading, Modal } from '../common';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Subscription = () => {
  const dispatch = useDispatch();
  const { 
    plans, 
    currentSubscription, 
    account, 
    paymentHistory, 
    paymentPagination,
    orderData,
    isLoading 
  } = useSelector((state) => state.subscription);
  
  const { account: authAccount } = useSelector((state) => state.auth);
  
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchMySubscription());
    dispatch(fetchPaymentHistory({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    // Clean up order data when component unmounts
    return () => {
      dispatch(clearOrderData());
    };
  }, [dispatch]);

  const handleUpgrade = async (planId) => {
    if (planId === 'free' || !authAccount?.slug) return;

    // Load Razorpay script
    const isRazorpayLoaded = await loadRazorpayScript();
    if (!isRazorpayLoaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    // Create order
    dispatch(createOrder({ 
      slug: authAccount.slug, 
      paymentData: { paymentMethod: 'razorpay' }
    })).unwrap().then((orderResponse) => {
      const options = {
        key: orderResponse.razorpayKeyId,
        amount: orderResponse.amount * 100, // Amount in paisa
        currency: orderResponse.currency,
        name: 'SaaS Notes',
        description: 'Pro Plan Subscription',
        order_id: orderResponse.orderId,
        handler: function (response) {
          // Verify payment
          dispatch(verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId: orderResponse.paymentId
          })).unwrap().then(() => {
            // Refresh subscription data
            dispatch(fetchMySubscription());
          });
        },
        prefill: {
          name: authAccount?.name || '',
          email: authAccount?.email || ''
        },
        theme: {
          color: '#0ea5e9'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    }).catch((error) => {
      console.error('Order creation failed:', error);
    });
  };

  const handleCancelSubscription = () => {
    dispatch(cancelSubscription()).unwrap().then(() => {
      setCancelModalOpen(false);
      dispatch(fetchMySubscription());
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || statusStyles.expired}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading && !plans.length) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">
            Manage your subscription and billing information
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPaymentHistory(!showPaymentHistory)}
        >
          <History className="h-4 w-4 mr-2" />
          {showPaymentHistory ? 'Hide' : 'Show'} Payment History
        </Button>
      </div>

      {/* Current Subscription */}
      {currentSubscription && account && (
        <Card title="Current Subscription">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Plan Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium capitalize">{account.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(currentSubscription.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notes Limit:</span>
                  <span className="font-medium">
                    {account.limit === -1 ? 'Unlimited' : account.limit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notes Used:</span>
                  <span className="font-medium">{account.noteCount}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Billing Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">
                    {formatDate(currentSubscription.startDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium">
                    {formatDate(currentSubscription.endDate)}
                  </span>
                </div>
                {/* {currentSubscription.status === 'active' && account.plan === 'pro' && (
                  <div className="pt-4">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancelModalOpen(true)}
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Available Plans */}
      <Card title="Available Plans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = account?.plan === plan.id;
            const isPro = plan.id === 'pro';
            
            return (
              <div 
                key={plan.id}
                className={`relative border rounded-lg p-6 ${
                  isPro ? 'border-primary-200 bg-primary-50' : 'border-gray-200'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Recommended
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{plan.price}
                    </span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled={account?.plan === 'free'}
                    >
                      {account?.plan === 'pro' ? 'Downgrade' : 'Current Plan'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUpgrade(plan.id)}
                      className="w-full"
                      loading={isLoading}
                    >
                      Upgrade to {plan.name}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Payment History */}
      {showPaymentHistory && (
        <Card title="Payment History">
          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Plan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payment.amount} {payment.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {payment.subscription.plan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No payment history available</p>
            </div>
          )}
        </Card>
      )}

      {/* Cancel Subscription Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Subscription"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-gray-600">
                Are you sure you want to cancel your Pro subscription? You will:
              </p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Lose access to unlimited notes</li>
                <li>• Be limited to 3 notes on the free plan</li>
                <li>• Lose priority support</li>
              </ul>
              <p className="mt-3 text-sm text-gray-500">
                Your subscription will remain active until {currentSubscription && formatDate(currentSubscription.endDate)}.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelSubscription}
              loading={isLoading}
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subscription;