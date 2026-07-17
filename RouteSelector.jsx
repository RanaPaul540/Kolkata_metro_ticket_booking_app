import React, { useState, useEffect } from 'react';
import { getRoute, bookTicket, getAllStations } from '../services/api';
import { ArrowRight, Clock, Banknote, Shuffle, Ticket, AlertCircle, Train, ChevronDown, Search } from 'lucide-react';

// Color map details designed for light-mode readability (darker text tones)
const getLineColorDetails = (line = '') => {
  const norm = line.toLowerCase();
  if (norm.includes('green')) {
    return {
      dot: 'bg-emerald-600 border-emerald-400 shadow-sm',
      text: 'text-emerald-800 font-bold',
      tag: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    };
  }
  if (norm.includes('blue')) {
    return {
      dot: 'bg-blue-600 border-blue-400 shadow-sm',
      text: 'text-blue-800 font-bold',
      tag: 'bg-blue-50 border-blue-200 text-blue-800',
    };
  }
  if (norm.includes('orange')) {
    return {
      dot: 'bg-orange-500 border-orange-300 shadow-sm',
      text: 'text-orange-800 font-bold',
      tag: 'bg-orange-50 border-orange-200 text-orange-850',
    };
  }
  if (norm.includes('purple')) {
    return {
      dot: 'bg-purple-600 border-purple-400 shadow-sm',
      text: 'text-purple-800 font-bold',
      tag: 'bg-purple-50 border-purple-200 text-purple-805',
    };
  }
  if (norm.includes('yellow')) {
    return {
      dot: 'bg-amber-500 border-amber-300 shadow-sm',
      text: 'text-amber-800 font-bold',
      tag: 'bg-amber-50 border-amber-200 text-amber-900',
    };
  }
  if (norm.includes('pink')) {
    return {
      dot: 'bg-pink-600 border-pink-400 shadow-sm',
      text: 'text-pink-800 font-bold',
      tag: 'bg-pink-50 border-pink-200 text-pink-805',
    };
  }
  if (norm.includes('red')) {
    return {
      dot: 'bg-red-600 border-red-400 shadow-sm',
      text: 'text-red-800 font-bold',
      tag: 'bg-red-50 border-red-200 text-red-800',
    };
  }
  return {
    dot: 'bg-slate-500 border-slate-350 shadow-sm',
    text: 'text-slate-800 font-bold',
    tag: 'bg-slate-50 border-slate-200 text-slate-800',
  };
};

