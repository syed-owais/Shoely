import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, Percent, DollarSign, Megaphone, Eye, EyeOff } from 'lucide-react';
import { adminCampaignApi } from '@/api/admin/campaignApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const brands = ['All', 'Nike', 'Jordan', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Vans'];
const categories = ['All', 'Lifestyle', 'Basketball', 'Running', 'Skateboarding', 'Casual'];

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    brand: '',
    category: '',
  });

  const fetchCampaigns = async () => {
    try {
      const res = await adminCampaignApi.getAll();
      setCampaigns(res.data.data || []);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const campaignData = {
      name: formData.name,
      description: formData.description,
      discount_type: formData.discountType,
      discount_value: Number(formData.discountValue),
      start_date: new Date(formData.startDate).toISOString(),
      end_date: new Date(formData.endDate).toISOString(),
      is_active: true,
      brand: formData.brand || undefined,
      category: formData.category || undefined,
    };

    try {
      if (editingId) {
        await adminCampaignApi.update(editingId, campaignData);
      } else {
        await adminCampaignApi.create(campaignData);
      }
      resetForm();
      setShowAddDialog(false);
      fetchCampaigns();
    } catch (err) {
      console.error('Failed to save campaign:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      brand: '',
      category: '',
    });
    setEditingId(null);
  };

  const startEdit = (campaign: any) => {
    setFormData({
      name: campaign.name,
      description: campaign.description,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      startDate: new Date(campaign.startDate).toISOString().split('T')[0],
      endDate: new Date(campaign.endDate).toISOString().split('T')[0],
      brand: campaign.brand || '',
      category: campaign.category || '',
    });
    setEditingId(campaign.id);
    setShowAddDialog(true);
  };

  const toggleActive = async (campaign: any) => {
    try {
      await adminCampaignApi.update(campaign.id, { is_active: !campaign.isActive });
      fetchCampaigns();
    } catch (err) {
      console.error('Failed to toggle campaign:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminCampaignApi.delete(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const isActive = (campaign: any) => {
    const now = new Date();
    return campaign.isActive && new Date(campaign.startDate) <= now && new Date(campaign.endDate) >= now;
  };

  const isExpired = (campaign: any) => {
    return new Date(campaign.endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-48" />
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-52 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-white/60">Create promotional campaigns and sales</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddDialog(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4D6D] text-white rounded-lg font-medium hover:bg-[#FF4D6D]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {campaigns.map((campaign: any) => {
          const active = isActive(campaign);
          const expired = isExpired(campaign);

          return (
            <div
              key={campaign.id}
              className={`bg-white/5 rounded-xl p-6 border ${active ? 'border-[#FF4D6D]/30' : expired ? 'border-red-500/20' : 'border-white/10'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-lg">{campaign.name}</h3>
                    {active && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Active
                      </span>
                    )}
                    {expired && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                        Expired
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{campaign.description}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(campaign)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FF4D6D]/20 rounded-lg">
                  {campaign.discountType === 'percentage' ? (
                    <Percent className="w-4 h-4 text-[#FF4D6D]" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-[#FF4D6D]" />
                  )}
                  <span className="text-[#FF4D6D] font-semibold">
                    {campaign.discountType === 'percentage' ? `${campaign.discountValue}%` : `$${campaign.discountValue}`} off
                  </span>
                </div>
                {(campaign.brand || campaign.category) && (
                  <div className="flex gap-2">
                    {campaign.brand && (
                      <span className="px-2 py-1 bg-white/10 text-white/70 text-sm rounded-full">
                        {campaign.brand}
                      </span>
                    )}
                    {campaign.category && (
                      <span className="px-2 py-1 bg-white/10 text-white/70 text-sm rounded-full">
                        {campaign.category}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => toggleActive(campaign)}
                  className={`p-2 rounded-lg transition-colors ${campaign.isActive
                      ? 'text-green-400 hover:bg-green-500/10'
                      : 'text-white/40 hover:bg-white/10'
                    }`}
                >
                  {campaign.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">No campaigns yet</p>
          <p className="text-white/40 text-sm mt-2">Create your first campaign to promote your products</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#111113] border-white/10 max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? 'Edit Campaign' : 'Create Campaign'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">Campaign Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Sale"
                className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Get up to 25% off selected items"
                className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                >
                  <option value="percentage" className="bg-[#111113]">Percentage</option>
                  <option value="fixed" className="bg-[#111113]">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Discount Value *</label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  placeholder={formData.discountType === 'percentage' ? '25' : '50'}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Brand Filter (Optional)</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                >
                  <option value="" className="bg-[#111113]">All Brands</option>
                  {brands.filter(b => b !== 'All').map(b => (
                    <option key={b} value={b} className="bg-[#111113]">{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Category Filter (Optional)</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                >
                  <option value="" className="bg-[#111113]">All Categories</option>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c} className="bg-[#111113]">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddDialog(false)}
                className="flex-1 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#FF4D6D] text-white rounded-lg hover:bg-[#FF4D6D]/90 transition-colors"
              >
                {editingId ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
