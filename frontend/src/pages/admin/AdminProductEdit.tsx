import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { adminProductApi } from '@/api/admin/productApi';
import { productApi } from '@/api/consumer/productApi';
import type { Product } from '@/types';

const conditions = ['Like New', 'Excellent', 'Very Good', 'Good'];
const brands = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Vans'];
const categories = ['Lifestyle', 'Basketball', 'Running', 'Skateboarding', 'Casual'];

const defaultSizes = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14];

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: brands[0],
    model: '',
    price: 0,
    originalPrice: undefined,
    images: [],
    sizes: defaultSizes.map(size => ({ size, available: true, quantity: 5 })),
    condition: 'Like New',
    description: '',
    features: [],
    sku: '',
    category: categories[0],
    tags: [],
    isActive: true,
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      productApi.getById(id).then(res => {
        const product = res.data.data || res.data;
        setFormData(product);
      }).catch(err => console.error('Failed to load product:', err));
    }
  }, [isEditing, id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.images?.length) newErrors.images = 'At least one image is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        price: formData.price,
        original_price: formData.originalPrice,
        images: formData.images,
        condition: formData.condition,
        description: formData.description,
        features: formData.features,
        sku: formData.sku,
        category: formData.category,
        tags: formData.tags,
        is_active: formData.isActive,
        sizes: formData.sizes,
      };

      if (isEditing && id) {
        await adminProductApi.update(id, payload);
      } else {
        await adminProductApi.create(payload);
      }
      navigate('/admin/products');
    } catch (err: any) {
      console.error('Failed to save product:', err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSizeChange = (size: number, field: 'available' | 'quantity', value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes?.map(s =>
        s.size === size ? { ...s, [field]: value } : s
      ) || [],
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || [],
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-white/60">
            {isEditing ? 'Update product details' : 'Create a new product listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                    placeholder="e.g., Air Jordan 1 High Heritage"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Brand *</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                    >
                      {brands.map(b => <option key={b} value={b} className="bg-[#111113]">{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                      placeholder="e.g., Air Jordan 1"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Price *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                      placeholder="0.00"
                    />
                    {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Original Price</label>
                    <input
                      type="number"
                      value={formData.originalPrice || ''}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">SKU *</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                      placeholder="e.g., AJ1-HH-001"
                    />
                    {errors.sku && <p className="text-red-400 text-sm mt-1">{errors.sku}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                    >
                      {categories.map(c => <option key={c} value={c} className="bg-[#111113]">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50"
                    >
                      {conditions.map(c => <option key={c} value={c} className="bg-[#111113]">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50 resize-none"
                    placeholder="Describe the product..."
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-4">Images</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {errors.images && <p className="text-red-400 text-sm">{errors.images}</p>}

                <div className="grid grid-cols-4 gap-4">
                  {formData.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-4">Features</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features?.map((feature, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white text-sm rounded-full">
                    {feature}
                    <button type="button" onClick={() => removeFeature(idx)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-4">Tags</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-[#FF4D6D]/20 text-[#FF4D6D] text-sm rounded-full">
                    {tag}
                    <button type="button" onClick={() => removeTag(idx)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sizes & Status */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-4">Status</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-[#FF4D6D] focus:ring-[#FF4D6D]"
                />
                <span className="text-white">Active</span>
              </label>
            </div>

            {/* Sizes */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-4">Size Availability</h2>
              <div className="space-y-2 max-h-96 overflow-auto">
                {formData.sizes?.map((sizeInfo) => (
                  <div key={sizeInfo.size} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <span className="w-10 text-white font-medium">{sizeInfo.size}</span>
                    <input
                      type="number"
                      value={sizeInfo.quantity}
                      onChange={(e) => handleSizeChange(sizeInfo.size, 'quantity', Number(e.target.value))}
                      className="w-16 bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-sm text-center"
                      min="0"
                    />
                    <label className="flex items-center gap-2 ml-auto">
                      <input
                        type="checkbox"
                        checked={sizeInfo.available}
                        onChange={(e) => handleSizeChange(sizeInfo.size, 'available', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#FF4D6D]"
                      />
                      <span className="text-white/60 text-sm">Available</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="flex-1 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-[#FF4D6D] text-white rounded-lg font-medium hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
