"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '../components/LanguageProvider';

// Types
 type Method = 'zain' | 'asia' | 'knet' | 'bank' | 'cod';
 type Step = 1 | 2 | 3 | 4;

// Basic Luhn check for card numbers
function luhnValid(card: string) {
  const digits = card.replace(/\D/g, '');
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits.charAt(i), 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

const labels = {
  en: {
    selectMethod: 'Select a payment method',
    zain: 'Zain Cash',
    asia: 'AsiaHawala',
    knet: 'KNET',
    bank: 'Local Bank Transfer',
    cod: 'Cash on Delivery',
    desc: {
      zain: 'Pay securely using your Zain Cash mobile wallet',
      asia: 'Pay with AsiaHawala wallet linked to your mobile',
      knet: 'Pay by card through KNET',
      bank: 'Transfer from your local bank account',
      cod: 'Pay in cash when you receive your ticket/service',
    },
    continue: 'Continue',
    back: 'Back',
    review: 'Review & Confirm',
    payNow: 'Pay Now',
    savedPref: 'Save as my preferred method',
    amount: 'Amount',
    phone: 'Mobile Number',
    cardNumber: 'Card Number',
    cardName: 'Cardholder Name',
    expiry: 'Expiry (MM/YY)',
    cvv: 'CVV',
    bankName: 'Bank Name',
    account: 'Account Number / IBAN',
    reference: 'Transfer Reference',
    address: 'Address',
    name: 'Full Name',
    processing: 'Processing payment...',
    success: 'Payment Successful',
    failed: 'Payment Failed',
    receipt: 'Receipt',
    context: {
      sponsorship: 'Sponsorship Payment',
      order: 'Order Payment'
    }
  },
  ar: {
    selectMethod: 'اختر طريقة الدفع',
    zain: 'زين كاش',
    asia: 'آسيا حوالة',
    knet: 'كي نت',
    bank: 'تحويل بنكي محلي',
    cod: 'الدفع عند الاستلام',
    desc: {
      zain: 'ادفع بأمان عبر محفظة زين كاش',
      asia: 'ادفع بواسطة محفظة آسيا حوالة المرتبطة برقمك',
      knet: 'ادفع بالبطاقة عبر كي نت',
      bank: 'حوّل من حسابك البنكي المحلي',
      cod: 'ادفع نقداً عند استلام التذكرة/الخدمة',
    },
    continue: 'متابعة',
    back: 'رجوع',
    review: 'مراجعة وتأكيد',
    payNow: 'ادفع الآن',
    savedPref: 'احفظ كطريقتي المفضلة',
    amount: 'المبلغ',
    phone: 'رقم الهاتف',
    cardNumber: 'رقم البطاقة',
    cardName: 'اسم حامل البطاقة',
    expiry: 'تاريخ الانتهاء (شهر/سنة)',
    cvv: 'رمز الأمان',
    bankName: 'اسم البنك',
    account: 'رقم الحساب / الآيبان',
    reference: 'رقم التحويل',
    address: 'العنوان',
    name: 'الاسم الكامل',
    processing: 'جاري معالجة الدفع...',
    success: 'تم الدفع بنجاح',
    failed: 'فشل الدفع',
    receipt: 'الإيصال',
    context: {
      sponsorship: 'دفع الرعاية',
      order: 'دفع الطلب'
    }
  },
  ku: {
    selectMethod: 'ڕێگای پارەدان هەڵبژێرە',
    zain: 'Zain Cash',
    asia: 'AsiaHawala',
    knet: 'KNET',
    bank: 'گواستنەوەی بانکێکی ناوخۆیی',
    cod: 'پارەدان لە کاتی گەیاندن',
    desc: {
      zain: 'بە ئاسایش بە پۆلەکەی Zain Cash پارە بدە',
      asia: 'بە موڵکەی AsiaHawalaی پەیوەست بە ژمارەکەت پارە بدە',
      knet: 'بە کارتی KNET پارە بدە',
      bank: 'لە هەژماری بانکەکەت بنێرە',
      cod: 'کاتێک خزمەتگوزاریەکە دەگەیت پارە بدە',
    },
    continue: 'بەرەو پێشەوە',
    back: 'گەڕانەوە',
    review: 'پێشبینین و دڵنیاکردنەوە',
    payNow: 'ئێستا پارە بدە',
    savedPref: 'وەک هەڵبژاردەی دڵخواز پاشەکەوت بکە',
    amount: 'بڕ',
    phone: 'ژمارەی مۆبایل',
    cardNumber: 'ژمارەی کارد',
    cardName: 'ناوی خاوەنی کارد',
    expiry: 'بەسەرچوون (MM/YY)',
    cvv: 'CVV',
    bankName: 'ناوی بانک',
    account: 'ژمارەی هەژمار / IBAN',
    reference: 'ژمارەی گواستنەوە',
    address: 'ناونیشان',
    name: 'ناوی تەواو',
    processing: 'پرۆسەی پارەدان دەکرێت...',
    success: 'پارەدان سەرکەوتوو بوو',
    failed: 'پارەدان سەرنەکەوتوو بوو',
    receipt: 'وەرەقەی پارەدان',
    context: {
      sponsorship: 'پارەدانی پشتگیری',
      order: 'پارەدانی داواکارین'
    }
  }
} as const;

export default function PayPage() {
  function VoucherModal({ onClose, onCreated }: { onClose: () => void; onCreated: (code: string) => void }) {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('07');
    const [email, setEmail] = useState('');
    const [amountIQD, setAmountIQD] = useState(10000);
    const [intendedUse, setIntendedUse] = useState<'sponsorship'|'ticket'>('sponsorship');
    const [preferredMethod, setPreferredMethod] = useState<'FIB'|'QI'|'FASTPAY'|'BANK'|'COD'>('FIB');
    const [address, setAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="bg-white rounded-xl w-full max-w-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Request Voucher</div>
            <button onClick={onClose} aria-label="Close" className="text-gray-600 hover:text-gray-900">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="rounded-lg border px-3 py-2" />
            <input placeholder="Mobile (+964)" value={mobile} onChange={e=>setMobile(e.target.value)} className="rounded-lg border px-3 py-2" />
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="rounded-lg border px-3 py-2" />
            <input placeholder="Amount (IQD)" type="number" value={amountIQD} onChange={e=>setAmountIQD(Number(e.target.value)||0)} className="rounded-lg border px-3 py-2" />
            <select value={intendedUse} onChange={e=>setIntendedUse(e.target.value as any)} className="rounded-lg border px-3 py-2">
              <option value="sponsorship">Sponsorship</option>
              <option value="ticket">Ticket</option>
            </select>
            <select value={preferredMethod} onChange={e=>setPreferredMethod(e.target.value as any)} className="rounded-lg border px-3 py-2">
              <option value="FIB">FIB</option>
              <option value="QI">QI Card</option>
              <option value="FASTPAY">FAST PAY</option>
              <option value="BANK">Bank</option>
              <option value="COD">COD</option>
            </select>
            <input placeholder="Address (optional)" value={address} onChange={e=>setAddress(e.target.value)} className="sm:col-span-2 rounded-lg border px-3 py-2" />
          </div>
          <div className="mt-3 text-xs text-gray-500">Approval: 24–48h • العربية/کوردی supported</div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded border text-sm">Cancel</button>
            <button disabled={submitting} onClick={async ()=>{
              setSubmitting(true);
              try {
                const res = await fetch('/api/vouchers/request', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, mobile, email, amountIQD, intendedUse, preferredMethod, address })});
                const data = await res.json();
                if (data?.code) onCreated(data.code);
              } finally {
                setSubmitting(false); onClose();
              }
            }} className={`px-4 py-2 rounded-lg ${submitting? 'bg-gray-200 text-gray-500':'bg-gray-900 text-white'}`}>Submit</button>
          </div>
        </div>
      </div>
    );
  }
  const params = useSearchParams();
  const router = useRouter();
  const { language, isRTL } = useLanguage();
  const t = labels[language] || labels.en;

  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState<Method>('zain');
  const [savePref, setSavePref] = useState(true);

  // Values
  const [amount, setAmount] = useState<number>(() => {
    const a = parseFloat(params.get('amount') || '0');
    return isFinite(a) && a > 0 ? a : 10;
  });
  const context = params.get('context') as 'sponsorship' | 'order' | null;

  // Form state per method
  const [zainPhone, setZainPhone] = useState('079');
  const [asiaPhone, setAsiaPhone] = useState('077');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [codName, setCodName] = useState('');
  const [codPhone, setCodPhone] = useState('07');
  const [codAddress, setCodAddress] = useState('');

