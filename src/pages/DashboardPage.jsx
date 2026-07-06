import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSavedTrips, deleteSavedTrip, getSearchHistory, renameSavedTrip, updateTripGroup, createSharedTrip } from '../services/firebaseService';
import { MapPin, Trash2, Clock, IndianRupee, Loader2, Compass, Heart, Search, Plus, ExternalLink, Pencil, Check, X, FolderOpen, Share2, Link2, Copy, CheckCircle2 } from 'lucide-react';
import ExperienceTag from '../components/ExperienceTag';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedTrips, setSavedTrips] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rename state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Group state
  const [groupingId, setGroupingId] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');

  // Share state
  const [sharingId, setSharingId] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trips, history] = await Promise.all([
          getSavedTrips(user.uid),
          getSearchHistory(user.uid)
        ]);
        setSavedTrips(trips);
        setSearchHistory(history);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load your trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Get unique groups
  const groups = useMemo(() => {
    const g = new Set();
    savedTrips.forEach(t => { if (t.group) g.add(t.group); });
    return Array.from(g).sort();
  }, [savedTrips]);

  // Filter trips by group
  const filteredTrips = useMemo(() => {
    if (activeGroup === 'all') return savedTrips;
    if (activeGroup === 'ungrouped') return savedTrips.filter(t => !t.group);
    return savedTrips.filter(t => t.group === activeGroup);
  }, [savedTrips, activeGroup]);

  const handleDeleteTrip = async (tripId) => {
    try {
      await deleteSavedTrip(user.uid, tripId);
      setSavedTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete trip.');
    }
  };

  // Rename handlers
  const startRename = (trip) => {
    setEditingId(trip.id);
    setEditName(trip.customName || trip.name);
  };

  const saveRename = async (tripId) => {
    if (!editName.trim()) return;
    try {
      await renameSavedTrip(user.uid, tripId, editName.trim());
      setSavedTrips(prev => prev.map(t => t.id === tripId ? { ...t, customName: editName.trim() } : t));
    } catch (err) {
      console.error('Rename error:', err);
      setError('Failed to rename trip.');
    }
    setEditingId(null);
  };

  // Group handlers
  const startGrouping = (trip) => {
    setGroupingId(trip.id);
    setGroupName(trip.group || '');
  };

  const saveGroup = async (tripId) => {
    try {
      await updateTripGroup(user.uid, tripId, groupName.trim());
      setSavedTrips(prev => prev.map(t => t.id === tripId ? { ...t, group: groupName.trim() } : t));
    } catch (err) {
      console.error('Group error:', err);
      setError('Failed to update group.');
    }
    setGroupingId(null);
  };

  // Share handler
  const handleShare = async (trip) => {
    setSharingId(trip.id);
    setCopied(false);
    try {
      const shareId = await createSharedTrip({
        name: trip.name,
        customName: trip.customName || trip.name,
        description: trip.description,
        distance: trip.distance,
        estimatedCost: trip.estimatedCost,
        matchPercentage: trip.matchPercentage,
        experienceTags: trip.experienceTags,
        state: trip.state,
        searchLocation: trip.searchLocation,
      }, user.uid);
      const url = `${window.location.origin}/shared/${shareId}`;
      setShareUrl(url);
    } catch (err) {
      console.error('Share error:', err);
      setSharingId(null);
      setError('Failed to create share link.');
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => { setCopied(false); setSharingId(null); setShareUrl(''); }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome, {user?.displayName?.split(' ')[0]} ✨
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage your trips and search history</p>
          </div>
          <Link
            to="/plan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> New Trip
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'saved'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" /> Saved Trips
            {savedTrips.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">{savedTrips.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" /> Previous Searches
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 h-48 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-700 rounded-md w-32" />
                    <div className="h-3 bg-slate-700 rounded-md w-24" />
                  </div>
                  <div className="h-6 w-12 bg-slate-700 rounded-full" />
                </div>
                <div className="space-y-2 mt-6">
                  <div className="h-3 bg-slate-700 rounded-md w-full" />
                  <div className="h-3 bg-slate-700 rounded-md w-3/4" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-4 w-16 bg-slate-700 rounded-md" />
                  <div className="h-4 w-16 bg-slate-700 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'saved' ? (
          <>
            {/* Group filter pills */}
            {groups.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-slate-500 mr-1"><FolderOpen className="w-3 h-3 inline" /> Groups:</span>
                <button
                  onClick={() => setActiveGroup('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    activeGroup === 'all'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({savedTrips.length})
                </button>
                {groups.map(g => (
                  <button
                    key={g}
                    onClick={() => setActiveGroup(g)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      activeGroup === g
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g} ({savedTrips.filter(t => t.group === g).length})
                  </button>
                ))}
                <button
                  onClick={() => setActiveGroup('ungrouped')}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    activeGroup === 'ungrouped'
                      ? 'bg-slate-500/10 border-slate-500/30 text-slate-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Ungrouped
                </button>
              </div>
            )}

            {/* Saved Trips */}
            {filteredTrips.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {activeGroup === 'all' ? 'No Saved Trips' : `No trips in "${activeGroup}"`}
                </h3>
                <p className="text-slate-400 text-sm mb-6">Start planning and save destinations you love</p>
                <Link to="/plan" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm">
                  Plan a Trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrips.map((trip) => (
                  <div key={trip.id} className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group relative">
                    {/* Share modal overlay */}
                    {sharingId === trip.id && shareUrl && (
                      <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-5">
                        <Link2 className="w-8 h-8 text-emerald-400 mb-3" />
                        <p className="text-sm text-white font-medium mb-3">Share link ready!</p>
                        <div className="w-full flex items-center gap-2 bg-slate-800 rounded-lg p-2 mb-3">
                          <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 bg-transparent text-xs text-slate-300 outline-none truncate"
                          />
                          <button
                            onClick={copyShareUrl}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                          >
                            {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                          </button>
                        </div>
                        <button onClick={() => { setSharingId(null); setShareUrl(''); }} className="text-xs text-slate-500 hover:text-slate-300">
                          Close
                        </button>
                      </div>
                    )}

                    {/* Header with name (editable) */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        {editingId === trip.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveRename(trip.id)}
                              className="flex-1 bg-slate-900/50 border border-emerald-500/30 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-emerald-500/50"
                              autoFocus
                            />
                            <button onClick={() => saveRename(trip.id)} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-slate-500 hover:bg-white/5 rounded">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-white font-semibold truncate">{trip.customName || trip.name}</h3>
                        )}
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {trip.state || 'India'}
                        </p>
                      </div>
                      {trip.matchPercentage && editingId !== trip.id && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold ml-2">
                          {trip.matchPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Group badge */}
                    {groupingId === trip.id ? (
                      <div className="flex items-center gap-1.5 mb-3">
                        <FolderOpen className="w-3 h-3 text-purple-400" />
                        <input
                          type="text"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveGroup(trip.id)}
                          placeholder="Group name (or empty to remove)"
                          className="flex-1 bg-slate-900/50 border border-purple-500/30 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-purple-500/50 placeholder:text-slate-600"
                          autoFocus
                        />
                        <button onClick={() => saveGroup(trip.id)} className="p-1 text-purple-400 hover:bg-purple-500/10 rounded">
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={() => setGroupingId(null)} className="p-1 text-slate-500 hover:bg-white/5 rounded">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : trip.group ? (
                      <div className="flex items-center gap-1 mb-3">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-medium flex items-center gap-1">
                          <FolderOpen className="w-2.5 h-2.5" /> {trip.group}
                        </span>
                      </div>
                    ) : null}
                    
                    {trip.description && (
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{trip.description}</p>
                    )}

                    {trip.experienceTags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {trip.experienceTags.slice(0, 2).map(tag => (
                          <ExperienceTag key={tag} label={tag} selected size="sm" />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                      {trip.distance && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {trip.distance}</span>}
                      {trip.estimatedCost && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> ₹{trip.estimatedCost.min?.toLocaleString()}</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-xs text-slate-600">
                        {trip.savedAt instanceof Date ? trip.savedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently saved'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startRename(trip)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Rename"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startGrouping(trip)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Set group"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleShare(trip)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Share trip"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Remove trip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Search History */
          searchHistory.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Search History</h3>
              <p className="text-slate-400 text-sm mb-6">Your search history will appear here</p>
              <Link to="/plan" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm">
                Plan a Trip
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {searchHistory.map((search) => (
                <div
                  key={search.id}
                  onClick={() => navigate('/plan', { state: { prefill: search } })}
                  className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-emerald-500/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Search className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                          {search.location}
                          <span className="text-xs text-slate-500">· {search.maxDistance}km · ₹{Number(search.budget).toLocaleString()}</span>
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {search.experiences?.slice(0, 3).map(exp => (
                            <span key={exp} className="text-xs text-slate-500">{exp}</span>
                          ))}
                          <span className="text-xs text-slate-600">· {search.duration}</span>
                          {search.travelMode && (
                            <span className="text-xs text-slate-600">· {search.travelMode}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-600">
                        {search.searchedAt instanceof Date ? search.searchedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
