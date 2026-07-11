import { useState, useEffect } from 'react';
import { getAllVendors, updateVendorStatus,getCustomerCount } from '../../api/vendors';
import { getPendingProducts, approveProduct } from '../../api/products';
import { Shield, Store, Package, CheckCircle, XCircle, Clock, Users, Eye, ImageOff, X, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [customerCount,setCustomerCount]=useState(0);
  const [vendors, setVendors] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendors');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    Promise.all([getAllVendors(), getPendingProducts(), getCustomerCount()])
      .then(([vRes, pRes, ccRes]) => {   
        setVendors(vRes.data);
        setPendingProducts(pRes.data);
        setCustomerCount(ccRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVendorStatus = async (id, status) => {
    try {
      const res = await updateVendorStatus(id, status, null);
      setVendors((prev) => prev.map((v) => v.id === id ? res.data : v));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update vendor status.');
    }
  };

  const handleProductApproval = async (id, status) => {
    try {
      await approveProduct(id, status);
      setPendingProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update product status.');
    }
  };

  const approved = vendors.filter((v) => v.status === 'APPROVED').length;
  const pending  = vendors.filter((v) => v.status === 'PENDING_APPROVAL').length;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 gradient-text text-3xl font-extrabold tracking-tight">
            <Shield size={28} className="text-accent-primary shrink-0" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">Manage vendors, products, and marketplace operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { icon: Users,       label: 'Total Users',      value: customerCount, bg: 'bg-accent-primary/10 text-accent-primary' },
            { icon: Store,       label: 'Total Vendors',    value: vendors.length, bg: 'bg-accent-primary/10 text-accent-primary' },
            { icon: CheckCircle, label: 'Approved Vendors', value: approved,       bg: 'bg-accent-secondary/10 text-accent-secondary' },
            { icon: Clock,       label: 'Pending Vendors',  value: pending,        bg: 'bg-accent-warning/10 text-accent-warning' },
            { icon: Package,     label: 'Pending Products', value: pendingProducts.length, bg: 'bg-purple-500/10 text-purple-600' },
          ].map(({ icon: Icon, label, value, bg }) => (
            <div key={label} className="flex items-center gap-4 p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-text-primary leading-none">{value}</p>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-glass-border mb-6">
          <button
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 relative -bottom-[1px] cursor-pointer ${
              activeTab === 'vendors'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('vendors')}
          >
            <Store size={15} />
            <span>Vendors</span>
            {pending > 0 && <span className="bg-accent-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{pending}</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 relative -bottom-[1px] cursor-pointer ${
              activeTab === 'products'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={15} />
            <span>Product Approvals</span>
            {pendingProducts.length > 0 && <span className="bg-accent-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{pendingProducts.length}</span>}
          </button>
        </div>

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
            {loading ? (
              <p className="text-sm text-text-muted p-6">Loading vendors…</p>
            ) : vendors.length === 0 ? (
              <p className="text-sm text-text-muted p-6">No vendors found.</p>
            ) : (
              <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Store</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">License</th>
                    <th className="px-6 py-4">Commission</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-text-primary">{v.storeName}</div>
                          {v.description && <div className="text-xs text-text-muted mt-0.5 line-clamp-1">{v.description}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-text-primary">{v.user?.firstName} {v.user?.lastName}</div>
                          <div className="text-xs text-text-muted mt-0.5">{v.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{v.businessLicense || '—'}</td>
                      <td className="px-6 py-4 font-semibold text-text-primary">{(parseFloat(v.commissionRate || 0) * 100).toFixed(0)}%</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          v.status === 'APPROVED' ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' :
                          v.status === 'REJECTED' ? 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger' :
                          'bg-accent-warning/10 border-accent-warning/20 text-accent-warning'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {v.status !== 'APPROVED' && (
                            <button
                              className="inline-flex items-center gap-1 bg-accent-secondary hover:bg-accent-secondary-hover text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                              onClick={() => handleVendorStatus(v.id, 'APPROVED')}
                            >
                              <CheckCircle size={12} />
                              <span>Approve</span>
                            </button>
                          )}
                          {v.status !== 'REJECTED' && (
                            <button
                              className="inline-flex items-center gap-1 bg-accent-danger hover:opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                              onClick={() => handleVendorStatus(v.id, 'REJECTED')}
                            >
                              <XCircle size={12} />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
            {loading ? (
              <p className="text-sm text-text-muted p-6">Loading…</p>
            ) : pendingProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted">
                <CheckCircle size={40} className="text-accent-secondary opacity-80" />
                <h3 className="text-base font-bold text-text-secondary">All Caught Up!</h3>
                <p className="text-sm">No products are pending review.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40">
                  {pendingProducts.map((p) => {
                    const avgRating = p.reviews?.length
                      ? (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1)
                      : null;
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-text-primary">{p.name}</div>
                            {p.brand && <div className="text-xs text-text-muted mt-0.5">{p.brand}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-primary font-medium">{p.vendor?.storeName}</td>
                        <td className="px-6 py-4 text-text-secondary">{p.category?.name || '—'}</td>
                        <td className="px-6 py-4 font-bold text-text-primary">₹{parseFloat(p.price).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          {avgRating ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-accent-warning">
                              <Star size={12} fill="currentColor" /> {avgRating}
                              <span className="text-[10px] text-text-muted font-normal">({p.reviews.length})</span>
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted">No ratings</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">{p.stockQuantity}</td>
                        <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            className="inline-flex items-center gap-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                            onClick={() => setSelectedProduct(p)}
                          >
                            <Eye size={12} />
                            <span>Validate</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-1 bg-accent-secondary hover:bg-accent-secondary-hover text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                            onClick={() => handleProductApproval(p.id, 'APPROVED')}
                          >
                            <CheckCircle size={12} />
                            <span>Approve</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-1 bg-accent-danger hover:opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm"
                            onClick={() => handleProductApproval(p.id, 'REJECTED')}
                          >
                            <XCircle size={12} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Product Validation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-bg-primary border border-glass-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-text-primary">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-glass-border bg-bg-secondary">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Package className="text-accent-primary" size={18} />
                Validate Product Details
              </h3>
              <button onClick={() => setSelectedProduct(null)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div className="flex items-center justify-center bg-bg-tertiary rounded-xl p-4 border border-glass-border min-h-[220px]">
                {selectedProduct.images?.[0]?.imageUrl ? (
                  <img src={selectedProduct.images[0].imageUrl} alt={selectedProduct.name} className="max-h-[200px] object-contain rounded-lg shadow-sm" />
                ) : (
                  <div className="text-text-muted text-xs flex flex-col items-center gap-2">
                    <ImageOff size={32} />
                    <span>No Image Uploaded</span>
                  </div>
                )}
              </div>

              {/* Text Specs */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Product Name</div>
                  <h2 className="text-lg font-bold mt-0.5">{selectedProduct.name}</h2>
                  {selectedProduct.brand && (
                    <span className="text-xs text-text-muted bg-bg-tertiary border border-glass-border px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
                      {selectedProduct.brand}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Category</div>
                    <span className="text-sm font-semibold text-text-primary">{selectedProduct.category?.name || '—'}</span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Vendor Store</div>
                    <span className="text-sm font-semibold text-text-primary">{selectedProduct.vendor?.storeName}</span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Price</div>
                    <span className="text-base font-bold text-accent-primary">₹{parseFloat(selectedProduct.price).toFixed(2)}</span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Stock</div>
                    <span className="text-sm font-semibold text-text-primary">{selectedProduct.stockQuantity} units</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Description</div>
                  <p className="text-xs text-text-secondary mt-1 bg-bg-secondary p-3 rounded-lg border border-glass-border/30 max-h-[120px] overflow-y-auto leading-relaxed">
                    {selectedProduct.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-glass-border bg-bg-secondary">
              <button onClick={() => setSelectedProduct(null)} className="bg-transparent hover:bg-bg-tertiary border border-glass-border text-text-primary text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                Close
              </button>
              <button
                onClick={() => {
                  handleProductApproval(selectedProduct.id, 'REJECTED');
                  setSelectedProduct(null);
                }}
                className="bg-accent-danger hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <XCircle size={14} />
                Reject
              </button>
              <button
                onClick={() => {
                  handleProductApproval(selectedProduct.id, 'APPROVED');
                  setSelectedProduct(null);
                }}
                className="bg-accent-secondary hover:bg-accent-secondary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle size={14} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