// Custom dropdown component styled in clean light mode
function StationDropdown({ label, value, onChange, stations, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredStations = stations.filter(st => 
    st.name.toLowerCase().includes(search.toLowerCase()) || 
    st.line.toLowerCase().includes(search.toLowerCase())
  );

  const activeColors = value ? getLineColorDetails(value.line) : null;

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-left text-slate-700 hover:border-slate-400 focus:border-[#0F2C59] focus:outline-none transition text-sm flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeColors.dot}`} />
              <span className={`font-semibold ${activeColors.text}`}>{value.name}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">({value.line} Line)</span>
            </>
          ) : (
            <span className="text-slate-450">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-455 transition-transform duration-205 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop click to close */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-350 rounded-lg shadow-xl z-20 max-h-[220px] flex flex-col overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search station..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto flex-1 py-1 bg-white">
              {filteredStations.length === 0 ? (
                <div className="py-3 px-4 text-xs text-slate-400 text-center">No stations found</div>
              ) : (
                filteredStations.map((st) => {
                  const colors = getLineColorDetails(st.line);
                  return (
                    <button
                      key={`${st.id}-${st.line}`}
                      type="button"
                      onClick={() => {
                        onChange(st);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-xs transition border-b border-slate-100 last:border-0 ${
                        value?.id === st.id ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                        <span className={colors.text}>{st.name}</span>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border transition-all ${colors.tag}`}>
                        {st.line}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RouteSelector({ onTicketBooked }) {
  const [stations, setStations] = useState([]);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [fetchingStations, setFetchingStations] = useState(true);

  // Fetch all stations from DB on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await getAllStations();
        setStations(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch stations list from database.");
      } finally {
        setFetchingStations(false);
      }
    };
    fetchStations();
  }, []);

  const calculatePath = async (e) => {
    e.preventDefault();
    if (!source || !destination) {
      setError("Please select both source and destination stations.");
      return;
    }
    if (source.name === destination.name) {
      setError("Source and destination stations cannot be the same.");
      return;
    }

    setLoading(true);
    setError(null);
    setRouteData(null);
    setSuccessMsg('');

    try {
      const response = await getRoute(source.name, destination.name);
      setRouteData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to calculate metro route.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = async () => {
    if (!routeData) return;
    setBooking(true);
    setError(null);
    setSuccessMsg('');

    try {
      const { source: src, destination: dest, total_fare_inr: fare } = routeData.route_summary;
      const response = await bookTicket(src, dest, fare, 30); // expires in 30 minutes
      setSuccessMsg(`Ticket booked successfully! Number: ${response.data.ticket_number}`);
      if (onTicketBooked) {
        onTicketBooked();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to book metro ticket. Please verify database connectivity.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
        <Train className="w-5 h-5 text-[#0F2C59]" />
        <h3 className="font-bold text-[#0F2C59] text-base">Metro Route & Fare Planner</h3>
      </div>

      <form onSubmit={calculatePath} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source Selector */}
          <StationDropdown
            label="Source Station"
            value={source}
            onChange={setSource}
            stations={stations}
            placeholder={fetchingStations ? "Loading..." : "Select origin..."}
            disabled={fetchingStations}
          />

          {/* Destination Selector */}
          <StationDropdown
            label="Destination Station"
            value={destination}
            onChange={setDestination}
            stations={stations}
            placeholder={fetchingStations ? "Loading..." : "Select destination..."}
            disabled={fetchingStations}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !source || !destination}
          className="w-full py-2.5 px-4 font-semibold text-sm rounded-lg bg-[#0F2C59] hover:bg-[#153a70] text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <>
              <Clock className="w-4 h-4 animate-spin" /> Calculating route parameters...
            </>
          ) : (
            <>
              Plan Route <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-start gap-2">
          <Ticket className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Path Calculation Details */}
      {routeData && (
        <div className="mt-6 flex-1 flex flex-col space-y-4">
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total Fare</span>
              <span className="text-sm font-extrabold text-emerald-700 flex items-center justify-center gap-0.5 mt-0.5">
                <Banknote className="w-4 h-4" /> ₹{routeData.route_summary.total_fare_inr}
              </span>
            </div>
            <div className="text-center border-x border-slate-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Travel Time</span>
              <span className="text-sm font-extrabold text-slate-700 flex items-center justify-center gap-0.5 mt-0.5">
                <Clock className="w-4 h-4" /> {routeData.route_summary.total_travel_time_minutes} min
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Interchanges</span>
              <span className="text-sm font-extrabold text-indigo-700 flex items-center justify-center gap-0.5 mt-0.5">
                <Shuffle className="w-4 h-4" /> {routeData.route_summary.interchanges_count}
              </span>
            </div>
          </div>

          {/* Itinerary Timeline */}
          <div className="flex-1 overflow-y-auto max-h-[260px] pr-2 mt-2">
            <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-4 py-2">
              {routeData.ordered_itinerary.map((node, idx) => {
                const colors = getLineColorDetails(node.line);
                
                return (
                  <div key={`it-${idx}`} className="relative">
                    {/* Bullet marker */}
                    <span className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 ${colors.dot} flex items-center justify-center shrink-0`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${colors.text}`}>{node.station_name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${colors.tag}`}>
                          {node.line}
                        </span>
                      </div>
                      
                      {node.is_interchange && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded-md max-w-xs animate-pulse-soft">
                          <Shuffle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Transfer to <span className="font-bold">{node.transfer_to} Line</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleBookTicket}
            disabled={booking}
            className="w-full py-2.5 px-4 font-bold text-sm text-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Ticket className="w-4 h-4" />
            {booking ? "Generating QR Ticket..." : `Book Official QR Ticket (₹${routeData.route_summary.total_fare_inr})`}
          </button>
        </div>
      )}
    </div>
  );
}
