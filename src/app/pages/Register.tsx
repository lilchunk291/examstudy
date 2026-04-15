import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Mail, Lock, User, CheckCircle2, Github } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { getSupabase } from "../../lib/supabase";
import { Turnstile } from '@marsidev/react-turnstile';

export default function Register() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const navigate = useNavigate();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    if (!captchaToken) {
      setErrorMsg("Please complete the CAPTCHA");
      return;
    }
    try {
      setErrorMsg("");
      const supabase = getSupabase();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          data: {
            full_name: name,
          }
        }
      });
      if (error) throw error;
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Error registering:", error.message);
      setErrorMsg(error.message || "Failed to register");
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setErrorMsg("");
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        }
      });
      if (error) throw error;

      if (data?.url) {
        const authWindow = window.open(
          data.url,
          'oauth_popup',
          'width=600,height=700'
        );

        if (!authWindow) {
          setErrorMsg("Please allow popups for this site to connect your account.");
        }
      }
    } catch (error: any) {
      console.error(`Error logging in with ${provider}:`, error.message);
      setErrorMsg(error.message || "Failed to authenticate");
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        navigate("/app");
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setErrorMsg("Authentication failed. Please try again.");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[160px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-purple-500/10 blur-[160px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-6">
          <Link to="/" className="inline-block">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-white/40 backdrop-blur-3xl rounded-2xl shadow-xl border border-white/20 flex items-center justify-center mx-auto group hover:scale-110 transition-transform duration-500"
            >
              <Shield strokeWidth={3} className="w-8 h-8 text-indigo-600" />
            </motion.div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Create account</h1>
            <p className="text-sm font-bold text-slate-500 tracking-tight">Start your optimized study journey today</p>
          </div>
        </div>

        {/* Auth Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/60 backdrop-blur-3xl rounded-3xl p-8 shadow-xl border border-white/40 relative overflow-hidden"
        >
          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-8"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Check your email</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  We've sent you a confirmation link to activate your account.
                </p>
              </div>
              <Link to="/login" className="inline-block mt-4 px-8 py-3 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:bg-slate-800 transition-all">
                Return to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-4">
                    Full Name
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User strokeWidth={2.5} className="h-5 w-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-12 pr-6 py-3.5 border border-white/60 rounded-2xl bg-white/50 backdrop-blur-md text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-4">
                    Email Address
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail strokeWidth={2.5} className="h-5 w-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-6 py-3.5 border border-white/60 rounded-2xl bg-white/50 backdrop-blur-md text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-4">
                    Password
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock strokeWidth={2.5} className="h-5 w-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-6 py-3.5 border border-white/60 rounded-2xl bg-white/50 backdrop-blur-md text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Turnstile 
                  siteKey={import.meta.env.VITE_CLOUDFLARE_SITE_KEY || '0x4AAAAAAC21pisvHAinMB4-'} 
                  onSuccess={(token) => setCaptchaToken(token)}
                  options={{ theme: 'light' }}
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileActive={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-4 px-8 border border-transparent rounded-2xl shadow-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
              >
                Create Account
                <ArrowRight strokeWidth={3} className="w-5 h-5" />
              </motion.button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/60"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/50 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => handleOAuthLogin('google')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-slate-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button 
                  type="button" 
                  onClick={() => handleOAuthLogin('github')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-slate-700"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </button>
              </div>
              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </motion.div>

        {!isSubmitted && (
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
