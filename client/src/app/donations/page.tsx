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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-samaj-navy-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <HandCoins className="w-3.5 h-3.5" />
            <span>સમાજ સેવા નિધિ અને દાન પ્રણાલી</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('donations_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('donations_sub')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-bold">
        <button
          onClick={() => setActiveTab('funds')}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === 'funds'
              ? 'border-samaj-gold text-samaj-navy'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          સક્રિય સેવા ફંડ (Active Funds)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === 'history'
              ? 'border-samaj-gold text-samaj-navy'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          દાતા યાદી અને પાવતી (Donation Receipts)
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 border-b-2 transition ${
              activeTab === 'audit'
                ? 'border-samaj-gold text-samaj-navy'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            નાણાકીય બેલેન્સ શીટ (Transparency Audit)
          </button>
        )}
      </div>

      {/* TAB 1: FUNDS */}
      {activeTab === 'funds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {funds.map((f) => {
            const collected = Number(f.collected_amount);
            const target = Number(f.target_amount);
            const percentage = Math.min(Math.round((collected / target) * 100), 100);

            return (
              <div
                key={f.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                        {f.name_gu || f.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {f.name}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 text-samaj-gold-700 shrink-0">
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
                        એકત્રિત: <strong className="text-emerald-700">₹{collected.toLocaleString('en-IN')}</strong>
                      </span>
                      <span className="text-slate-400">
                        લક્ષ્યાંક: ₹{target.toLocaleString('en-IN')} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-samaj-gold to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>80G કરમુક્તિ માન્ય</span>
                  </span>

                  <button
                    onClick={() => {
                      setDonateFund(f);
                      setDonationSuccess(null);
                    }}
                    className="px-5 py-2.5 bg-samaj-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    {t('donate_now')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DONATION HISTORY & RECEIPTS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <h3 className="font-bold text-base text-samaj-navy">
            તાજેતરની દાન પાવતીઓ (Recent Digital Receipts)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                <tr>
                  <th className="py-3 px-4">પાવતી નં.</th>
                  <th className="py-3 px-4">દાતાશ્રીનું નામ</th>
                  <th className="py-3 px-4">ફંડ પ્રકાર</th>
                  <th className="py-3 px-4">રકમ</th>
                  <th className="py-3 px-4">તારીખ</th>
                  <th className="py-3 px-4 text-right">પાવતી ડાઉનલોડ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-samaj-navy">
                      {d.receipt_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {d.donor_name}
                    </td>
                    <td className="py-3.5 px-4">{d.fund_name || d.fund_type}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{Number(d.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(d.created_at).toLocaleDateString('gu-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReceipt(d.receipt_number)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-samaj-navy hover:text-white rounded-lg font-bold transition flex items-center gap-1.5 ml-auto"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>જુઓ / પ્રિન્ટ</span>
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
              <span className="text-xs font-bold text-emerald-700 uppercase">કુલ એકત્રિત દાન (Total Income)</span>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                ₹{Number(reports.totalIncome).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200">
              <span className="text-xs font-bold text-rose-700 uppercase">કુલ સેવા ખર્ચ (Total Expenses)</span>
              <div className="text-2xl font-black text-rose-900 mt-1">
                ₹{Number(reports.totalExpenses).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase">શિલ્લક સિલક (Net Treasury Balance)</span>
              <div className="text-2xl font-black text-amber-950 mt-1">
                ₹{Number(reports.netSurplus).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-subtle space-y-4">
            <h4 className="font-bold text-sm text-slate-900">તાજેતરના સમિતિ ખર્ચ વાઉચર</h4>
            <div className="space-y-2 text-xs">
              {reports.recentExpenses?.map((e: any) => (
                <div key={e.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border">
                  <div>
                    <span className="font-bold text-slate-900">{e.title}</span>
                    <span className="text-slate-500 block">{e.category} | {e.date}</span>
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-samaj-navy">ઓનલાઇન દાન ફોર્મ</h3>
              <button onClick={() => setDonateFund(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {donationSuccess ? (
              <div className="py-6 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">
                  દાન સ્વીકારાયું! આપનો ખૂબ ખૂબ આભાર.
                </h4>
                <p className="text-xs text-slate-600">
                  પાવતી નંબર: <strong className="font-mono text-samaj-navy">{donationSuccess.receiptNumber}</strong>
                </p>
                <button
                  onClick={() => {
                    handleOpenReceipt(donationSuccess.receiptNumber);
                    setDonateFund(null);
                  }}
                  className="px-5 py-2.5 bg-samaj-navy text-white text-xs font-bold rounded-xl"
                >
                  ડિજિટલ પાવતી જુઓ (View Receipt)
                </button>
              </div>
            ) : (
              <form onSubmit={handleDonateSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-slate-500 block">દાન ફંડ:</span>
                  <span className="font-bold text-slate-900 text-sm">{donateFund.name_gu || donateFund.name}</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">દાતાશ્રીનું નામ (Donor Name) *</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">મોબાઇલ નંબર *</label>
                    <input
                      type="tel"
                      required
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PAN નંબર (80G માટે)</label>
                    <input
                      type="text"
                      value={donorPan}
                      onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">દાન રકમ (Amount in ₹) *</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {['1100', '2100', '5100', '11000'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`py-1.5 rounded-lg border font-bold transition ${
                          amount === val ? 'bg-samaj-navy text-white' : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    required
                    min={100}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ચુકવણી પદ્ધતિ</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="UPI">UPI / Google Pay / PhonePe</option>
                    <option value="Net Banking">Net Banking / NEFT</option>
                    <option value="Cheque">ચેક / ડિમાન્ડ ડ્રાફ્ટ (Cheque)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-samaj-gold hover:bg-samaj-gold-500 text-slate-950 font-bold rounded-xl shadow-xs transition"
                >
                  દાન સબમિટ કરો અને પાવતી મેળવો
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Official Digital 80G Receipt */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <span className="text-xs font-bold text-slate-400">સત્તાવાર ડિજિટલ દાન પાવતી</span>
              <button onClick={() => setActiveReceipt(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Canvas */}
            <div className="border-2 border-samaj-gold/50 rounded-2xl p-5 space-y-4 bg-amber-50/20 text-xs">
              <div className="text-center space-y-1 pb-3 border-b border-slate-200">
                <div className="font-black text-base text-samaj-navy">રાજગોર બ્રાહ્મણ સમાજ ટ્રસ્ટ</div>
                <div className="text-[10px] text-slate-500">{activeReceipt.samaj_address}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Trust Reg: {activeReceipt.trust_reg_no} | {activeReceipt.tax_exempt_section}
                </div>
              </div>

              <div className="flex justify-between font-mono font-bold text-slate-700">
                <span>પાવતી નં: {activeReceipt.receipt_number}</span>
                <span>તારીખ: {new Date(activeReceipt.created_at).toLocaleDateString('gu-IN')}</span>
              </div>

              <div className="space-y-2 py-2">
                <div>
                  <span className="text-slate-500 block">શ્રી/શ્રીમતી:</span>
                  <span className="font-extrabold text-sm text-slate-900">{activeReceipt.donor_name}</span>
                </div>
                {activeReceipt.donor_pan && (
                  <div>
                    <span className="text-slate-500 block">PAN Card:</span>
                    <span className="font-mono font-bold text-slate-800">{activeReceipt.donor_pan}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block">હેતુ (Fund Purpose):</span>
                  <span className="font-semibold text-slate-800">{activeReceipt.fund_name_gu || activeReceipt.fund_name}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border flex items-center justify-between">
                  <span className="font-bold text-slate-600">દાન રકમ:</span>
                  <span className="font-black text-base text-emerald-800">₹{Number(activeReceipt.amount).toLocaleString('en-IN')}/-</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                <div className="text-[10px] text-slate-400">
                  કોમ્પ્યુટર જનરેટેડ માન્ય ડિજિટલ પાવતી.<br />
                  આવકવેરા મુક્તિ માટે માન્ય.
                </div>
                <div className="text-center">
                  <div className="font-semibold text-samaj-navy text-[11px]">{activeReceipt.authorized_signatory}</div>
                  <div className="text-[9px] text-slate-400">ઓથોરાઇઝ્ડ સહી / ખજાનચી</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-samaj-navy text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>પ્રિન્ટ / PDF ડાઉનલોડ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
