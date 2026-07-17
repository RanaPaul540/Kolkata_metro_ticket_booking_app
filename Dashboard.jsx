import React, { useState, useEffect } from 'react';
import { getTickets } from '../services/api';
import { Ticket, Clock, RefreshCw, Barcode, CheckCircle, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function Dashboard({ refreshTrigger }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTickets();
      setTickets(response.data);
      if (response.data.length > 0 && !selectedTicket) {
        setSelectedTicket(response.data[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve ticket records. Check PostgreSQL connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshTrigger]);

  const activeTickets = tickets.filter(t => t.status === 'ACTIVE');
  const expiredTickets = tickets.filter(t => t.status === 'EXPIRED');

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString('en-IN');
  };

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Bookings</span>
            <span className="text-2xl font-black text-[#0F2C59] mt-1 block">{tickets.length}</span>
          </div>
          <Ticket className="w-8 h-8 text-[#0F2C59] opacity-80" />
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Active Tickets</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{activeTickets.length}</span>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-600 animate-pulse-soft" />
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Expired Tickets</span>
            <span className="text-2xl font-black text-slate-500 mt-1 block">{expiredTickets.length}</span>
          </div>
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket List (Left 2 cols on wide) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#0F2C59]" />
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Official Booking Registry</h3>
            </div>
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {loading && tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
              <RefreshCw className="w-8 h-8 animate-spin text-[#0F2C59] mb-3" />
              <p className="text-xs">Fetching transactions from PostgreSQL...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 text-center">
              <Ticket className="w-12 h-12 text-slate-200 mb-3" />
              <p className="font-bold text-slate-500 text-sm">No ticket bookings detected</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">Select source and destination routes on the left panel to issue a QR ticket.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0F2C59] text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Ticket Number</th>
                    <th className="py-3 px-4">Origin</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Fare Paid</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Expires At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tickets.map((t) => {
                    const isSelected = selectedTicket?.id === t.id;
                    const isActive = t.status === 'ACTIVE';
                    
                    return (
                      <tr 
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`cursor-pointer transition hover:bg-slate-50 ${
                          isSelected ? 'bg-slate-100/80 border-l-4 border-l-[#0F2C59]' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{t.ticket_number}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{t.source_station}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{t.destination_station}</td>
                        <td className="py-3.5 px-4 font-bold text-[#128807]">₹{t.fare}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 border ${
                            isActive 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 animate-pulse-soft' 
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {formatTime(t.expires_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ticket QR/Detail Card View (Right 1 col on wide) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <Barcode className="w-5 h-5 text-[#0F2C59]" />
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Official QR Ticket</h3>
            </div>

            {selectedTicket ? (
              <div className="space-y-6">
                
                {/* Thermal printed paper train ticket mockup */}
                <div className="bg-white p-5 rounded-xl border border-slate-300 text-slate-800 shadow-sm relative overflow-hidden">
                  
                  {/* Decorative cutouts (Ticket punches) */}
                  <div className="absolute top-1/2 -left-3.5 w-7 h-7 rounded-full bg-slate-50 border border-slate-300" />
                  <div className="absolute top-1/2 -right-3.5 w-7 h-7 rounded-full bg-slate-50 border border-slate-300" />

                  {/* Header */}
                  <div className="flex justify-between items-center text-[9px] uppercase font-extrabold tracking-widest text-slate-900 mb-4 border-b border-slate-200 pb-2">
                    <span>Kolkata Metro Rail</span>
                    <span className="font-mono">{selectedTicket.ticket_number}</span>
                  </div>

                  {/* Journey details */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Boarding Station</span>
                      <span className="font-bold text-slate-800">{selectedTicket.source_station}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 py-0.5">
                      <div className="h-px bg-slate-200 flex-1 border-dashed border-b" />
                      <ArrowRight className="w-3.5 h-3.5 text-[#0F2C59]" />
                      <div className="h-px bg-slate-200 flex-1 border-dashed border-b" />
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Destination Station</span>
                      <span className="font-bold text-slate-800">{selectedTicket.destination_station}</span>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-dashed border-slate-300 my-4" />

                  {/* Simulated QR Code */}
                  <div className="bg-slate-50 p-3 rounded-lg max-w-[130px] mx-auto mb-4 border border-slate-200 flex flex-col items-center">
                    <div className="grid grid-cols-8 gap-0.5 w-24 h-24 bg-white p-1 border border-slate-100">
                      {[...Array(64)].map((_, i) => {
                        const isFilled = (i % 2 === 0 && i % 3 !== 0) || (i % 5 === 0) || (i < 8 && i % 3 === 0) || (i > 56 && i % 2 !== 0);
                        const isCorner = (i < 4 && i % 8 < 4) || (i < 32 && i >= 24 && i % 8 < 4) || (i % 8 >= 4 && i < 4);
                        return (
                          <div 
                            key={`qr-${i}`} 
                            className={`w-full h-full ${
                              selectedTicket.status === 'ACTIVE' 
                                ? (isFilled || isCorner ? 'bg-slate-900' : 'bg-transparent')
                                : 'bg-slate-200'
                            }`} 
                          />
                        );
                      })}
                    </div>
                    <span className="text-[8px] font-bold font-mono text-slate-500 mt-2 select-all tracking-wider">{selectedTicket.ticket_number}</span>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-dashed border-slate-300 my-4" />

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 text-[9px] font-bold">
                    <div>
                      <span className="text-slate-400 block uppercase">Fare Paid</span>
                      <span className="text-[#128807] font-extrabold text-sm">₹{selectedTicket.fare}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block uppercase">Status</span>
                      <span className={`font-bold uppercase text-[9px] px-1.5 py-0.5 rounded border ${
                        selectedTicket.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expiration warning banner */}
                {selectedTicket.status === 'ACTIVE' ? (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[10px] text-slate-650 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span>Expires: <strong className="text-slate-800">{formatTime(selectedTicket.expires_at)}</strong>. Valid for one-way journey within 30 minutes from booking.</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-[10px] text-slate-500 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                    <div>
                      <span>This QR ticket is expired. Please generate a new transit token from the route planner.</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 text-center">
                <Ticket className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-xs">Select a purchased ticket to reveal its ticket properties and boarding code.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
