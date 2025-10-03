// Iraqi Payment Service Provider integrations
// FIB, QI Card, FAST PAY

export type PSPResult = {
  success: boolean;
  redirectUrl?: string;
  error?: string;
  transactionId?: string;
  reference?: string;
};

type PaymentMethod = 'FIB' | 'QI' | 'FASTPAY';

// FIB Bank Integration
// Documentation: https://fib.iq/en/business-solutions/payment-gateway
export async function initiateFIBPayment(amount: number, currency: string = 'IQD', orderId: string): Promise<PSPResult> {
  const FIB_MERCHANT_ID = process.env.FIB_MERCHANT_ID;
  const FIB_SECRET_KEY = process.env.FIB_SECRET_KEY;
  const FIB_GATEWAY_URL = process.env.FIB_GATEWAY_URL || 'https://gateway.fib.iq/api/v1';
  
  if (!FIB_MERCHANT_ID || !FIB_SECRET_KEY) {
    return { success: false, error: 'FIB credentials not configured' };
  }

  try {
    const payload = {
      merchant_id: FIB_MERCHANT_ID,
      order_id: orderId,
      amount: amount,
      currency: currency,
      callback_url: `${process.env.NEXTAUTH_URL}/api/payments/callback/fib`,
      return_url: `${process.env.NEXTAUTH_URL}/pay?status=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pay?status=cancelled`,
    };
    
    // Generate signature (implementation depends on FIB's specific requirements)
    const signature = generateFIBSignature(payload, FIB_SECRET_KEY);
    
    const response = await fetch(`${FIB_GATEWAY_URL}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signature}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      return { success: false, error: `FIB API error: ${response.status}` };
    }
    
    const data = await response.json();
    return {
      success: true,
      redirectUrl: data.payment_url,
      transactionId: data.transaction_id,
      reference: data.reference,
    };
  } catch (error) {
    console.error('FIB payment initiation error:', error);
    return { success: false, error: 'FIB payment initiation failed' };
  }
}

// QI Card Integration
// Documentation: https://qi.iq/en/developers
export async function initiateQIPayment(amount: number, currency: string = 'IQD', orderId: string): Promise<PSPResult> {
  const QI_MERCHANT_ID = process.env.QI_MERCHANT_ID;
  const QI_API_KEY = process.env.QI_API_KEY;
  const QI_GATEWAY_URL = process.env.QI_GATEWAY_URL || 'https://api.qi.iq/v1';
  
  if (!QI_MERCHANT_ID || !QI_API_KEY) {
    return { success: false, error: 'QI Card credentials not configured' };
  }

  try {
    const payload = {
      merchant_id: QI_MERCHANT_ID,
      order_id: orderId,
      amount: amount,
      currency: currency,
      success_url: `${process.env.NEXTAUTH_URL}/api/payments/callback/qi?status=success`,
      failure_url: `${process.env.NEXTAUTH_URL}/api/payments/callback/qi?status=failed`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pay?status=cancelled`,
    };
    
    const response = await fetch(`${QI_GATEWAY_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': QI_API_KEY,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      return { success: false, error: `QI Card API error: ${response.status}` };
    }
    
    const data = await response.json();
    return {
      success: true,
      redirectUrl: data.redirect_url,
      transactionId: data.transaction_id,
      reference: data.payment_reference,
    };
  } catch (error) {
    console.error('QI Card payment initiation error:', error);
    return { success: false, error: 'QI Card payment initiation failed' };
  }
}

// FAST PAY Integration
// Documentation: https://www.fast-pay.iq/docs/api
export async function initiateFASTPAYPayment(amount: number, phoneNumber: string, orderId: string): Promise<PSPResult> {
  const FASTPAY_MERCHANT_ID = process.env.FASTPAY_MERCHANT_ID;
  const FASTPAY_API_KEY = process.env.FASTPAY_API_KEY;
  const FASTPAY_GATEWAY_URL = process.env.FASTPAY_GATEWAY_URL || 'https://api.fast-pay.iq/v1';
  
  if (!FASTPAY_MERCHANT_ID || !FASTPAY_API_KEY) {
    return { success: false, error: 'FAST PAY credentials not configured' };
  }

  try {
    const payload = {
      merchant_id: FASTPAY_MERCHANT_ID,
      order_id: orderId,
      amount: amount,
      currency: 'IQD',
      phone_number: phoneNumber,
      callback_url: `${process.env.NEXTAUTH_URL}/api/payments/callback/fastpay`,
      description: `Payment for order ${orderId}`,
    };
    
    const response = await fetch(`${FASTPAY_GATEWAY_URL}/mobile-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASTPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      return { success: false, error: `FAST PAY API error: ${response.status}` };
    }
    
    const data = await response.json();
    return {
      success: true,
      redirectUrl: data.payment_url || data.confirmation_url,
      transactionId: data.transaction_id,
      reference: data.reference_number,
    };
  } catch (error) {
    console.error('FAST PAY payment initiation error:', error);
    return { success: false, error: 'FAST PAY payment initiation failed' };
  }
}

// Helper function to generate FIB signature
function generateFIBSignature(payload: any, secretKey: string): string {
  // This implementation depends on FIB's specific signature requirements
  // Usually involves HMAC-SHA256 or similar
  const crypto = require('crypto');
  const sortedData = Object.keys(payload)
    .sort()
    .map(key => `${key}=${payload[key]}`)
    .join('&');
  
  return crypto
    .createHmac('sha256', secretKey)
    .update(sortedData)
    .digest('hex');
}

// Main PSP router function
export async function initiatePSPPayment(
  method: PaymentMethod,
  amount: number,
  orderId: string,
  phoneNumber?: string
): Promise<PSPResult> {
  switch (method) {
    case 'FIB':
      return await initiateFIBPayment(amount, 'IQD', orderId);
    case 'QI':
      return await initiateQIPayment(amount, 'IQD', orderId);
    case 'FASTPAY':
      if (!phoneNumber) {
        return { success: false, error: 'Phone number required for FAST PAY' };
      }
      return await initiateFASTPAYPayment(amount, phoneNumber, orderId);
    default:
      return { success: false, error: 'Unsupported payment method' };
  }
}