import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get('token') || '';
    const emailFromUrl = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailFromUrl);
    const [token] = useState(tokenFromUrl);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/api/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            setSuccess(response.data.message || 'Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.email?.[0] ||
                err.response?.data?.errors?.password?.[0] ||
                'Something went wrong. The link may have expired.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h2>
                        <p className="text-white/50 text-sm mb-6">
                            This password reset link is invalid or has expired.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block px-6 py-3 bg-[#FF4D6D] text-white rounded-lg font-semibold hover:bg-[#FF4D6D]/90 transition-colors"
                        >
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/">
                        <h1 className="font-display font-black text-3xl text-white mb-2">SHOELY</h1>
                    </Link>
                    <p className="text-white/60">Set your new password</p>
                </div>

                {/* Form */}
                <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-6">Reset Password</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-500/10 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p className="text-green-400 text-sm">{success} Redirecting to login...</p>
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
                            <label className="block text-white/70 text-sm mb-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/10 border border-white/10 rounded-lg pl-12 pr-12 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50"
                                    required
                                    minLength={8}
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

                        <div>
                            <label className="block text-white/70 text-sm mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/10 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email || !password || !passwordConfirmation || !!success}
                            className="w-full py-3 bg-[#FF4D6D] text-white rounded-lg font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-white/60 text-sm text-center">
                            <Link to="/login" className="text-[#FF4D6D] hover:underline font-medium">
                                Back to Sign In
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
