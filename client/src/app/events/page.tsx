'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, CheckCircle2, X } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

export default function EventsPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // RSVP Modal
  const [rsvpTarget, setRsvpTarget] = useState<any>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [rsvpNotes, setRsvpNotes] = useState('Attending with family members.');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/events?type=${activeTab}`);
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeTab]);

  const handleConfirmRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpTarget) return;

    try {
      await fetchApi(`/events/${rsvpTarget.id}/rsvp`, {
        method: 'POST',
        body: JSON.stringify({ guest_count: guestCount, notes: rsvpNotes }),
      });
      setRsvpSuccess(true);
      setTimeout(() => {
        setRsvpTarget(null);
        setRsvpSuccess(false);
        loadEvents();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'RSVP failed. Please login first.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-samaj-navy-950 via-slate-900 to-amber-950 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>Community Programs & Gatherings</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Samaj Events & Sneh Milan
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Official announcements, Sneh Milan gatherings, cultural programs, and instant RSVP attendance registration.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-2.5 px-3 sm:px-4 border-b-2 transition touch-manipulation ${
            activeTab === 'upcoming'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-2.5 px-3 sm:px-4 border-b-2 transition touch-manipulation ${
            activeTab === 'past'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Past Events
        </button>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-500 border border-slate-200 text-sm">
          No events scheduled currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  <img
                    src={ev.banner_url}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-samaj-navy/90 text-orange-400 text-xs font-bold backdrop-blur-xs">
                    {ev.city}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 text-white text-[11px] font-medium backdrop-blur-xs">
                    {ev.category}
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(ev.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="pt-2 text-xs font-semibold text-slate-700 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>{ev.venue_name}, {ev.address || ev.city}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-2">
                <span className="text-xs text-slate-500 font-medium">
                  {ev.rsvp_count || 0} Members Registered
                </span>

                {ev.is_registered ? (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>RSVP Confirmed</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Please sign in first.');
                        return;
                      }
                      setRsvpTarget(ev);
                    }}
                    className="px-4 py-2 bg-samaj-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition touch-manipulation active:scale-95"
                  >
                    Confirm Attendance (RSVP)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RSVP Modal */}
      {rsvpTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom,16px)]">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-samaj-navy">Confirm Event RSVP</h3>
              <button onClick={() => setRsvpTarget(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rsvpSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Your RSVP has been confirmed successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmRsvp} className="space-y-4 text-sm">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{rsvpTarget.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Venue: {rsvpTarget.venue_name}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Number of Guests Attending
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Family Info</label>
                  <textarea
                    rows={2}
                    value={rsvpNotes}
                    onChange={(e) => setRsvpNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-samaj-navy text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition touch-manipulation active:scale-98"
                >
                  Confirm RSVP Registration
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
