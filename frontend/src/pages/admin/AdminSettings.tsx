import { useEffect, useState } from 'react';
import { Settings, CreditCard, Truck, Store, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { settingsApi } from '@/api/admin/settingsApi';

interface SettingItem {
    id: number;
    key: string;
    value: string | null;
    type: string;
    label: string;
    description: string;
    is_sensitive: boolean;
}

type GroupedSettings = Record<string, SettingItem[]>;

const GROUP_META: Record<string, { label: string; icon: typeof Settings; color: string }> = {
    payment: { label: 'Payment Gateways', icon: CreditCard, color: 'text-green-400' },
    courier: { label: 'Courier / Shipping', icon: Truck, color: 'text-blue-400' },
    general: { label: 'General Settings', icon: Store, color: 'text-purple-400' },
};

export default function AdminSettings() {
    const [settings, setSettings] = useState<GroupedSettings>({});
    const [activeTab, setActiveTab] = useState('payment');
    const [editedValues, setEditedValues] = useState<Record<string, string>>({});
    const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchSettings = async () => {
        try {
            const res = await settingsApi.getAll();
            setSettings(res.data.data || {});
        } catch {
            console.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setEditedValues((prev) => ({ ...prev, [key]: value }));
    };

    const toggleReveal = (key: string) => {
        setRevealedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleSave = async () => {
        const changes = Object.entries(editedValues).map(([key, value]) => ({ key, value }));
        if (changes.length === 0) return;

        setSaving(true);
        try {
            await settingsApi.update(changes);
            setToast({ type: 'success', message: 'Settings saved successfully!' });
            setEditedValues({});
            fetchSettings();
        } catch {
            setToast({ type: 'error', message: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    const getDisplayValue = (setting: SettingItem): string => {
        if (setting.key in editedValues) return editedValues[setting.key];
        return setting.value || '';
    };

    const tabGroups = Object.keys(GROUP_META);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-white/5 rounded w-64" />
                <div className="h-12 bg-white/5 rounded" />
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Settings className="w-7 h-7 text-[#FF4D6D]" />
                        Integrations & Settings
                    </h1>
                    <p className="text-white/60 mt-1">Manage payment gateways, courier APIs, and store settings</p>
                </div>
                {Object.keys(editedValues).length > 0 && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4D6D] text-white rounded-lg font-semibold hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : `Save ${Object.keys(editedValues).length} Change${Object.keys(editedValues).length > 1 ? 's' : ''}`}
                    </button>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${toast.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-1">
                {tabGroups.map((group) => {
                    const meta = GROUP_META[group];
                    const Icon = meta.icon;
                    return (
                        <button
                            key={group}
                            onClick={() => setActiveTab(group)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors
                                ${activeTab === group ? 'bg-white/10 text-white border-b-2 border-[#FF4D6D]' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                        >
                            <Icon className={`w-4 h-4 ${activeTab === group ? meta.color : ''}`} />
                            {meta.label}
                        </button>
                    );
                })}
            </div>

            {/* Settings Grid */}
            <div className="space-y-4">
                {(settings[activeTab] || []).map((setting) => (
                    <div key={setting.key} className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <label className="block text-white font-medium text-sm mb-0.5">
                                    {setting.label}
                                </label>
                                {setting.description && (
                                    <p className="text-white/40 text-xs mb-3">{setting.description}</p>
                                )}

                                {setting.type === 'boolean' ? (
                                    <button
                                        onClick={() => {
                                            const current = setting.key in editedValues
                                                ? editedValues[setting.key]
                                                : setting.value;
                                            handleChange(setting.key, current === '1' ? '0' : '1');
                                        }}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${(setting.key in editedValues ? editedValues[setting.key] : setting.value) === '1'
                                                ? 'bg-[#FF4D6D]'
                                                : 'bg-white/20'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${(setting.key in editedValues ? editedValues[setting.key] : setting.value) === '1'
                                                    ? 'translate-x-6'
                                                    : ''
                                                }`}
                                        />
                                    </button>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type={setting.is_sensitive && !revealedKeys.has(setting.key) ? 'password' : 'text'}
                                            value={getDisplayValue(setting)}
                                            onChange={(e) => handleChange(setting.key, e.target.value)}
                                            placeholder={setting.is_sensitive ? 'Enter secret value...' : `Enter ${setting.label.toLowerCase()}...`}
                                            disabled={setting.key === 'store_currency' && !!setting.value}
                                            className={`w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#FF4D6D]/50 ${setting.key === 'store_currency' && !!setting.value ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                        {setting.is_sensitive && (
                                            <button
                                                type="button"
                                                onClick={() => toggleReveal(setting.key)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                                            >
                                                {revealedKeys.has(setting.key) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {setting.key in editedValues && (
                                <span className="text-[#FF4D6D] text-xs font-medium mt-1 whitespace-nowrap">Modified</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
