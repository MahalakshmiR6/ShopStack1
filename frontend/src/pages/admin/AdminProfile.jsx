import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllVendors, updateVendorStatus } from '../../api/vendors';
import {
  Store,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  SlidersHorizontal,
  Percent,
  CalendarDays,
  ShieldCheck,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'APPROVED', 'PENDING_APPROVAL', 'REJECTED'];

const STATUS_META = {
  APPROVED:         { label: 'Approved',         cls: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500',           Icon: CheckCircle2 },
  PENDING_APPROVAL: { label: 'Pending Approval',  cls: 'bg-accent-warning/10 border-accent-warning/25 text-accent-warning', Icon: Clock },
  REJECTED:         { label: 'Rejected',          cls: 'bg-accent-danger/10 border-accent-danger/25 text-accent-danger',    Icon: XCircle },
};

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminProfile() {
  const { user } = useAuth();

  const [vendors, setVendors]             = useState([]);
  const [filter, setFilter]               = useState('ALL');
  const [search, setSearch]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [updating, setUpdating]           = useState(null); // vendor id being updated
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

  // Inline edit state per vendor
  const [editState, setEditState]         = useState({}); // { [id]: { status, commissionRate } }

  useEffect(() => {
    fetchVendors();
  }, [filter]);

  const fetchVendors = () => {
    setLoading(true);
    setError('');
    getAllVendors(filter === 'ALL' ? undefined : filter)
      .then((res) => {
        setVendors(res.data);
        const init = {};
        res.data.forEach((v) => {
          init[v.id] = {
            status: v.status,
            commissionRate: (parseFloat(v.commissionRate) * 100).toFixed(0),
          };
        });
        setEditState(init);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load vendors.'))
      .finally(() => setLoading(false));
  };

  const handleUpdate = async (vendorId) => {
    const state = editState[vendorId];
    if (!state) return;
    setUpdating(vendorId);
    setError('');
    try {
      const commissionDecimal = parseFloat(state.commissionRate) / 100;
      const res = await updateVendorStatus(vendorId, state.status, commissionDecimal);
      const updated = res.data;
      setVendors((prev) => prev.map((v) => (v.id === vendorId ? updated : v)));
      setEditState((prev) => ({
        ...prev,
        [vendorId]: {
          status: updated.status,
          commissionRate: (parseFloat(updated.commissionRate) * 100).toFixed(0),
        },
      }));
      setSuccessMsg(`Vendor "${updated.storeName}" updated successfully!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update vendor.');
    } finally {
      setUpdating(null);
    }
  };

  const handleEditChange = (vendorId, field, value) => {
    setEditState((prev) => ({ ...prev, [vendorId]: { ...prev[vendorId], [field]: value } }));
  };

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.storeName?.toLowerCase().includes(q) ||
      v.user?.firstName?.toLowerCase().includes(q) ||
      v.user?.lastName?.toLowerCase().includes(q) ||
      v.user?.email?.toLowerCase().includes(q)
    );
  });

  // Stats
  const total    = vendors.length;
  const approved = vendors.filter((v) => v.status === 'APPROVED').length;
  const pending  = vendors.filter((v) => v.status === 'PENDING_APPROVAL').length;
  const rejected = vendors.filter((v) => v.status === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Admin Profile</h1>
            <p className="text-sm text-text-secondary mt-1.5 font-medium">
              Logged in as <span className="text-text-primary font-bold">{user?.firstName} {user?.lastName}</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/25 text-accent-primary">
                Admin
              </span>
            </p>
          </div>
          <button
            onClick={fetchVendors}
            className="flex items-center gap-2 bg-bg-tertiary hover:bg-bg-tertiary/70 border border-glass-border text-text-secondary hover:text-text-primary text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl text-sm bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 animate-in fade-in slide-in-from-top-2 duration-150">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl text-sm bg-accent-danger/10 border border-accent-danger/25 text-accent-danger animate-in fade-in slide-in-from-top-2 duration-150">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users,        label: 'Total Vendors',   value: total,    bg: 'bg-accent-primary/10 text-accent-primary' },
            { icon: CheckCircle2, label: 'Approved',        value: approved, bg: 'bg-emerald-500/10 text-emerald-500' },
            { icon: Clock,        label: 'Pending Review',  value: pending,  bg: 'bg-accent-warning/10 text-accent-warning' },
            { icon: XCircle,      label: 'Rejected',        value: rejected, bg: 'bg-accent-danger/10 text-accent-danger' },
          ].map(({ icon: Icon, label, value, bg }) => (
            <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="font-extrabold text-xl text-text-primary leading-none">{value}</p>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-glass-border bg-bg-tertiary/50">
            <SlidersHorizontal size={13} className="text-text-muted ml-2" />
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  filter === s
                    ? 'bg-accent-primary text-white shadow-sm shadow-accent-primary/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                }`}
              >
                {s === 'ALL' ? 'All' : s === 'PENDING_APPROVAL' ? 'Pending' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search vendors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 pl-8 outline-none transition-all duration-300 focus:border-accent-primary"
            />
          </div>
        </div>

        {/* Vendor List */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-text-muted">
            <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading vendors…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 border border-glass-border rounded-xl bg-glass/5 text-text-muted">
            <Store size={44} className="opacity-40" />
            <p className="text-sm font-semibold">No vendors found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((vendor) => {
              const meta    = STATUS_META[vendor.status] || STATUS_META.PENDING_APPROVAL;
              const edit    = editState[vendor.id] || { status: vendor.status, commissionRate: '10' };
              const isDirty = edit.status !== vendor.status ||
                parseFloat(edit.commissionRate) !== parseFloat(vendor.commissionRate) * 100;

              return (
                <div
                  key={vendor.id}
                  className="p-5 sm:p-6 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col sm:flex-row gap-5 hover:border-accent-primary/30 transition-colors duration-200"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-indigo-600 flex items-center justify-center font-display font-extrabold text-lg text-white shadow-md shadow-accent-primary/20 shrink-0">
                    {vendor.storeName?.[0] ?? '?'}
                  </div>

                  {/* Store Info */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-text-primary text-base">{vendor.storeName}</h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          {vendor.user?.firstName} {vendor.user?.lastName} · {vendor.user?.email}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.cls}`}>
                        <meta.Icon size={10} />
                        {meta.label}
                      </span>
                    </div>

                    {vendor.description && (
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{vendor.description}</p>
                    )}

                    {/* Details row */}
                    <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Percent size={11} />
                        Commission: <strong className="text-text-primary ml-0.5">
                          {(parseFloat(vendor.commissionRate) * 100).toFixed(0)}%
                        </strong>
                      </span>
                      {vendor.taxId && (
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={11} />
                          Tax ID: <strong className="text-text-primary ml-0.5">{vendor.taxId}</strong>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} />
                        Joined: <strong className="text-text-primary ml-0.5">{formatDate(vendor.createdAt)}</strong>
                      </span>
                    </div>

                    {/* Inline Edit Controls */}
                    <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-glass-border/40">
                      {/* Status Select */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Status</label>
                        <select
                          value={edit.status}
                          onChange={(e) => handleEditChange(vendor.id, 'status', e.target.value)}
                          className="bg-bg-secondary border border-glass-border rounded-md text-text-primary text-xs px-3 py-2 outline-none focus:border-accent-primary cursor-pointer transition-colors"
                        >
                          <option value="APPROVED">Approved</option>
                          <option value="PENDING_APPROVAL">Pending</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>

                      {/* Commission Rate Input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Commission (%)</label>
                        <div className="relative">
                          <Percent size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={edit.commissionRate}
                            onChange={(e) => handleEditChange(vendor.id, 'commissionRate', e.target.value)}
                            className="bg-bg-secondary border border-glass-border rounded-md text-text-primary text-xs pl-7 pr-3 py-2 w-24 outline-none focus:border-accent-primary transition-colors"
                          />
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={() => handleUpdate(vendor.id)}
                        disabled={!isDirty || updating === vendor.id}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs font-bold px-4 py-2 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-accent-primary/20"
                      >
                        {updating === vendor.id ? (
                          <>
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            Saving…
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
