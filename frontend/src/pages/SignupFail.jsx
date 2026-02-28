import { Link, useSearchParams } from 'react-router-dom';

/**
 * /signup/fail
 * SSLCommerz redirects here after a failed or cancelled subscription payment.
 */
export default function SignupFail() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  const isCancelled = reason === 'payment_cancelled';
  const title = isCancelled ? 'Payment Cancelled' : 'Payment Failed';
  const description = isCancelled
    ? "You cancelled the payment. Your store has been created but is not yet active. You can complete payment to activate it."
    : "Something went wrong with your payment. Don't worry — your store has been saved. You can try again.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Fail icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          {isCancelled ? (
            <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600 mb-8">{description}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-6 py-3 rounded-xl font-medium transition"
          >
            Log In Instead
          </Link>
        </div>

        <div className="mt-10 p-4 bg-gray-50 rounded-xl text-left text-sm text-gray-500">
          <p className="font-medium text-gray-700 mb-1">Need help?</p>
          <p>If you were charged but your store wasn't activated, contact us at{' '}
            <a href="mailto:support@ecomai.dev" className="text-primary-600 hover:underline">support@ecomai.dev</a>{' '}
            and we'll sort it out immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
