import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ShoppingBag, AlertCircle, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      switch (user.role) {
        case 'ADMIN':    navigate('/admin');   break;
        case 'VENDOR':   navigate('/vendor');  break;
        default:         navigate('/');        break;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden bg-bg-primary">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl rounded-3xl border border-glass-border bg-glass/40 backdrop-blur-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Left Side: Info (5 cols on lg) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-12 text-white flex-col justify-between overflow-hidden">
          {/* Subtle glow inside left side */}
          <div className="absolute top-0 right-0 w-[20rem] h-[20rem] bg-accent-primary/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-accent-secondary/15 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white">ShopStack</span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              The Next-Gen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-indigo-400">Enterprise Marketplace</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              Connect with top vendors, explore diverse catalogs, and streamline your operations on the most powerful multi-vendor platform.
            </p>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Advanced Analytics</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time metrics, inventory tracking, and sales projections at your fingertips.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Enterprise Security</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Role-based access control, secure payment processing, and verified merchant accounts.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Tailored Experience</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Personalized dashboards for customers, sellers, and administrators alike.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form (7 cols on lg) */}
        <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white/20 backdrop-blur-md">
          {/* Mobile Brand Header */}
          <div className="flex flex-col items-center gap-2 mb-8 text-center lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-1">
              <ShoppingBag size={28} className="text-accent-primary" />
            </div>
            <h1 className="gradient-text text-2xl font-extrabold tracking-tight">ShopStack</h1>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Enterprise Multi-Vendor Platform</p>
          </div>

          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-1 font-display">Welcome Back</h2>
            <p className="text-sm text-text-secondary mb-6">Sign in to continue to your account</p>

            {error && (
              <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-lg text-sm bg-accent-danger/10 border border-accent-danger/25 text-accent-danger animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle size={17} className="shrink-0 text-accent-danger" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 pl-11 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 pl-11 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer py-3 rounded-lg bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-semibold text-sm shadow-lg shadow-accent-primary/10 hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-2"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-accent-primary hover:text-indigo-600 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
