import React, { useState, useRef } from 'react';
import { Icons } from '../../utils/icons';
import { callApi, API_BASE_URL } from '../../utils/api';
import axios from 'axios';

const ManagementTab = ({ orders, setIsEnlisting, setIsEnlistingRoom, handleUpdateOrderStatus, currentUser, tournaments, setTournaments, products, setEditingProduct, handleRemoveProduct, showNotify }) => {
  const [distributingRoomId, setDistributingRoomId] = useState(null);
  const [roomCreds, setRoomCreds] = useState('');
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const qrInputRef = useRef(null);

  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingQR(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('admin_user', currentUser.username);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/upload_qr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        showNotify("QR_CODE_UPDATED");
      } else {
        showNotify(res.data.message, "error");
      }
    } catch (error) {
      console.error("QR Upload Error:", error);
      showNotify("NETWORK_ERROR: FAILED_UPLOAD", "error");
    } finally {
      setIsUploadingQR(false);
      if (qrInputRef.current) qrInputRef.current.value = '';
    }
  };

  const handleDistribute = async (e) => {
    e.preventDefault();
    if (!roomCreds) return;
    const res = await callApi('distribute_room_creds', {
      admin_user: currentUser.username,
      tournament_id: distributingRoomId,
      credentials: roomCreds
    });
    if (res.success) {
      showNotify("CREDS_DISTRIBUTED");
      setDistributingRoomId(null);
      setRoomCreds('');
    } else showNotify(res.message, "error");
  };

  const handleRemoveRoomLocal = async (rId) => {
    const res = await callApi('remove_room', { admin_user: currentUser.username, room_id: rId });
    if (res.success) {
      setTournaments(prev => prev.filter(t => t._id !== rId));
      showNotify("ROOM_DESTROYED");
    } else showNotify(res.message, "error");
  };

  const handleUpdateStatus = (oId, status) => {
    handleUpdateOrderStatus(oId, status);
  };

  return (
    <div className="space-y-12">
      <header><h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-red-600">Administrative Hub</h2></header>

      {/* Distribution Modal */}
      {distributingRoomId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-md relative">
              <button onClick={() => setDistributingRoomId(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><Icons.X className="w-6 h-6" /></button>
              <h3 className="text-2xl font-black uppercase mb-8 text-red-600 italic">Distribute ID/PASS</h3>
              <form onSubmit={handleDistribute} className="space-y-6">
                 <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Credentials</label><input required type="text" value={roomCreds} onChange={(e) => setRoomCreds(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none text-white" placeholder="ID: 1234567 | PASS: 8888" /></div>
                 <button type="submit" className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-900/40 text-white">Broadcast to Squads</button>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
         <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md"><h3 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><Icons.Zap className="w-5 h-5 text-green-500" />Asset Deployment</h3><p className="text-zinc-500 text-sm mb-8 italic">{"// Enlist new exploits or tools into the market terminal."}</p><button onClick={() => setIsEnlisting(true)} className="w-full bg-green-500/10 text-green-500 border border-green-500/20 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-600 hover:text-white transition-all">Enlist New Asset</button></div>
         <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md"><h3 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><Icons.Trophy className="w-5 h-5 text-red-600" />Simulation Control</h3><p className="text-zinc-500 text-sm mb-8 italic">{"// Deploy new combat rooms and manage simulations."}</p><button onClick={() => setIsEnlistingRoom(true)} className="w-full bg-red-600/10 text-red-600 border border-red-600/20 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all">Deploy New Room</button></div>
      </div>

      {/* Payment Configuration Section */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-[3rem] p-8 backdrop-blur-md mb-12">
         <div className="flex items-center gap-4 mb-10"><div className="w-1.5 h-10 bg-yellow-600 rounded-full" /><div><h3 className="text-2xl font-black uppercase tracking-tighter">Gateway <span className="text-yellow-600">Config</span></h3><p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase italic">Payment_Infrastructure_Management</p></div></div>
         <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-center overflow-hidden relative group">
               <img src={`${API_BASE_URL}/qr.png?v=${Date.now()}`} alt="Current QR" className="w-full h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity" onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=NO_QR_FOUND'} />
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-[8px] font-black text-white uppercase tracking-widest">Active QR</p>
               </div>
            </div>
            <div className="flex-1 space-y-4">
               <p className="text-zinc-500 text-sm italic leading-relaxed">{"Update the global payment QR code. This image will be served to all operators during fund initialization. Recommended size: 500x500px."}</p>
               <input type="file" ref={qrInputRef} onChange={handleQRUpload} className="hidden" accept="image/*" />
               <button
                  onClick={() => qrInputRef.current.click()}
                  disabled={isUploadingQR}
                  className="bg-yellow-600/10 text-yellow-600 border border-yellow-600/20 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-yellow-600 hover:text-white transition-all flex items-center gap-3"
               >
                  {isUploadingQR ? <Icons.Activity className="w-4 h-4 animate-spin" /> : <><Icons.Camera className="w-4 h-4" /> Upload New QR</>}
               </button>
            </div>
         </div>
      </div>

      {/* Asset Management Section */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-[3rem] p-8 backdrop-blur-md mb-12">
         <div className="flex items-center gap-4 mb-10"><div className="w-1.5 h-10 bg-green-600 rounded-full" /><div><h3 className="text-2xl font-black uppercase tracking-tighter">Market <span className="text-green-600">Inventory</span></h3><p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase italic">Stock_And_Pricing_Control</p></div></div>
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {products.map(p => (
               <div key={p._id} className="bg-black/40 border border-white/5 p-6 rounded-3xl flex justify-between items-center group hover:border-green-600/20 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                     <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {p.image_url ? (
                           <img src={`${API_BASE_URL}${p.image_url}`} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                           <Icons.Zap className="w-5 h-5 text-zinc-700" />
                        )}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-bold text-white uppercase tracking-tight">{p.name}</h4>
                           {p.isSoldOut && <span className="text-[7px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">Sold Out</span>}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase italic">{p.category} • {p.price} • {p.stock} units left</p>
                     </div>
                  </div>
                  <div className="flex gap-3 ml-4">
                     <button onClick={() => setEditingProduct(p)} className="bg-white/5 text-zinc-400 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Edit</button>
                     <button onClick={() => handleRemoveProduct(p._id)} className="bg-red-600/10 text-red-600 border border-red-600/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Delete</button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Room Management Section */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-[3rem] p-8 backdrop-blur-md mb-12">
         <div className="flex items-center gap-4 mb-10"><div className="w-1.5 h-10 bg-blue-600 rounded-full" /><div><h3 className="text-2xl font-black uppercase tracking-tighter">Active <span className="text-blue-600">Simulations</span></h3><p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase italic">Live_Deployment_Monitoring</p></div></div>
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {tournaments.map(t => (
               <div key={t._id} className="bg-black/40 border border-white/5 p-6 rounded-3xl flex justify-between items-center group hover:border-blue-600/20 transition-all">
                  <div>
                     <h4 className="font-bold text-white uppercase tracking-tight">{t.title}</h4>
                     <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1">{t.slots} Slots Filled • {t.map} ({t.mode})</p>
                  </div>
                  <div className="flex gap-3">
                     <button onClick={() => setDistributingRoomId(t._id)} className="bg-blue-600/10 text-blue-500 border border-blue-600/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Send ID/Pass</button>
                     <button onClick={() => handleRemoveRoomLocal(t._id)} className="bg-red-600/10 text-red-600 border border-red-600/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Delete</button>
                  </div>
               </div>
            ))}
         </div>
      </div>
      <div className="bg-zinc-900/20 border border-white/5 rounded-[3rem] p-8 backdrop-blur-md"><div className="flex justify-between items-center mb-10"><div className="flex items-center gap-4"><div className="w-1.5 h-10 bg-red-600 rounded-full" /><div><h3 className="text-2xl font-black uppercase tracking-tighter">Order <span className="text-red-600">Requests</span></h3><p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase italic">Pending_Asset_Transfers</p></div></div></div>
         <div className="space-y-4">
            {orders.filter(o => o.status === 'PENDING').map(o => (
              <div key={o.order_id} className="bg-black/60 border border-white/5 p-8 rounded-3xl flex flex-col xl:flex-row justify-between items-center gap-6 group hover:border-red-600/20 transition-all">
                 <div className="flex-1 space-y-4"><div className="flex flex-wrap items-center gap-3"><span className="text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">{o.order_id}</span><span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">@{o.username}</span></div><div className="flex flex-wrap gap-2">{o.items.map((item, idx) => <span key={idx} className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-xs font-bold uppercase">{item.name}</span>)}</div></div>
                 <div className="flex xl:flex-col items-center xl:items-end justify-between gap-6 border-t xl:border-t-0 xl:border-l border-white/10 pt-6 xl:pt-0 xl:pl-10"><p className="text-2xl font-black text-white italic">₹{o.total}</p><div className="flex gap-3"><button onClick={() => handleUpdateStatus(o.order_id, 'DEPLOYED')} className="bg-green-500 p-3 rounded-xl hover:bg-green-600 transition-all shadow-lg text-white"><Icons.ShieldCheck className="w-5 h-5" /></button><button onClick={() => handleUpdateStatus(o.order_id, 'DENIED')} className="bg-red-600 p-3 rounded-xl hover:bg-red-700 transition-all shadow-lg text-white"><Icons.X className="w-5 h-5" /></button></div></div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ManagementTab;
