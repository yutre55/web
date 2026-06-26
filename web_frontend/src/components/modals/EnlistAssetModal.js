import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../utils/icons';
import { API_BASE_URL } from '../../utils/api';
import axios from 'axios';

const EnlistAssetModal = ({ isOpen, onClose, onSubmit, newProduct, setNewProduct, currentUser }) => {
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('admin_user', currentUser.username);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/upload_product_image`, formData);
      if (res.data.success) {
        setNewProduct({ ...newProduct, image_url: res.data.image_url });
      }
    } catch (err) {
      console.error("Upload Error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"><Icons.X className="w-6 h-6" /></button>
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic text-red-600">Enlist Asset</h3>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Product Image (Optional)</label>
            <div className="relative group h-40 bg-black/40 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all hover:border-red-600/30">
              {newProduct.image_url ? (
                <>
                  <img src={`${API_BASE_URL}${newProduct.image_url}`} alt="Preview" className="w-full h-full object-contain" />
                  <button type="button" onClick={() => setNewProduct({ ...newProduct, image_url: '' })} className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"><Icons.X className="w-3 h-3" /></button>
                </>
              ) : (
                <>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {isUploading ? <Icons.Activity className="w-6 h-6 text-red-600 animate-spin" /> : <Icons.Camera className="w-6 h-6 text-zinc-700 group-hover:text-red-600 transition-colors" />}
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-2">Upload Preview</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Asset Name</label><input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all" placeholder="Enter name..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Price (₹)</label><input required type="text" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all" placeholder="₹4,500" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Category</label><select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all appearance-none text-white"><option value="Tools">Tools</option><option value="HACKS">HACKS</option><option value="CCs">CCs</option><option value="Scripts">Scripts</option><option value="SOURCE">SOURCE</option></select></div>
          </div>
          <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Description</label><textarea required value={newProduct.desc} onChange={(e) => setNewProduct({ ...newProduct, desc: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all min-h-[100px]" placeholder="Technical breakdown..." /></div>
          <button type="submit" className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-red-900/40 hover:bg-red-700 transition-all text-white">Deploy to Market</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EnlistAssetModal;