const [processing, setProcessing] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherMsg, setVoucherMsg] = useState<string | null>(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; receiptId?: string } | null>(null);

  // Load preferred method
  useEffect(() => {
    try {
      const pref = localStorage.getItem('preferredPaymentMethod') as Method | null;
      if (pref) setMethod(pref);
    } catch {}
  }, []);

  // Save preference (only method type, never sensitive fields)
  useEffect(() => {
    if (savePref) {
      try { localStorage.setItem('preferredPaymentMethod', method); } catch {}
    }
  }, [method, savePref]);

  const isValid = useMemo(() => {
    switch (step) {
      case 1:
        return !!method;
      case 2:
        if (method === 'zain') return /^079\d{8}$/.test(zainPhone);
        if (method === 'asia') return /^077\d{8}$/.test(asiaPhone);
        if (method === 'knet') {
          const digits = cardNumber.replace(/\s+/g, '');
          const expOk = /^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry);
          const cvvOk = /^\d{3,4}$/.test(cvv);
          return cardName.trim().length >= 3 && digits.length >= 12 && digits.length <= 19 && luhnValid(digits) && expOk && cvvOk;
        }
        if (method === 'bank') return bankName.trim().length >= 2 && bankAccount.trim().length >= 8 && bankRef.trim().length >= 4;
        if (method === 'cod') return codName.trim().length >= 3 && /^07\d{9}$/.test(codPhone) && codAddress.trim().length >= 8;
        return false;
      case 3:
        return true;
      default:
        return false;
    }
  }, [step, method, zainPhone, asiaPhone, cardName, cardNumber, expiry, cvv, bankName, bankAccount, bankRef, codName, codPhone, codAddress]);

  async function submit() {
    setProcessing(true);
    setResult(null);
    try {
      // Create intent (mock)
      await fetch('/api/payments/intent', { method: 'POST', body: JSON.stringify({ amount, method, context }) });
      // Confirm (mock)
      const res = await fetch('/api/payments/confirm', { method: 'POST', body: JSON.stringify({ method, amount, context }) });
      const data = await res.json();
      setResult({ ok: true, receiptId: data.receiptId });
      setStep(4);
    } catch (e) {
      setResult({ ok: false });
      setStep(4);
    } finally {
      setProcessing(false);
    }
  }

  const MethodCard = ({ id, title, desc, icon }: { id: Method; title: string; desc: string; icon: string }) => (
    <button
      onClick={() => setMethod(id)}
      className={`text-left p-4 rounded-xl border transition-all hover:shadow-sm ${method === id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'}`}
    >
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 font-semibold">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </button>
  );

  const StepIndicator = () => (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center justify-center gap-2 text-sm mb-6`}>
      {[1,2,3,4].map(n => (
        <div key={n} className={`h-2 rounded-full ${n <= step ? 'bg-blue-600' : 'bg-gray-200'} w-10`}/>
      ))}
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${isRTL ? 'rtl' : ''}`}
         dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm text-gray-500">{context ? t.context[context] : ''}</div>
          <h2 className="text-xl font-bold text-gray-900">{t.amount}: ${amount.toFixed(2)}</h2>
        </div>
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 text-sm">{t.back}</button>
      </div>

      <StepIndicator />

      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">{t.selectMethod}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MethodCard id="zain" title={t.zain} desc={t.desc.zain} icon="📱" />
            <MethodCard id="asia" title={t.asia} desc={t.desc.asia} icon="📲" />
            <MethodCard id="knet" title={t.knet} desc={t.desc.knet} icon="💳" />
            <MethodCard id="bank" title={t.bank} desc={t.desc.bank} icon="🏦" />
            <MethodCard id="cod" title={t.cod} desc={t.desc.cod} icon="🚚" />
          </div>
          <div className="mt-6 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={savePref} onChange={e => setSavePref(e.target.checked)} className="rounded border-gray-300" />
              {t.savedPref}
            </label>
            <button disabled={!isValid} onClick={() => setStep(2)} className={`px-5 py-2.5 rounded-lg ${isValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>{t.continue}</button>
          </div>
        </div>
      )}

      {step === 2 && (
<div className="space-y-1">
              <label className="text-sm font-semibold">Voucher</label>
              <div className="flex gap-2">
                <input value={voucherCode} onChange={e=>setVoucherCode(e.target.value)} placeholder="Enter voucher / أدخل القسيمة / فۆچەر" className="flex-1 rounded-lg border px-3 py-2" />
                <button onClick={async ()=>{
                  setVoucherMsg(null);
                  const res = await fetch('/api/vouchers/redeem', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code: voucherCode })});
                  const data = await res.json();
                  if (data?.success) setVoucherMsg(`Redeemed IQD ${data.amountIQD}`);
                  else setVoucherMsg(data?.error || 'Invalid voucher');
                }} className="px-3 py-2 rounded-lg bg-gray-900 text-white">Redeem</button>
              </div>
              {voucherMsg && <div className="text-xs text-gray-600">{voucherMsg}</div>}
              <button className="text-xs text-blue-600 hover:underline" onClick={()=>setShowVoucher(true)}>Request Voucher</button>
          {method === 'zain' && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t.phone} (079-xxxxxxx)</label>
              <input value={zainPhone} onChange={e => setZainPhone(e.target.value.replace(/[^\d]/g, ''))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="079xxxxxxxx" />
              {!/^079\d{8}$/.test(zainPhone) && <p className="text-xs text-red-600 mt-1">Enter a valid Zain number starting with 079</p>}
            </div>
          )}
          {method === 'asia' && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t.phone} (077-xxxxxxx)</label>
              <input value={asiaPhone} onChange={e => setAsiaPhone(e.target.value.replace(/[^\d]/g, ''))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="077xxxxxxxx" />
              {!/^077\d{8}$/.test(asiaPhone) && <p className="text-xs text-red-600 mt-1">Enter a valid AsiaCell number starting with 077</p>}
            </div>
          )}
          {method === 'knet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">{t.cardName}</label>
                <input value={cardName} onChange={e => setCardName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" autoComplete="cc-name" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">{t.cardNumber}</label>
                <input value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/[^\d\s]/g, ''))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" inputMode="numeric" autoComplete="cc-number" placeholder="•••• •••• •••• ••••" />
                {cardNumber.replace(/\s/g, '').length > 0 && !luhnValid(cardNumber) && <p className="text-xs text-red-600 mt-1">Invalid card number</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t.expiry}</label>
                <input value={expiry} onChange={e => setExpiry(e.target.value.replace(/[^\d/]/g, ''))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t.cvv}</label>
                <input value={cvv} onChange={e => setCvv(e.target.value.replace(/[^\d]/g, ''))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" inputMode="numeric" autoComplete="off" placeholder="•••" />
              </div>
              <p className="md:col-span-2 text-xs text-gray-500">For your security, card details aren’t stored.</p>
            </div>
          )}
          {method === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t.bankName}</label>
                <input value={bankName} onChange={e => setBankName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t.account}</label>
                <input value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">{t.reference}</label>
                <input value={bankRef} onChange={e => setBankRef(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                <p className="text-xs text-gray-500 mt-1">Enter the reference/receipt number after transferring</p>
              </div>
            </div>
          )}
          {method === 'cod' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t.name}</label>
                <input value={codName} onChange={e => setCodName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t.phone}</label>
                <input value={codPhone} onChange={e => setCodPhone(e.target.value.replace(/[^\d]/g, ''))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="07xxxxxxxxx" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">{t.address}</label>
                <textarea value={codAddress} onChange={e => setCodAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 h-24" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">{t.back}</button>
            <button disabled={!isValid} onClick={() => setStep(3)} className={`px-5 py-2.5 rounded-lg ${isValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>{t.continue}</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t.review}</h3>
          <div className="rounded-xl border p-4 text-sm grid grid-cols-1 gap-2">
            <div><span className="text-gray-500">Method:</span> {t[method]}</div>
            <div><span className="text-gray-500">{t.amount}:</span> ${amount.toFixed(2)}</div>
            {method === 'zain' && <div><span className="text-gray-500">{t.phone}:</span> {zainPhone}</div>}
            {method === 'asia' && <div><span className="text-gray-500">{t.phone}:</span> {asiaPhone}</div>}
            {method === 'knet' && <div><span className="text-gray-500">{t.cardNumber}:</span> **** **** **** {cardNumber.replace(/\D/g, '').slice(-4) || '••••'}</div>}
            {method === 'bank' && <div><span className="text-gray-500">{t.bankName}:</span> {bankName} • <span className="text-gray-500">{t.reference}:</span> {bankRef}</div>}
            {method === 'cod' && <div><span className="text-gray-500">{t.name}:</span> {codName} • <span className="text-gray-500">{t.phone}:</span> {codPhone}</div>}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">{t.back}</button>
            <button onClick={submit} className={`px-5 py-2.5 rounded-lg ${processing ? 'bg-gray-200 text-gray-500' : 'bg-green-600 hover:bg-green-700 text-white'}`} disabled={processing}>
              {processing ? t.processing : t.payNow}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className={`rounded-xl p-4 border ${result?.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${result?.ok ? 'bg-green-600' : 'bg-red-600'}`}>
                <span className="text-white">{result?.ok ? '✓' : '!'}</span>
              </div>
              <div>
                <div className="text-lg font-semibold">{result?.ok ? t.success : t.failed}</div>
                <div className="text-sm text-gray-600">{result?.ok ? t.receipt + ': ' + (result?.receiptId || '—') : 'Please try another method or contact support.'}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button onClick={() => router.push('/dashboard')} className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800">Back to Dashboard</button>
          </div>
        </div>
      )}
      {showVoucher && (
        <VoucherModal onClose={()=>setShowVoucher(false)} onCreated={(code)=>setVoucherMsg(`Requested • Code: ${code}`)} />
      )}
    </div>
  );
}
