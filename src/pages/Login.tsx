import { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMode, setLoginMode] = useState<'admin' | 'staff'>('admin');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginMode === 'staff') {
        const { data: staffData, error } = await supabase
          .from('app_staff')
          .select('*')
          .eq('pin', pin)
          .single();

        if (error || !staffData) throw new Error("Invalid PIN");

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', staffData.role);
        localStorage.setItem('userName', staffData.name);

        if (staffData.role === 'Chef') navigate('/kitchen');
        else if (staffData.role === 'Waiter') navigate('/counter');
        else navigate('/');
        return;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          alert('User already exists! Please sign in.');
          setIsSignUp(false);
        } else {
          alert('Account created successfully! You can now sign in.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.session) {
          localStorage.setItem('isAuthenticated', 'true');
          
          // Check for staff role
          const { data: staffData } = await supabase
            .from('app_staff')
            .select('role')
            .eq('email', email)
            .single();
          
          const role = staffData?.role || 'Admin';
          localStorage.setItem('userRole', role);

          // Role-based redirection
          if (role === 'Chef') {
            navigate('/kitchen');
          } else if (role === 'Waiter') {
            navigate('/counter');
          } else {
            navigate('/');
          }
        }
      }
    } catch (error: any) {
      alert(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
      
      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-2xl shadow-indigo-500/30 border border-white/10">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">GrandHotel</h1>
          <p className="text-indigo-200 text-sm font-medium mt-1 uppercase tracking-widest">Management Suite</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          
          <div className="flex bg-slate-800/50 p-1 rounded-xl mb-8 border border-white/5">
            <button 
              onClick={() => { setLoginMode('admin'); setIsSignUp(false); }}
              className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", loginMode === 'admin' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200")}
            >
              Admin Login
            </button>
            <button 
              onClick={() => { setLoginMode('staff'); setIsSignUp(false); }}
              className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", loginMode === 'staff' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200")}
            >
              Staff PIN
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-black text-white">{loginMode === 'staff' ? 'Staff PIN Login' : (isSignUp ? 'Create Account' : 'Welcome Back')}</h2>
            <p className="text-sm text-slate-400 mt-1">{loginMode === 'staff' ? 'Enter your 4-digit PIN to start your shift' : (isSignUp ? 'Register to manage your hotel' : 'Sign in to access the control panel')}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {loginMode === 'admin' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@hotel.com"
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center block">Enter 4-Digit Security PIN</label>
                <div className="flex justify-center gap-4">
                  <input 
                    type="password" 
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="0000"
                    className="w-40 bg-slate-800/50 border border-slate-700/50 rounded-2xl py-5 text-center text-3xl font-black tracking-[1em] text-indigo-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25 group disabled:opacity-50"
              >
                {loading ? 'Processing...' : (loginMode === 'staff' ? 'Access Panel' : (isSignUp ? 'Sign Up' : 'Sign In'))}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

          {loginMode === 'admin' && (
            <div className="mt-6 text-center">
              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
