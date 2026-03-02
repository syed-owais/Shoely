import { useState } from 'react';
import { Plus, Trash2, Edit2, Calendar, Percent, DollarSign } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminPromoCodes() {
  const { promoCodes, addPromoCode, updatePromoCode, deletePromoCode } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const promoData = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: Number(formData.value),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      isActive: true,
      description: formData.description,
    };

    if (editingId) {
      updatePromoCode(editingId, promoData);
    } else {
      addPromoCode(promoData);
    }
    
    resetForm();
    setShowAddDialog(false);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
    });
    setEditingId(null);
  };

  const startEdit = (promo: typeof promoCodes[0]) => {
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minOrderAmount: promo.minOrderAmount?.toString() || '',
      maxDiscount: promo.maxDiscount?.toString() || '',
      usageLimit: promo.usageLimit?.toString() || '',
      startDate: new Date(promo.startDate).toISOString().split('T')[0],
      endDate: new Date(promo.endDate).toISOString().split('T')[0],
      description: promo.description,
    });
    setEditingId(promo.id);
    setShowAddDialog(true);
  };

  const toggleActive = (promo: typeof promoCodes[0]) => {
    updatePromoCode(promo.id, { isActive: !promo.isActive });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Promo Codes</h1>
          <p className="text-white/60">Create and manage discount codes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddDialog(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4D6D] text-white rounded-lg font-medium hover:bg-[#FF4D6D]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Promo Code
        </button>
      </div>

      {/* Promo Codes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoCodes.map((promo) => {
          const expired = isExpired(promo.endDate);
          const usagePercent = promo.usageLimit 
            ? Math.round((promo.usageCount / promo.usageLimit) * 100) 
            : 0;
          
          return (
            <div 
              key={promo.id} 
              className={`bg-white/5 rounded-xl p-6 border ${
                expired ? 'border-red-500/20' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-white">{promo.code}</span>
                    {expired && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                        Expired
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mt-1">{promo.description}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(promo)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePromoCode(promo.id)}
                    className="p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {promo.type === 'percentage' ? (
                    <Percent className="w-4 h-4 text-[#FF4D6D]" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-[#FF4D6D]" />
                  )}
                  <span className="text-white font-medium">
                    {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`} off
                  </span>
                </div>
                {promo.minOrderAmount && (
                  <span className="text-white/60 text-sm">
                    Min: ${promo.minOrderAmount}
                  </span>
                )}
              </div>

              {promo.usageLimit && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Usage</span>
                    <span className="text-white">{promo.usageCount} / {promo.usageLimit}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FF4D6D] rounded-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => toggleActive(promo)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    promo.isActive 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {promo.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {promoCodes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/60">No promo codes yet</p>
          <p className="text-white/40 text-sm mt-2">Create your first promo code to get started</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#111113] border-white/10 max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? 'Edit Promo Code' : 'Create Promo Code'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER25"
                className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50 uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Summer sale - 25% off"
                className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                >
                  <option value="percentage" className="bg-[#111113]">Percentage</option>
                  <option value="fixed" className="bg-[#111113]">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Value *</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  placeholder={formData.type === 'percentage' ? '25' : '50'}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Min Order ($)</label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="Optional"
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Max Discount ($)</label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="Optional"
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1">Usage Limit</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="Optional - leave blank for unlimited"
                className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                min="1"
              />
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
                {editingId ? 'Save Changes' : 'Create Promo Code'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
