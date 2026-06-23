import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './utils/icons';
import { callApi } from './utils/api';
import './index.css';

// Components - Common
import BackgroundElements from './components/common/BackgroundElements';
import TelemetryUI from './components/common/TelemetryUI';

// Components - Modals
import EnlistAssetModal from './components/modals/EnlistAssetModal';
import DeployRoomModal from './components/modals/DeployRoomModal';
import EditAssetModal from './components/modals/EditAssetModal';

// Components - Tabs
import MarketTab from './components/tabs/MarketTab';
import BgmiArenaTab from './components/tabs/BgmiArenaTab';
import CartTab from './components/tabs/CartTab';
import OrdersTab from './components/tabs/OrdersTab';
import InboxTab from './components/tabs/InboxTab';
import StatsTab from './components/tabs/StatsTab';
import CommunityTab from './components/tabs/CommunityTab';
import HelpTab from './components/tabs/HelpTab';
import ManagementTab from './components/tabs/ManagementTab';
import WalletTab from './components/tabs/WalletTab';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [telegram, setTelegram] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('market');
  const [orders, setOrders] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [registeredTournaments, setRegisteredTournaments] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnlisting, setIsEnlisting] = useState(false);
  const [isEnlistingRoom, setIsEnlistingRoom] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', desc: '', category: 'Tools', stock: 10, isSoldOut: false });
  const [newRoom, setNewRoom] = useState({ title: '', prize: '', entry: '', date: '', time: '', map: 'Erangel', mode: 'Squad' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [notification, setNotification] = useState(null);
  const [telemetry, setTelemetry] = useState({ hex: '0xAF', status: 'INIT', ping: 12, health: 98.4 });
  const [liveStats, setLiveStats] = useState({ relays: 4892, bandwidth: 892.4, latency: 12 });

  const graphSeeds = useMemo(() => Array.from({ length: 40 }, () => ({ h1: 10 + Math.random() * 20, h2: 40 + Math.random() * 50, h3: 10 + Math.random() * 20, d: 1.5 + Math.random() * 2, delay: Math.random() * 0.5 })), []);

  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn && currentUser) {
        const pRes = await callApi('fetch_products');
        if (pRes.success) setProducts(pRes.products);

        const tRes = await callApi('fetch_tournaments');
        if (tRes.success) setTournaments(tRes.tournaments);

        const oRes = await callApi('fetch_orders', { username: currentUser.username });
        if (oRes.success) setOrders(oRes.orders);

        const iRes = await callApi('fetch_inbox', { username: currentUser.username });
        if (iRes.success) {
          setMessages(iRes.messages);

          // Check for new balance in the user object if returned by a sync-enabled action
          // Note: Most fetch actions don't return the full user object, but we can
          // perform a lightweight 'sync_user' if needed.
        }

        const rRes = await callApi('fetch_registered_tournaments', { username: currentUser.username });
        if (rRes.success) setRegisteredTournaments(rRes.tournaments);

        if (currentUser.role === 'admin') {
          const aRes = await callApi('fetch_all_orders', { admin_user: currentUser.username });
          if (aRes.success) setOrders(aRes.orders);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Auto-refresh interval (every 5 seconds)
    const refreshInterval = setInterval(() => {
      if (isLoggedIn && currentUser) {
        fetchData();

        // Lightweight sync for balance and cart
        callApi('sync_profile', { username: currentUser.username }).then(res => {
          if (res.success) {
            setCurrentUser(prev => ({
              ...prev,
              balance: res.user.balance,
              cart: res.user.cart
            }));
          }
        });
      }
    }, 5000); // 5 seconds

    return () => clearInterval(refreshInterval);
  }, [isLoggedIn, currentUser, activeTab]);

  useEffect(() => {
    const markAsRead = async () => {
      if (isLoggedIn && activeTab === 'inbox') {
        const unreadMsgs = messages.filter(m => !m.read);
        if (unreadMsgs.length > 0) {
          const res = await callApi('mark_inbox_read', { username: currentUser.username });
          if (res.success) {
            setMessages(prev => prev.map(m => ({ ...m, read: true })));
          }
        }
      }
    };
    markAsRead();
  }, [activeTab, isLoggedIn, currentUser, messages]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      setTelemetry(prev => {
        const drift = (Math.random() - 0.5) * 0.5; let newHealth = prev.health + drift;
        if (newHealth < 90) newHealth = 90 + Math.random(); if (newHealth > 99.9) newHealth = 99.9 - Math.random();
        return { ...prev, hex: ['0xAF', '0x2D', '0x94', '0xBC', '0x1F'][Math.floor(Math.random() * 5)], status: 'STABLE', ping: Math.floor(Math.random() * 20) + 5, health: parseFloat(newHealth.toFixed(1)) };
      });
      let minRelays, maxRelays; if (hour >= 9 && hour <= 23) { minRelays = 4000; maxRelays = 9800; } else { minRelays = 400; maxRelays = 3000; }
      setLiveStats(prev => ({ ...prev, relays: Math.floor(Math.random() * (maxRelays - minRelays + 1)) + minRelays, bandwidth: parseFloat((800 + Math.random() * 200).toFixed(1)), latency: Math.floor(Math.random() * 20) + 5 }));
      if (Math.random() > 0.7) {
        // Log rotation logic (simulation)
      }
    }, 3000);
    return () => { window.removeEventListener('mousemove', handleMouseMove); clearInterval(interval); };
  }, []);

  const showNotify = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setStatusMessage({ text: '', type: '' });
    const res = await callApi('login', { username, password });
    if (res.success) {
      setIsLoggedIn(true);
      setCurrentUser(res.user);
      if (res.user.cart) setCart(res.user.cart);
    } else {
      setStatusMessage({ text: `ACCESS_DENIED: ${res.message}`, type: 'error' });
    }
    setIsAuthenticating(false);
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setStatusMessage({ text: '', type: '' });

    // Password Validation: 8+ chars, 1 Uppercase, 1 Number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setStatusMessage({
        text: "ERROR: Password must be 8+ chars with 1 Capital & 1 Number.",
        type: 'error'
      });
      setIsAuthenticating(false);
      return;
    }

    const res = await callApi('signup', { username, password, telegram });
    if (res.success) {
      setAuthMode('login');
      setStatusMessage({ text: "SUCCESS: NODE_REGISTERED.", type: 'success' });
    } else {
      setStatusMessage({ text: `ERROR: ${res.message}`, type: 'error' });
    }
    setIsAuthenticating(false);
  };
  const handleEnlist = async (e) => { e.preventDefault(); const res = await callApi('enlist_product', { admin_user: currentUser.username, product: newProduct }); if (res.success) { const pRes = await callApi('fetch_products'); if (pRes.success) setProducts(pRes.products); setIsEnlisting(false); setNewProduct({ name: '', price: '', desc: '', category: 'Tools', stock: 10, isSoldOut: false }); showNotify("PRODUCT_ENLISTED_SUCCESS"); } else showNotify(res.message, 'error'); };
  const handleDeployRoom = async (e) => { e.preventDefault(); const res = await callApi('enlist_room', { admin_user: currentUser.username, room: newRoom }); if (res.success) { const tRes = await callApi('fetch_tournaments'); if (tRes.success) setTournaments(tRes.tournaments); setIsEnlistingRoom(false); setNewRoom({ title: '', prize: '', entry: '', date: '', time: '', map: 'Erangel', mode: 'Squad' }); showNotify("ROOM_DEPLOYED_SUCCESS"); } else showNotify(res.message, 'error'); };
  const handleAcquire = async (product) => {
    if (product.isSoldOut) { showNotify("ERROR: SOLD OUT", 'error'); return; }
    const newCart = [...cart, product];
    setCart(newCart);
    if (isLoggedIn && currentUser) {
      await callApi('update_cart', { username: currentUser.username, cart: newCart });
    }
    showNotify(`[${product.name.toUpperCase()}] ACQUIRED.`);
  };
  const handleRegisterTournament = async (t) => {
    const res = await callApi('register_tournament', { username: currentUser.username, tournament_id: t._id });
    if (res.success) {
      const rRes = await callApi('fetch_registered_tournaments', { username: currentUser.username });
      if (rRes.success) setRegisteredTournaments(rRes.tournaments);
      if (res.new_balance !== undefined) {
        setCurrentUser({ ...currentUser, balance: res.new_balance });
      }
      showNotify("REGISTRATION SUCCESS.");
    } else {
      if (res.message.includes("Insufficient balance")) {
        showNotify("INSUFFICIENT BALANCE", 'error');
      } else {
        showNotify(res.message, 'error');
      }
    }
  };
  const handleUpdateOrderStatus = async (oId, s) => { const res = await callApi('update_order_status', { admin_user: currentUser.username, order_id: oId, status: s }); if (res.success) { const aRes = await callApi('fetch_all_orders', { admin_user: currentUser.username }); if (aRes.success) setOrders(aRes.orders); } };

  const handleEditProduct = async (pId, pData) => {
    const res = await callApi('update_product', { admin_user: currentUser.username, product_id: pId, product: pData });
    if (res.success) {
      const pRes = await callApi('fetch_products');
      if (pRes.success) setProducts(pRes.products);
      setEditingProduct(null);
    } else alert(res.message);
  };

  const handleRemoveProduct = async (pId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    const res = await callApi('remove_product', { admin_user: currentUser.username, product_id: pId });
    if (res.success) {
      const pRes = await callApi('fetch_products');
      if (pRes.success) setProducts(pRes.products);
    } else alert(res.message);
  };

  const calculateTotal = () => cart.reduce((acc, item) => { const price = parseFloat(item.price.toString().replace(/[₹,]/g, '')); return acc + (isNaN(price) ? 0 : price); }, 0).toLocaleString('en-IN');
  const handleOrder = async () => {
    const res = await callApi('checkout', { username: currentUser.username, items: cart, total: calculateTotal() });
    if (res.success) {
      showNotify("ORDER PLACED.");
      setCart([]);
      if (res.new_balance !== undefined) {
        setCurrentUser({ ...currentUser, balance: res.new_balance });
      }
      setActiveTab('orders');
    } else {
      if (res.message.includes("Insufficient balance")) {
        showNotify("INSUFFICIENT BALANCE", 'error');
      } else {
        showNotify(res.message, 'error');
      }
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020202] text-white font-sans overflow-x-hidden selection:bg-red-600">
        <BackgroundElements mousePos={mousePos} />
        <TelemetryUI telemetry={telemetry} />
        <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-2xl border-b border-white/5 px-4 sm:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="sm:hidden p-2 text-zinc-400 hover:text-white transition-colors"><Icons.Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ rotate: 180 }} className="bg-red-600 p-1.5 rounded-lg cursor-pointer"><Icons.Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></motion.div>
              <span className="font-black tracking-tighter text-lg sm:text-xl uppercase">SHADOW <span className="text-red-600">MARKET</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-8">
            {currentUser?.role === 'admin' && <div className="hidden lg:flex items-center gap-2 bg-red-600/10 px-4 py-2 rounded-full border border-red-600/20 shadow-lg"><Icons.ShieldCheck className="w-4 h-4 text-red-600" /><span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Admin</span></div>}
            <div className="flex items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block"><p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Operator Active</p><p className="text-xs font-bold text-white">@{currentUser?.username}</p></div>
                <button onClick={() => { setIsLoggedIn(false); setCurrentUser(null); }} className="p-2 sm:p-2.5 bg-red-600/10 hover:bg-red-600 rounded-lg sm:rounded-xl transition-all text-red-600 hover:text-white group border border-red-600/20"><Icons.LogOut className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-20 sm:pt-24 pb-24 sm:pb-0 flex min-h-screen relative z-20">
          <AnimatePresence>
            <EnlistAssetModal isOpen={isEnlisting} onClose={() => setIsEnlisting(false)} onSubmit={handleEnlist} newProduct={newProduct} setNewProduct={setNewProduct} />
            <DeployRoomModal isOpen={isEnlistingRoom} onClose={() => setIsEnlistingRoom(false)} onSubmit={handleDeployRoom} newRoom={newRoom} setNewRoom={setNewRoom} />
            <EditAssetModal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} onSubmit={handleEditProduct} asset={editingProduct} />

            {/* Mobile Navigation Sidebar */}
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] sm:hidden"
                />
                <motion.aside
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 left-0 bottom-0 w-[280px] bg-black z-[70] sm:hidden border-r border-white/5 p-6 flex flex-col gap-8 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icons.Shield className="w-5 h-5 text-red-600" />
                      <span className="font-black tracking-tighter text-lg uppercase">SHADOW <span className="text-red-600">MARKET</span></span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <Icons.X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1">
                    {[
                      { id: 'market', icon: Icons.LayoutDashboard, label: "Market Terminal" },
                      { id: 'bgmi', icon: Icons.Trophy, label: "BGMI Arena" },
                      { id: 'cart', icon: Icons.ShoppingCart, label: `Cart (${cart.length})` },
                      { id: 'wallet', icon: Icons.Zap, label: `Wallet (₹${currentUser?.balance || 0})` },
                      { id: 'orders', icon: Icons.Package, label: "Order History" },
                      { id: 'inbox', icon: Icons.Mail, label: "System Inbox", count: messages.filter(m => !m.read).length },
                      { id: 'stats', icon: Icons.Activity, label: "Network Stats" },
                      { id: 'join', icon: Icons.Send, label: "Community" },
                      { id: 'help', icon: Icons.HelpCircle, label: "Help Center" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon className="w-5 h-5 shrink-0" />
                          <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                        {item.count > 0 && <span className="flex w-5 h-5 bg-white text-red-600 text-[10px] font-black items-center justify-center rounded-full">{item.count}</span>}
                      </button>
                    ))}
                    {currentUser?.role === 'admin' && (
                      <div className="pt-4 mt-4 border-t border-white/5">
                        <button
                          onClick={() => { setActiveTab('management'); setIsMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeTab === 'management' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                          <Icons.ShieldCheck className="w-5 h-5 shrink-0" />
                          <span className="text-xs font-black uppercase tracking-widest">Management Hub</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600 font-bold border border-red-600/20">
                        {currentUser?.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Active Operator</p>
                        <p className="text-xs font-bold text-white">@{currentUser?.username}</p>
                      </div>
                      <button onClick={() => { setIsLoggedIn(false); setCurrentUser(null); }} className="p-2 text-zinc-500 hover:text-red-600 transition-colors">
                        <Icons.LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <aside className="w-20 lg:w-64 border-r border-white/5 p-4 lg:p-6 hidden sm:flex flex-col gap-8 bg-black/40 backdrop-blur-md sticky top-24 h-[calc(100vh-6rem)]">
            <div className="space-y-2">
              {[
                { id: 'market', icon: Icons.LayoutDashboard, label: "Market Terminal" },
                { id: 'bgmi', icon: Icons.Trophy, label: "BGMI Arena" },
                { id: 'cart', icon: Icons.ShoppingCart, label: `Cart (${cart.length})` },
                { id: 'wallet', icon: Icons.Zap, label: `Wallet (₹${currentUser?.balance || 0})` },
                { id: 'orders', icon: Icons.Package, label: "Order History" },
                { id: 'inbox', icon: Icons.Mail, label: "System Inbox", count: messages.filter(m => !m.read).length },
                { id: 'stats', icon: Icons.Activity, label: "Network Stats" },
                { id: 'join', icon: Icons.Send, label: "Community" },
                { id: 'help', icon: Icons.HelpCircle, label: "Help Center" },
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                  <div className="flex items-center gap-4"><item.icon className="w-5 h-5 shrink-0" /><span className="hidden lg:block text-xs font-black uppercase tracking-widest">{item.label}</span></div>
                  {item.count > 0 && <span className="hidden lg:flex w-5 h-5 bg-white text-red-600 text-[10px] font-black items-center justify-center rounded-full animate-bounce">{item.count}</span>}
                </button>
              ))}
              {currentUser?.role === 'admin' && (
                <div className="pt-8">
                  <button onClick={() => setActiveTab('management')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeTab === 'management' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                    <Icons.ShieldCheck className="w-5 h-5 shrink-0" /><span className="hidden lg:block text-xs font-black uppercase tracking-widest">Management Hub</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-full overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {activeTab === 'market' && <MarketTab products={products} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleAcquire={handleAcquire} />}
                {activeTab === 'bgmi' && <BgmiArenaTab tournaments={tournaments} registeredTournaments={registeredTournaments} handleRegisterTournament={handleRegisterTournament} currentUser={currentUser} />}
                {activeTab === 'cart' && <CartTab cart={cart} setCart={(newCart) => {
                  setCart(newCart);
                  if (isLoggedIn && currentUser) {
                    callApi('update_cart', { username: currentUser.username, cart: newCart });
                  }
                }} calculateTotal={calculateTotal} handleOrder={handleOrder} />}
                {activeTab === 'orders' && <OrdersTab orders={orders} />}
                {activeTab === 'inbox' && <InboxTab messages={messages} />}
                {activeTab === 'wallet' && <WalletTab currentUser={currentUser} setCurrentUser={setCurrentUser} orders={orders} registeredTournaments={registeredTournaments} showNotify={showNotify} />}
                {activeTab === 'stats' && <StatsTab liveStats={liveStats} graphSeeds={graphSeeds} telemetry={telemetry} />}
                {activeTab === 'join' && <CommunityTab />}
                {activeTab === 'help' && <HelpTab />}
                {activeTab === 'management' && currentUser?.role === 'admin' && <ManagementTab
                  orders={orders}
                  setIsEnlisting={setIsEnlisting}
                  setIsEnlistingRoom={setIsEnlistingRoom}
                  handleUpdateOrderStatus={handleUpdateOrderStatus}
                  currentUser={currentUser}
                  tournaments={tournaments}
                  setTournaments={setTournaments}
                  products={products}
                  setEditingProduct={setEditingProduct}
                  handleRemoveProduct={handleRemoveProduct}
                  showNotify={showNotify}
                />}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Bottom Navigation for Mobile */}
          <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-2xl border-t border-white/5 px-2 py-3 sm:hidden z-50 flex justify-around items-center h-20">
            {[
              { id: 'market', icon: Icons.LayoutDashboard, label: "Market" },
              { id: 'bgmi', icon: Icons.Trophy, label: "Arena" },
              { id: 'cart', icon: Icons.ShoppingCart, label: "Cart", count: cart.length },
              { id: 'wallet', icon: Icons.Zap, label: "Wallet" },
              { id: 'inbox', icon: Icons.Mail, label: "Inbox", count: messages.filter(m => !m.read).length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-red-500 scale-110' : 'text-zinc-500'}`}
              >
                <div className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-red-500/10' : ''}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                {item.count > 0 && <span className="absolute -top-1 -right-1 flex w-4 h-4 bg-red-600 text-white text-[8px] font-black items-center justify-center rounded-full border border-black">{item.count}</span>}
              </button>
            ))}
          </nav>
        </div>
        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-24 sm:bottom-10 right-4 sm:right-10 z-[100] pointer-events-none">
              <div className={`px-8 py-4 rounded-2xl backdrop-blur-2xl border shadow-2xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-600/20 border-red-600/30 text-red-500' : 'bg-green-600/20 border-green-600/30 text-green-500'}`}>
                {notification.type === 'error' ? <Icons.AlertTriangle className="w-5 h-5" /> : <Icons.ShieldCheck className="w-5 h-5" />}
                <div className="flex flex-col">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1">{notification.type === 'error' ? 'Security_Alert' : 'System_Confirmed'}</p>
                  <p className="text-xs font-bold uppercase tracking-widest">{notification.text}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- AUTH UI ---
  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 selection:bg-red-600 overflow-hidden relative font-sans">
      <BackgroundElements mousePos={mousePos} />
      <TelemetryUI telemetry={telemetry} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="relative w-[88%] max-w-[330px] sm:w-full sm:max-w-[420px] z-20">
        <div className="text-center mb-6 sm:mb-10 relative"><h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white uppercase italic leading-none whitespace-nowrap">SHADOW <span className="text-red-600 not-italic">MARKET</span></h1><div className="flex items-center justify-center gap-8 sm:gap-12 mt-6 sm:mt-10"><button type="button" onClick={() => setAuthMode('login')} className={`pb-2 text-xs sm:text-sm font-black uppercase tracking-[0.4em] border-b-2 transition-all ${authMode === 'login' ? 'text-red-600 border-red-600' : 'text-zinc-500 border-transparent'}`}>LOGIN</button><div className="h-4 w-[1px] bg-zinc-800" /><button type="button" onClick={() => setAuthMode('signup')} className={`pb-2 text-xs sm:text-sm font-black uppercase tracking-[0.4em] border-b-2 transition-all ${authMode === 'signup' ? 'text-red-600 border-red-600' : 'text-zinc-500 border-transparent'}`}>SIGN UP</button></div></div>
        <div className="relative group">
          <div className="absolute -top-4 -left-4 w-10 h-10 border-t-4 border-l-4 border-red-600 z-30" /><div className="absolute -top-4 -right-4 w-10 h-10 border-t-4 border-r-4 border-zinc-800 z-30" /><div className="absolute -bottom-4 -left-4 w-10 h-10 border-b-4 border-l-4 border-zinc-800 z-30" /><div className="absolute -bottom-4 -right-4 w-10 h-10 border-b-4 border-r-4 border-red-600 z-30" />
          <div className="bg-zinc-900/40 border border-white/5 py-10 px-5 sm:p-10 backdrop-blur-[100px] relative overflow-hidden"><motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute top-0 w-40 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
            <AnimatePresence mode="wait"><motion.form key={authMode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-8">
                <div className="space-y-3"><label className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">Operator ID</label><div className="relative"><Icons.Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" /><input required type="text" placeholder="Enter ID..." value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/60 border-l-4 border-zinc-800 py-4 pl-14 text-white outline-none focus:border-red-600 transition-all font-mono text-sm tracking-widest" /></div></div>
                <div className="space-y-3"><label className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">Security Key</label><div className="relative"><Icons.Cpu className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" /><input required type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/60 border-l-4 border-zinc-800 py-4 pl-14 text-white outline-none focus:border-red-600 transition-all font-mono text-sm" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-red-600">{showPassword ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}</button></div></div>
                {authMode === 'signup' && <div className="space-y-3"><label className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">Telegram Handle</label><div className="relative"><Icons.MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" /><input type="text" placeholder="@username" value={telegram} onChange={(e) => setTelegram(e.target.value)} className="w-full bg-black/60 border-l-4 border-zinc-800 py-4 pl-14 text-white outline-none focus:border-red-600 transition-all font-mono text-sm tracking-widest" /></div></div>}

                {statusMessage.text && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-center ${statusMessage.type === 'error' ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 'bg-green-600/10 text-green-500 border border-green-500/20'}`}>
                    {statusMessage.text}
                  </motion.div>
                )}

                <button type="submit" disabled={isAuthenticating} className="w-full relative group/btn overflow-hidden text-white"><div className="absolute inset-0 bg-red-600 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300" /><div className={`relative z-10 py-4 border-2 ${isAuthenticating ? 'border-zinc-800' : 'border-red-600'} flex items-center justify-center gap-4 transition-all`}>{isAuthenticating ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><Icons.Activity className="w-5 h-5" /></motion.div> : <><span className="text-[10px] font-black uppercase tracking-[0.4em] group-hover/btn:text-white">{authMode === 'login' ? 'LOGIN' : 'SIGN UP'}</span><Icons.ChevronRight className="w-4 h-4" /></>}</div ></button>
              </motion.form></AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default App;
