import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { adminProductApi } from '@/api/admin/productApi';
import { productApi } from '@/api/consumer/productApi';
import api from '@/lib/axios';
import type { Product } from '@/types';

const fallbackConditions = ['Like New', 'Excellent', 'Very Good', 'Good'];
const fallbackBrands = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Vans'];
const fallbackCategories = ['Lifestyle', 'Basketball', 'Running', 'Skateboarding', 'Casual'];
const fallbackSizes = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14];

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [conditions, setConditions] = useState<string[]>(fallbackConditions);
  const [brands, setBrands] = useState<string[]>(fallbackBrands);
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  const [defaultSizes, setDefaultSizes] = useState<number[]>(fallbackSizes);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: fallbackBrands[0],
    model: '',
    price: 0,
    originalPrice: undefined,
    images: [],
    sizes: fallbackSizes.map(size => ({ size, available: true, quantity: 5 })),
    condition: 'Like New',
    description: '',
    features: [],
    sku: '',
    category: fallbackCategories[0],
    tags: [],
    isActive: true,
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSize, setNewSize] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ignore = false;
    api.get('/api/product-attributes').then(res => {
      if (ignore) return;
      const data = res.data.body || res.data;
      if (data.product_conditions?.length) setConditions(data.product_conditions);
      if (data.product_brands?.length) setBrands(data.product_brands);
      if (data.product_categories?.length) setCategories(data.product_categories);
      if (data.product_sizes?.length) {
        setDefaultSizes(data.product_sizes);
        if (!isEditing) {
          setFormData(prev => ({
            ...prev,
            brand: data.product_brands?.[0] || prev.brand,
            category: data.product_categories?.[0] || prev.category,
            condition: data.product_conditions?.[0] || prev.condition,
            sizes: data.product_sizes.map((size: number) => ({ size, available: true, quantity: 5 })),
          }));
        }
      }
    }).catch(err => {
      if (!ignore) console.error('Failed to load product attributes:', err);
    });
    return () => { ignore = true; };
  }, [isEditing]);

  useEffect(() => {
    let ignore = false;
    if (isEditing && id) {
      productApi.getById(id).then(res => {
        if (!ignore) {
          const product = res.data.data || res.data;
          setFormData(product);
        }
      }).catch(err => {
        if (!ignore) console.error('Failed to load product:', err);
      });
    }
    return () => { ignore = true; };
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

  const addSize = async () => {
    const s = parseFloat(newSize);
    if (!isNaN(s) && !formData.sizes?.find(x => x.size === s)) {
      // Save to database
      try {
        await api.post('/api/admin/product-attributes', { type: 'size', value: s.toString() });
        setDefaultSizes(prev => [...prev, s].sort((a, b) => a - b));
      } catch (err) {
        console.error('Failed to save new size:', err);
      }

      setFormData(prev => ({
        ...prev,
        sizes: [...(prev.sizes || []), { size: s, available: true, quantity: 5 }].sort((a, b) => a.size - b.size),
      }));
      setNewSize('');
    }
  };

  const handleCreateAttribute = async (type: 'brand' | 'category', value: string) => {
    if (!value.trim()) return;
    try {
      await api.post('/api/admin/product-attributes', { type, value: value.trim() });
      if (type === 'brand') setBrands(prev => [...prev, value.trim()]);
      if (type === 'category') setCategories(prev => [...prev, value.trim()]);
      setFormData(prev => ({ ...prev, [type]: value.trim() }));
    } catch (err) {
      console.error(`Failed to create ${type}:`, err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    const fd = new FormData();
    fd.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/api/admin/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.body?.url || res.data.url;
      if (url) {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...(prev.features || []), newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features?.filter((_, i) => i !== index) || [] }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter((_, i) => i !== index) || [] }));
  };

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: state.isFocused ? 'rgba(255, 77, 109, 0.5)' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      padding: '2px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'rgba(255, 77, 109, 0.5)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#1a1a1d',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 50
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgba(255, 77, 109, 0.2)' : 'transparent',
      color: state.isFocused ? '#FF4D6D' : 'white',
      '&:active': {
        backgroundColor: 'rgba(255, 77, 109, 0.3)'
      }
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white'
    }),
    input: (base: any) => ({
      ...base,
      color: 'white'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: 'rgba(255, 255, 255, 0.5)'
    }),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-white/60">{isEditing ? 'Update product details' : 'Create a new product listing'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Product Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50" />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Brand *</label>
                    <CreatableSelect
                      isClearable
                      options={brands.map(b => ({ value: b, label: b }))}
                      value={formData.brand ? { value: formData.brand, label: formData.brand } : null}
                      onChange={(newValue: any) => setFormData({ ...formData, brand: newValue?.value || '' })}
                      onCreateOption={(inputValue) => {
                        handleCreateAttribute('brand', inputValue);
                      }}
                      styles={customStyles}
                      className="w-full text-sm"
                      placeholder="Select or type..."
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Model</label>
                    <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Price *</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50" />
                    {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Original Price</label>
                    <input type="number" value={formData.originalPrice || ''} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50" />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">SKU *</label>
                    <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50" />
                    {errors.sku && <p className="text-red-400 text-sm mt-1">{errors.sku}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Category</label>
                    <CreatableSelect
                      isClearable
                      options={categories.map(c => ({ value: c, label: c }))}
                      value={formData.category ? { value: formData.category, label: formData.category } : null}
                      onChange={(newValue: any) => setFormData({ ...formData, category: newValue?.value || '' })}
                      onCreateOption={(inputValue) => {
                        handleCreateAttribute('category', inputValue);
                      }}
                      styles={customStyles}
                      className="w-full text-sm"
                      placeholder="Select or type..."
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Condition</label>
                    <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })} className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50">
                      {conditions.map(c => <option key={c} value={c} className="bg-[#111113]">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1">Description *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D6D]/50 resize-none" />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">Images</h2>
                <div className="flex bg-white/10 rounded-lg p-1">
                  <button type="button" onClick={() => setImageMode('url')} className={`px-3 py-1 text-sm rounded-md transition-colors ${imageMode === 'url' ? 'bg-[#FF4D6D] text-white' : 'text-white/60 hover:text-white'}`}>URL</button>
                  <button type="button" onClick={() => setImageMode('upload')} className={`px-3 py-1 text-sm rounded-md transition-colors ${imageMode === 'upload' ? 'bg-[#FF4D6D] text-white' : 'text-white/60 hover:text-white'}`}>Upload</button>
                </div>
              </div>

              <div className="space-y-4">
                {imageMode === 'url' ? (
                  <div className="flex gap-2">
                    <input type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Image URL" className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50" />
                    <button type="button" onClick={addImage} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"><Plus className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" id="imageUpload" />
                    <label htmlFor="imageUpload" className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 rounded-lg py-4 cursor-pointer transition-colors text-white/60 hover:text-white">
                      <Upload className="w-5 h-5" />
                      {uploadingImage ? 'Uploading...' : 'Click to select an image'}
                    </label>
                  </div>
                )}
                {errors.images && <p className="text-red-400 text-sm">{errors.images}</p>}

                <div className="grid grid-cols-4 gap-4">
                  {formData.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
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
                <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Add a feature" className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50" />
                <button type="button" onClick={addFeature} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features?.map((feature, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white text-sm rounded-full">
                    {feature}
                    <button type="button" onClick={() => removeFeature(idx)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-4">Tags</h2>
              <div className="flex gap-2 mb-4">
                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add a tag" className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF4D6D]/50" />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-[#FF4D6D]/20 text-[#FF4D6D] text-sm rounded-full">
                    {tag}
                    <button type="button" onClick={() => removeTag(idx)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="font-semibold text-white mb-4">Status</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded border-white/20 bg-white/10 text-[#FF4D6D] focus:ring-[#FF4D6D]" />
                <span className="text-white">Active</span>
              </label>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">Size Availability</h2>
              </div>

              <div className="flex gap-2 mb-4">
                <input type="number" step="0.5" value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Add size (e.g. 15)" className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF4D6D]/50" />
                <button type="button" onClick={addSize} className="px-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>

              <div className="space-y-2 max-h-96 overflow-auto pr-2">
                {formData.sizes?.map((sizeInfo) => (
                  <div key={sizeInfo.size} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <span className="w-10 text-white font-medium">{sizeInfo.size}</span>
                    <input type="number" value={sizeInfo.quantity} onChange={(e) => handleSizeChange(sizeInfo.size, 'quantity', Number(e.target.value))} className="w-16 bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-sm text-center" min="0" />
                    <label className="flex items-center gap-2 ml-auto">
                      <input type="checkbox" checked={sizeInfo.available} onChange={(e) => handleSizeChange(sizeInfo.size, 'available', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#FF4D6D]" />
                      <span className="text-white/60 text-sm">Avail</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/admin/products')} className="flex-1 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#FF4D6D] text-white rounded-lg font-medium hover:bg-[#FF4D6D]/90 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
