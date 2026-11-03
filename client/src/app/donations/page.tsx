'use client';

import React, { useState, useEffect } from 'react';
import {
  HandCoins,
  ShieldCheck,
  Receipt,
  FileCheck2,
  TrendingUp,
  CreditCard,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Printer,
  X,
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

export default function DonationsPage() {
  const { t } = useI18n();
  const { user, isAdmin } = useAuth();

  const [funds, setFunds] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'funds' | 'history' | 'audit'>('funds');
  const [loading, setLoading] = useState(true);

  // Donation Form Modal
  const [donateFund, setDonateFund] = useState<any>(null);
  const [donorName, setDonorName] = useState(user?.profile?.full_name || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [donorPan, setDonorPan] = useState('');
  const [amount, setAmount] = useState('5100');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [donationSuccess, setDonationSuccess] = useState<any>(null);

  // Printable Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const fRes = await fetchApi('/donations/funds');
      setFunds(fRes.funds || []);

      const dRes = await fetchApi('/donations/history');
      setDonations(dRes.donations || []);

      if (isAdmin) {
        const rRes = await fetchApi('/donations/reports');
        setReports(rRes.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateFund || !donorName || !donorPhone || !amount) return;

    try {
      const res = await fetchApi('/donations/donate', {
        method: 'POST',
        body: JSON.stringify({
          fund_type: donateFund.id,
          donor_name: donorName,
          donor_phone: donorPhone,
          donor_pan: donorPan,
          amount: Number(amount),
          payment_mode: paymentMode,
        }),
      });

      setDonationSuccess(res);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Donation failed.');
    }
  };

  const handleOpenReceipt = async (receiptNum: string) => {
    try {
      const res = await fetchApi(`/donations/receipt/${receiptNum}`);
      setActiveReceipt(res.receipt);
    } catch (err: any) {
      alert(err.message || 'Failed to load receipt.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-samaj-navy-950 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <HandCoins className="w-3.5 h-3.5" />
            <span>Samaj Welfare & Development Funds</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Samaj Development & Education Support Funds
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Support higher education scholarships, student hostel development, and medical aid funds with instant 80G tax-exempt digital receipts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs sm:text-sm font-bold overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('funds')}
          className={`pb-2.5 px-3 sm:px-4 border-b-2 whitespace-nowrap transition touch-manipulation ${
            activeTab === 'funds'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Active Funds
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-3 sm:px-4 border-b-2 whitespace-nowrap transition touch-manipulation ${
            activeTab === 'history'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Donation History & Receipts
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-3 sm:px-4 border-b-2 whitespace-nowrap transition touch-manipulation ${
              activeTab === 'audit'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Financial Transparency Audit
          </button>
        )}
      </div>

      {/* TAB 1: FUNDS */}
      {activeTab === 'funds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {funds.map((f) => {
            const collected = Number(f.collected_amount);
            const target = Number(f.target_amount);
            const percentage = Math.min(Math.round((collected / target) * 100), 100);

            return (
              <div
                key={f.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                        {f.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider">
                        Target: ₹{target.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 shrink-0">
                      <HandCoins className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {f.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">
                        Raised: <strong className="text-emerald-700">₹{collected.toLocaleString('en-IN')}</strong>
                      </span>
                      <span className="text-slate-400">
                        Goal: ₹{target.toLocaleString('en-IN')} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>80G Tax Exempt</span>
                  </span>

                  <button
                    onClick={() => {
                      setDonateFund(f);
                      setDonationSuccess(null);
                    }}
                    className="px-4 py-2 bg-samaj-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition touch-manipulation active:scale-95"
                  >
                    Donate Online
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DONATION HISTORY & RECEIPTS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-samaj-navy">
            Recent Community Donation Receipts
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                <tr>
                  <th className="py-3 px-3 sm:px-4">Receipt #</th>
                  <th className="py-3 px-3 sm:px-4">Donor Name</th>
                  <th className="py-3 px-3 sm:px-4">Fund Type</th>
                  <th className="py-3 px-3 sm:px-4">Amount</th>
                  <th className="py-3 px-3 sm:px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3 sm:px-4 font-mono font-bold text-samaj-navy">
                      {d.receipt_number}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-900">
                      {d.donor_name}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">{d.fund_name || d.fund_type}</td>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-emerald-700">
                      ₹{Number(d.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <button
                        onClick={() => handleOpenReceipt(d.receipt_number)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-samaj-navy hover:text-white rounded-lg font-bold transition flex items-center gap-1 ml-auto touch-manipulation active:scale-95"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN AUDIT & BALANCE SHEET */}
      {activeTab === 'audit' && reports && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-700 uppercase">Total Income Raised</span>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                ₹{Number(reports.totalIncome).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200">
              <span className="text-xs font-bold text-rose-700 uppercase">Total Expenses</span>
              <div className="text-2xl font-black text-rose-900 mt-1">
                ₹{Number(reports.totalExpenses).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase">Net Samaj Balance</span>
              <div className="text-2xl font-black text-amber-950 mt-1">
                ₹{Number(reports.netSurplus).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900">Recent Expenditure Vouchers</h4>
            <div className="space-y-2 text-xs">
              {reports.recentExpenses?.map((e: any) => (
                <div key={e.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border">
                  <div>
                    <span className="font-bold text-slate-900">{e.title}</span>
                    <span className="text-slate-500 block">{e.category} • {e.date}</span>
                  </div>
                  <span className="font-bold text-rose-700">-₹{Number(e.amount).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Donation Form */}
      {donateFund && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom,16px)]">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-samaj-navy">Donate to {donateFund.name}</h3>
              <button onClick={() => setDonateFund(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>

            {donationSuccess ? (
              <div className="py-6 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">
                  Donation Received! Thank you for your support.
                </h4>
                <p className="text-xs text-slate-600">
                  Receipt Number: <strong className="font-mono text-samaj-navy">{donationSuccess.receiptNumber}</strong>
                </p>
                <button
                  onClick={() => {
                    handleOpenReceipt(donationSuccess.receiptNumber);
                    setDonateFund(null);
                  }}
                  className="px-5 py-2.5 bg-samaj-navy text-white text-xs font-bold rounded-xl touch-manipulation"
                >
                  View Digital Receipt
                </button>
              </div>
            ) : (
              <form onSubmit={handleDonateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Donor Name</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">PAN Card (For 80G Exemption)</label>
                  <input
                    type="text"
                    value={donorPan}
                    onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Donation Amount (₹)</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {['1100', '2100', '5100', '11000'].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setAmount(amt)}
                        className={`py-1.5 rounded-lg border font-bold text-xs ${
                          amount === amt ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-slate-50'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    min={100}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition touch-manipulation active:scale-98"
                >
                  Confirm & Generate 80G Receipt
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Printable Receipt */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-[env(safe-area-inset-bottom,16px)]">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-samaj-navy">Digital Donation Receipt</h3>
              <button onClick={() => setActiveReceipt(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs border p-4 rounded-2xl bg-amber-50/20 border-amber-200">
              <div className="text-center space-y-1 pb-3 border-b border-amber-200">
                <h4 className="font-extrabold text-base text-samaj-navy">
                  Shree Rajgor Brahman Seva Samiti
                </h4>
                <p className="text-[10px] text-slate-500">Ahmedabad, Gujarat • Reg. Charity Portal</p>
                <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  80G Income Tax Exemption Receipt
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Receipt No:</span>
                  <span className="font-mono font-bold text-slate-900">{activeReceipt.receipt_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(activeReceipt.created_at).toLocaleDateString('en-US')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Donor Name:</span>
                  <span className="font-bold text-slate-900">{activeReceipt.donor_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">PAN Number:</span>
                  <span className="font-bold text-slate-900">{activeReceipt.donor_pan || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Fund:</span>
                  <span className="font-bold text-slate-900">{activeReceipt.fund_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Amount:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    ₹{Number(activeReceipt.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t text-[10px] text-slate-400 text-center">
                This is a computer generated digital receipt. No signature required.
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-4 w-full py-3 bg-samaj-navy text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition touch-manipulation active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
