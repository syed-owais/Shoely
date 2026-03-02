import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { useStore } from '@/store/useStore';

export default function LoginPage() {
    const navigate = useNavigate();
    const { setUser, isAuthenticated, user } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (isAuthenticated && user?.role === 'customer') {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/api/login', { email, password });
            const { user, token } = response.data;

            // Store the token
            localStorage.setItem('auth_token', token);

            setUser({
                id: String(user.id),
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                orders: [],
                createdAt: new Date().toISOString(),
            });

            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err.response?.status, err.response?.data);
            if (err.response?.status === 422) {
                setError(err.response.data.message || 'Invalid email or password');
            } else {
                setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/">
                        <h1 className="font-display font-black text-3xl text-white mb-2">SHOELY</h1>
                    </Link>
                    <p className="text-white/60">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-6">Welcome Back</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-white/10 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/10 border border-white/10 rounded-lg pl-12 pr-12 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email || !password}
                            className="w-full py-3 bg-[#FF4D6D] text-white rounded-lg font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-white/60 text-sm text-center">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[#FF4D6D] hover:underline font-medium">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to store */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-white/60 hover:text-white text-sm transition-colors">
                        ← Back to store
                    </Link>
                </div>
            </div>
        </div>
    );
}
