import { useState, useEffect } from 'react';
import { User, Lock, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { profileApi } from '@/api/admin/profileApi';
import { useStore } from '@/store/useStore';

export default function AdminProfile() {
  const { adminUser, setAdminUser } = useStore();

  // Profile form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Per-section toasts
  const [profileToast, setProfileToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordToast, setPasswordToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (adminUser) {
      setFirstName(adminUser.firstName || '');
      setLastName(adminUser.lastName || '');
    }
  }, [adminUser]);

  useEffect(() => {
    if (profileToast) {
      const timer = setTimeout(() => setProfileToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [profileToast]);

  useEffect(() => {
    if (passwordToast) {
      const timer = setTimeout(() => setPasswordToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [passwordToast]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setProfileToast({ type: 'error', message: 'First name and last name are required.' });
      return;
    }

    setProfileLoading(true);
    try {
      const res = await profileApi.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      const data = res.data.data || res.data;
      // Update zustand store so sidebar reflects changes instantly
      if (adminUser) {
        setAdminUser({
          ...adminUser,
          firstName: data.first_name || firstName.trim(),
          lastName: data.last_name || lastName.trim(),
        });
      }

      setProfileToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileToast({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordToast({ type: 'error', message: 'All password fields are required.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordToast({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordToast({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await profileApi.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      setPasswordToast({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.current_password?.[0] ||
        err.response?.data?.message ||
        'Failed to update password.';
      setPasswordToast({ type: 'error', message: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputCls =
    'w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D6D]/50 transition-colors';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <User className="w-7 h-7 text-[#FF4D6D]" />
          My Profile
        </h1>
        <p className="text-white/60 mt-1">Manage your name and password</p>
      </div>

      {/* ─── Profile Section ──────────────────────────────────── */}
      <form onSubmit={handleProfileSave} className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-white/60" />
          Personal Information
        </h2>

        {profileToast && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              profileToast.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {profileToast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{profileToast.message}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">Email</label>
          <input
            type="email"
            value={adminUser?.email || ''}
            disabled
            className={`${inputCls} opacity-50 cursor-not-allowed`}
          />
          <p className="text-white/30 text-xs mt-1">Email cannot be changed</p>
        </div>

        <button
          type="submit"
          disabled={profileLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4D6D] text-white rounded-lg font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {profileLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* ─── Password Section ─────────────────────────────────── */}
      <form onSubmit={handlePasswordSave} className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-white/60" />
          Change Password
        </h2>

        {passwordToast && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              passwordToast.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {passwordToast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{passwordToast.message}</span>
          </div>
        )}

        <div>
          <label className="block text-white/70 text-sm mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className={inputCls}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={passwordLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          {passwordLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
