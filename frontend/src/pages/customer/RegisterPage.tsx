import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, User } from 'lucide-react';
import api from '@/lib/axios';
import { useStore } from '@/store/useStore';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { setUser, isAuthenticated, user } = useStore();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    if (isAuthenticated && user?.role === 'customer') {
        return <Navigate to="/" replace />;
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error on change
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsLoading(true);

        try {
            const response = await api.post('/api/register', formData);
            const { user, token } = response.data.data;

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
            if (err.response?.status === 422) {
                const data = err.response.data;
                if (data.errors) {
                    setFieldErrors(data.errors);
                }
                setError(data.message || 'Please check your input.');
            } else {
                setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (field: string) => fieldErrors[field]?.[0];

    return (
        <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/">
                        <h1 className="font-display font-black text-3xl text-white mb-2">SHOELY</h1>
                    </Link>
                    <p className="text-white/60">Create your account</p>
                </div>

                {/* Register Form */}
                <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-6">Sign Up</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white/70 text-sm mb-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => handleChange('first_name', e.target.value)}
                                        placeholder="John"
                                        className={`w-full bg-white/10 border ${getFieldError('first_name') ? 'border-red-500/50' : 'border-white/10'} rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50`}
                                        required
                                    />
                                </div>
                                {getFieldError('first_name') && <p className="text-red-400 text-xs mt-1">{getFieldError('first_name')}</p>}
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => handleChange('last_name', e.target.value)}
                                    placeholder="Doe"
                                    className={`w-full bg-white/10 border ${getFieldError('last_name') ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50`}
                                    required
                                />
                                {getFieldError('last_name') && <p className="text-red-400 text-xs mt-1">{getFieldError('last_name')}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="your@email.com"
                                    className={`w-full bg-white/10 border ${getFieldError('email') ? 'border-red-500/50' : 'border-white/10'} rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50`}
                                    required
                                />
                            </div>
                            {getFieldError('email') && <p className="text-red-400 text-xs mt-1">{getFieldError('email')}</p>}
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full bg-white/10 border ${getFieldError('password') ? 'border-red-500/50' : 'border-white/10'} rounded-lg pl-12 pr-12 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50`}
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
                            {getFieldError('password') && <p className="text-red-400 text-xs mt-1">{getFieldError('password')}</p>}
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password_confirmation}
                                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/10 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.password_confirmation}
                            className="w-full py-3 bg-[#FF4D6D] text-white rounded-lg font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-white/60 text-sm text-center">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#FF4D6D] hover:underline font-medium">
                                Sign In
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
