import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getVendorProducts, createProduct, updateProduct, submitProductForApproval, getCategories } from '../../api/products';
import { getVendorProfile } from '../../api/vendors';
import { uploadProductImage } from '../../api/upload';
import { Plus, Package, CheckCircle, Clock, XCircle, Edit, Send, IndianRupee, Star } from 'lucide-react';

const STATUS_META = {
  DRAFT:            { label: 'Draft',            cls: 'bg-text-secondary/10 border-text-secondary/20 text-text-secondary', Icon: Edit },
  PENDING_APPROVAL: { label: 'Pending Review',   cls: 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning', Icon: Clock },
  APPROVED:         { label: 'Approved',         cls: 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary', Icon: CheckCircle },
  REJECTED:         { label: 'Rejected',         cls: 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger',  Icon: XCircle },
};

const EMPTY_FORM = {
  name: '', brand: '', description: '', price: '', stockQuantity: '', categoryId: '', imageUrl: '',
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadError('');
    try {
      const res = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    let active = true;
    
    getVendorProducts()
      .then((res) => { if (active) setProducts(res.data); })
      .catch((err) => console.error("Failed to load products:", err));

    getCategories()
      .then((res) => { if (active) setCategories(res.data); })
      .catch((err) => console.error("Failed to load categories:", err));

    getVendorProfile()
      .then((res) => { if (active) setVendorProfile(res.data); })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const data = {
        name: form.name,
        brand: form.brand,
        description: form.description,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity, 10),
        images: form.imageUrl ? [{ imageUrl: form.imageUrl, isPrimary: true }] : [],
      };
      
      let res;
      if (editingProductId) {
        // Update existing product
        res = await updateProduct(editingProductId, data, form.categoryId || null);
        setProducts((prev) => prev.map((p) => p.id === editingProductId ? res.data : p));
      } else {
        // Create new product
        res = await createProduct(data, form.categoryId || null);
        setProducts((prev) => [res.data, ...prev]);
      }
      
      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditingProductId(null);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (productId) => {
    try {
      const res = await submitProductForApproval(productId);
      setProducts((prev) => prev.map((p) => p.id === productId ? res.data : p));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit for approval.');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      brand: product.brand || '',
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.category?.id || '',
      imageUrl: product.images?.[0]?.imageUrl || '',
    });
    setEditingProductId(product.id);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingProductId(null);
  };

  // Stats
  const approved  = products.filter((p) => p.status === 'APPROVED').length;
  const pending   = products.filter((p) => p.status === 'PENDING_APPROVAL').length;
  const totalVal  = products.filter((p) => p.status === 'APPROVED')
    .reduce((s, p) => s + parseFloat(p.price) * p.stockQuantity,0);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Vendor Dashboard</h1>
            {vendorProfile && (
              <p className="text-sm text-text-secondary flex items-center gap-2 mt-1.5">
                <span className="font-semibold text-text-primary">{vendorProfile.storeName}</span>
                <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  vendorProfile.status === 'APPROVED' ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' : 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning'
                }`}>
                  {vendorProfile.status}
                </span>
              </p>
            )}
          </div>
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-accent-primary/10 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            onClick={() => {
              if (showForm) {
                handleCancelForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            <Plus size={16} />
            <span>{showForm ? 'Cancel' : 'Add Product'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { icon: Package,    label: 'Total Products',  value: products.length,   bg: 'bg-accent-primary/10 text-accent-primary', subtext: 'In your catalog' },
            { icon: CheckCircle,label: 'Approved',        value: approved,          bg: 'bg-accent-secondary/10 text-accent-secondary', subtext: 'Ready for sale' },
            { icon: Clock,      label: 'Pending Review',  value: pending,           bg: 'bg-accent-warning/10 text-accent-warning', subtext: 'Awaiting admin' },
            { icon: IndianRupee, label: 'Inventory Value', value: `₹${totalVal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, bg: 'bg-purple-500/10 text-purple-600', subtext: 'Total (Price × Stock)' },
          ].map(({ icon: Icon, label, value, bg, subtext }) => (
            <div key={label} className="flex items-center gap-4 p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-text-primary leading-none">{value}</p>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-1">{label}</p>
                {subtext && <p className="text-[9px] font-medium text-text-secondary mt-1 opacity-80">{subtext}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Create product form */}
        {showForm && (
          <div className="p-6 sm:p-8 rounded-xl border border-glass-border bg-glass/15 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-top-3 duration-300">
            <h2 className="text-lg font-bold text-text-primary mb-5">{editingProductId ? 'Edit Product Details' : 'New Product Details'}</h2>
            {formError && (
              <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-lg text-sm bg-accent-danger/10 border border-accent-danger/25 text-accent-danger">
                <XCircle size={16} className="text-accent-danger" />
                <span>{formError}</span>
              </div>
            )}
            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Product Name *</label>
                <input name="name" className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary" placeholder="e.g. Wireless Headphones Pro"
                  value={form.name} onChange={handleFormChange} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Brand</label>
                <input name="brand" className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary" placeholder="e.g. Sony"
                  value={form.brand} onChange={handleFormChange} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Description *</label>
                <textarea name="description" className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary resize-y" rows={3}
                  placeholder="Product description…" value={form.description} onChange={handleFormChange} required />
              </div>
               <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Price (₹) *</label>
                <input name="price" type="number" step="0.01" min="0" className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary"
                  placeholder="0.00" value={form.price} onChange={handleFormChange} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Stock Quantity *</label>
                <input name="stockQuantity" type="number" min="0" className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary"
                  placeholder="100" value={form.stockQuantity} onChange={handleFormChange} required />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Product Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {form.imageUrl ? (
                    <div className="relative w-24 h-24 rounded-lg bg-bg-tertiary border border-glass-border overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                        className="absolute -top-1.5 -right-1.5 bg-accent-danger text-white rounded-full p-1 cursor-pointer hover:bg-red-700 transition-colors flex items-center justify-center w-5 h-5 shadow-md"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-bg-tertiary border border-dashed border-glass-border flex flex-col items-center justify-center text-text-muted shrink-0">
                      <Package size={28} className="opacity-50" />
                      <span className="text-[10px] mt-1 font-semibold">No Image</span>
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="product-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="inline-flex items-center gap-2 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-glass-border text-text-primary text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer select-none"
                    >
                      <Plus size={14} />
                      <span>{uploadingImage ? 'Uploading...' : form.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                    </label>
                    {uploadError && <p className="text-[11px] text-accent-danger font-medium mt-1.5">{uploadError}</p>}
                    <p className="text-[10px] text-text-secondary mt-1.5 font-medium">PNG, JPG or GIF format. Recommended 4:3 aspect ratio.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</label>
                <select name="categoryId" className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary" value={form.categoryId} onChange={handleFormChange}>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button type="submit" className="bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50" disabled={formLoading}>
                  {formLoading ? 'Saving…' : editingProductId ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" className="bg-transparent hover:bg-bg-tertiary border border-glass-border text-text-primary text-sm font-bold px-6 py-2.5 rounded-lg transition-colors duration-300 cursor-pointer" onClick={handleCancelForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products list */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary">My Products</h2>
          {loading ? (
            <p className="text-sm text-text-muted">Loading products…</p>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 border border-glass-border rounded-xl bg-glass/5 text-text-muted">
              <Package size={44} className="opacity-50" />
              <h3 className="text-base font-bold text-text-secondary">No products yet</h3>
              <p className="text-sm">Create your first product to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass/5">
              <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40">
                  {products.map((p) => {
                    const meta = STATUS_META[p.status] || STATUS_META.DRAFT;
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
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.cls}`}>
                            <meta.Icon size={11} /> {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {(p.status === 'DRAFT' || p.status === 'REJECTED') && (
                              <button
                                className="inline-flex items-center gap-1.5 bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm shadow-accent-primary/10 hover:shadow-accent-primary/20"
                                onClick={() => handleEdit(p)}
                              >
                                <Edit size={11} />
                                <span>Edit</span>
                              </button>
                            )}
                            {(p.status === 'DRAFT' || p.status === 'REJECTED') && (
                              <button
                                className="inline-flex items-center gap-1.5 bg-accent-secondary hover:bg-accent-secondary-hover text-white text-xs font-bold px-3 py-1.5 rounded transition-all duration-200 cursor-pointer shadow-sm shadow-accent-secondary/10 hover:shadow-accent-secondary/20"
                                onClick={() => handleSubmit(p.id)}
                              >
                                <Send size={11} />
                                <span>Submit</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
