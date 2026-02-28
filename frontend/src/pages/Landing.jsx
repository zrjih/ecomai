import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ════════════════════════════════════════════════════════════════
   HOOKS
   ════════════════════════════════════════════════════════════════ */

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);
  return [ref, count];
}

/* ════════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════════ */

const heroWords = ['In Minutes', 'Beautifully', 'That Scales'];

const stats = [
  { value: 10000, suffix: '+', label: 'Active Stores', icon: 'M3 3h18l-2 13H5L3 3zm3 13a2 2 0 104 0m6 0a2 2 0 10-4 0' },
  { value: 2, suffix: 'M+', label: 'Orders Processed', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { value: 99, suffix: '.9%', label: 'Uptime SLA', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { value: 24, suffix: '/7', label: 'Expert Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
];

const features = [
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Lightning-Fast Storefronts',
    desc: 'Launch a stunning, mobile-first online store in minutes. 8 designer templates with full branding customization.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
  },
  {
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    title: 'Smart Inventory',
    desc: 'Products, variants, categories, stock tracking, and bulk operations — all from one powerful dashboard.',
    color: 'from-primary-500 to-blue-500',
    bg: 'bg-primary-50',
  },
  {
    icon: 'M3 10h18M7 14h2m4 0h4M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z',
    title: 'Secure Payments',
    desc: 'Accept SSLCommerz, bKash, Nagad, and cards. PCI-compliant checkout with instant settlement.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0a2 2 0 104 0m-4 0h4m-4 0a2 2 0 10-4 0m-6 0a2 2 0 104 0M1 16h2m13-10h2l3 5v5h-2',
    title: 'Delivery Tracking',
    desc: 'Built-in driver assignment, live GPS tracking, SMS notifications, and delivery proof capture.',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h6m-6 0H3m12 0v-9a2 2 0 012-2h2a2 2 0 012 2v9m-6 0h6',
    title: 'Real-Time Analytics',
    desc: 'Revenue dashboards, customer insights, product performance, and conversion funnels at a glance.',
    color: 'from-cyan-500 to-primary-500',
    bg: 'bg-cyan-50',
  },
  {
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    title: 'Marketing Suite',
    desc: 'Email & SMS campaigns, popups, countdown timers, discount codes, and social integrations.',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
  },
  {
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    title: '15+ Settings Panels',
    desc: 'Branding, SEO, currency, analytics, popups, PWA, A/B testing, multi-currency — total control.',
    color: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Enterprise Security',
    desc: 'Multi-tenant isolation, rate limiting, helmet headers, encrypted credentials, and RBAC.',
    color: 'from-gray-600 to-gray-800',
    bg: 'bg-gray-100',
  },
];

const steps = [
  { num: '01', title: 'Create Your Store', desc: 'Sign up in 30 seconds. Pick a template, set your brand, add your logo.', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { num: '02', title: 'Add Products', desc: 'Upload products with variants, images, and pricing. Organize into categories.', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { num: '03', title: 'Start Selling', desc: 'Share your link, accept payments, fulfill orders, and scale your business.', icon: 'M13 7l5 5m0 0l-5 5m5-5H6' },
];

const testimonials = [
  { name: 'Amina Rahman', role: 'Founder, Dhaka Delights', text: 'Ecomai transformed my home bakery into a real online business. Setup took less than 10 minutes and I got my first order the same day. The storefront templates are gorgeous!', rating: 5, revenue: '৳3.2L/mo' },
  { name: 'Karim Ahmed', role: 'CEO, TechGadgets BD', text: 'The multi-tenant architecture is brilliant. I manage 3 different stores from one dashboard. Delivery tracking alone saved us 20+ hours every week.', rating: 5, revenue: '৳12L/mo' },
  { name: 'Sarah Chen', role: 'Owner, Artisan Coffee Co', text: 'Best e-commerce platform for Bangladesh. SSLCommerz integration works flawlessly, the analytics dashboard is amazing, and customer support is world-class.', rating: 5, revenue: '৳5.8L/mo' },
];

const logos = ['Grameenphone', 'Robi', 'Daraz', 'Pathao', 'Sheba.xyz', 'Chaldal', 'Pickaboo', 'AjkerDeal'];

const integrations = [
  { name: 'SSLCommerz', desc: 'Payment gateway', color: '#1a73e8' },
  { name: 'bKash', desc: 'Mobile banking', color: '#e2136e' },
  { name: 'Nagad', desc: 'Digital wallet', color: '#f6921e' },
  { name: 'Pathao', desc: 'Delivery partner', color: '#21bf73' },
  { name: 'Steadfast', desc: 'Courier service', color: '#ff6b35' },
  { name: 'Google', desc: 'Analytics & Ads', color: '#4285f4' },
  { name: 'Facebook', desc: 'Pixel & Shop', color: '#1877f2' },
  { name: 'WhatsApp', desc: 'Customer chat', color: '#25d366' },
];

/* ════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ════════════════════════════════════════════════════════════════ */

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function CountUp({ target, suffix = '', prefix = '' }) {
  const [ref, count] = useCounter(target);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [wordAnimating, setWordAnimating] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const dashRef = useRef(null);

  /* reveal refs */
  const [heroRef, heroVis] = useReveal(0.1);
  const [logoRef, logoVis] = useReveal();
  const [statsRef, statsVis] = useReveal();
  const [featRef, featVis] = useReveal(0.05);
  const [stepsRef, stepsVis] = useReveal();
  const [intRef, intVis] = useReveal();
  const [testRef, testVis] = useReveal();
  const [ctaRef, ctaVis] = useReveal();

  /* scroll listener */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* morphing hero word */
  useEffect(() => {
    const id = setInterval(() => {
      setWordAnimating(true);
      setTimeout(() => {
        setCurrentWord(i => (i + 1) % heroWords.length);
        setWordAnimating(false);
      }, 400);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* 3-D tilt on dashboard */
  const handleMouseMove = useCallback((e) => {
    if (!dashRef.current) return;
    const r = dashRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / r.width;
    const y = (e.clientY - r.top - r.height / 2) / r.height;
    setTilt({ x: y * -4, y: x * 6 });
  }, []);
  const resetTilt = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  const reveal = (vis, delay = 0) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(36px)',
    transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
  });

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-2xl shadow-lg shadow-gray-200/40 border-b border-gray-200/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-lg shadow-primary-200/50 group-hover:shadow-primary-300/60 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary-600 to-teal-500 bg-clip-text text-transparent">Ecomai</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Integrations', '#integrations']].map(([l, h]) => (
              <a key={l} href={h} className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition group">
                {l}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-teal-500 rounded-full group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <Link to="/pricing" className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-teal-500 rounded-full group-hover:w-full transition-all duration-300" />
            </Link>
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Sign In</Link>
            <Link to="/signup" className="relative bg-gradient-to-r from-primary-600 to-teal-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-primary-200/50 hover:shadow-xl hover:shadow-primary-300/50 transition-all hover:-translate-y-0.5 active:translate-y-0 overflow-hidden group">
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition" aria-label="Menu">
            <div className="w-5 h-5 relative">
              <span className={`absolute left-0 w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileOpen ? 'top-2 rotate-45' : 'top-0.5'}`} />
              <span className={`absolute left-0 top-2 w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileOpen ? 'top-2 -rotate-45' : 'top-3.5'}`} />
            </div>
          </button>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-400 bg-white/95 backdrop-blur-2xl ${mobileOpen ? 'max-h-96 border-b border-gray-100 shadow-xl' : 'max-h-0'}`}>
          <div className="px-4 py-5 space-y-1">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Integrations', '#integrations'], ['Pricing', '/pricing'], ['Sign In', '/login']].map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition">{l}</a>
            ))}
            <Link to="/signup" className="block text-center bg-gradient-to-r from-primary-600 to-teal-500 text-white px-5 py-3 rounded-xl text-sm font-semibold mt-2">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section ref={heroRef} className="relative pt-24 pb-8 sm:pt-32 sm:pb-12 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-primary-200/25 rounded-full blur-[100px] animate-[morph-blob_20s_ease-in-out_infinite]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[100px] animate-[morph-blob_25s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-[10%] right-[15%] w-[350px] h-[350px] bg-emerald-200/15 rounded-full blur-[80px] animate-[morph-blob_22s_ease-in-out_infinite_3s]" />
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #1a73e8 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div style={reveal(heroVis, 0)} className="inline-flex items-center gap-2.5 bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-100 rounded-full px-5 py-2 mb-8 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-primary-700 tracking-wide">Trusted by 10,000+ businesses in Bangladesh</span>
            </div>

            {/* Headline */}
            <h1 style={reveal(heroVis, 0.1)} className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.08]">
              Build Your Online Store
              <br />
              <span className="relative inline-block mt-2">
                <span className="bg-gradient-to-r from-primary-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-x_4s_ease_infinite]">
                  <span className={`inline-block transition-all duration-400 ${wordAnimating ? 'opacity-0 translate-y-3 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
                    {heroWords[currentWord]}
                  </span>
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p style={reveal(heroVis, 0.2)} className="mt-7 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Everything you need to launch, manage, and scale your e-commerce business.
              Beautiful storefronts, secure payments, delivery tracking, and marketing tools — all in one platform.
            </p>

            {/* CTAs */}
            <div style={reveal(heroVis, 0.3)} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="group w-full sm:w-auto bg-gradient-to-r from-primary-600 to-teal-500 text-white px-8 py-4 rounded-2xl text-base font-semibold shadow-xl shadow-primary-200/50 hover:shadow-2xl hover:shadow-primary-300/50 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 relative overflow-hidden">
                <span className="relative z-10">Start Free Trial</span>
                <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <a href="#features" className="group w-full sm:w-auto bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl text-base font-semibold hover:border-primary-200 hover:shadow-lg transition-all flex items-center justify-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition">
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                Watch Demo
              </a>
            </div>

            <p style={reveal(heroVis, 0.35)} className="mt-5 text-sm text-gray-400 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>No credit card required</span>
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Setup in 2 minutes</span>
            </p>
          </div>

          {/* Dashboard Preview with 3D tilt */}
          <div style={reveal(heroVis, 0.45)} className="mt-16 mx-auto max-w-5xl relative" onMouseMove={handleMouseMove} onMouseLeave={resetTilt}>
            <div ref={dashRef} className="relative rounded-2xl border border-gray-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden transition-transform duration-200 ease-out" style={{ transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50/50">
                <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
                <div className="flex-1 flex justify-center"><div className="bg-gray-200/70 rounded-lg px-6 py-1.5 text-xs text-gray-500 font-mono">ecomai.dev/admin/dashboard</div></div>
              </div>
              <div className="p-6 sm:p-8">
                {/* KPI cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { l: 'Revenue', v: '৳87,450', d: '+12.5%', c: 'text-emerald-600', bg: 'bg-emerald-50', dc: 'text-emerald-500' },
                    { l: 'Orders', v: '142', d: '+8.2%', c: 'text-primary-600', bg: 'bg-primary-50', dc: 'text-primary-500' },
                    { l: 'Customers', v: '89', d: '+23.1%', c: 'text-violet-600', bg: 'bg-violet-50', dc: 'text-violet-500' },
                    { l: 'Products', v: '18', d: 'Active', c: 'text-amber-600', bg: 'bg-amber-50', dc: 'text-amber-500' },
                  ].map((s, i) => (
                    <div key={i} className={`${s.bg} rounded-xl p-4 text-left transition-all duration-500`} style={{ opacity: heroVis ? 1 : 0, transitionDelay: `${1 + i * 0.1}s` }}>
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{s.l}</p>
                      <p className={`text-xl sm:text-2xl font-bold ${s.c} mt-1`}>{s.v}</p>
                      <p className={`text-xs font-semibold ${s.dc} mt-0.5`}>{s.d}</p>
                    </div>
                  ))}
                </div>
                {/* Animated chart */}
                <div className="flex items-end gap-1.5 sm:gap-2 h-32 px-2 mb-2">
                  {[40, 55, 35, 65, 80, 60, 90, 75, 95, 70, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-primary-500 to-teal-300 transition-all duration-[1200ms] ease-out hover:from-primary-600 hover:to-teal-400" style={{ height: heroVis ? `${h}%` : '0%', transitionDelay: `${1.2 + i * 0.06}s` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 px-2 font-medium">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>

            {/* Floating stat badges */}
            <div className="hidden lg:block absolute -left-10 top-1/3 animate-[float-slow_6s_ease-in-out_infinite] z-10" style={{ opacity: heroVis ? 1 : 0, transition: 'opacity 0.5s ease 1.5s' }}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
                <div><div className="text-xs text-gray-500">Revenue</div><div className="text-sm font-bold text-gray-900">+23.5%</div></div>
              </div>
            </div>
            <div className="hidden lg:block absolute -right-8 top-1/2 animate-[float-reverse_7s_ease-in-out_infinite] z-10" style={{ opacity: heroVis ? 1 : 0, transition: 'opacity 0.5s ease 1.7s' }}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center"><svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <div><div className="text-xs text-gray-500">New Order</div><div className="text-sm font-bold text-gray-900">৳4,250</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ LOGO TICKER ═══════════════════ */}
      <section ref={logoRef} className="py-12 border-y border-gray-100 bg-gray-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={reveal(logoVis)} className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">Trusted by leading businesses across Bangladesh</p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10" />
            <div className="flex animate-[ticker_25s_linear_infinite]" style={{ width: 'max-content' }}>
              {[...logos, ...logos].map((name, i) => (
                <div key={i} className="mx-10 flex items-center gap-2 text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-200/60 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400">{name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-semibold tracking-wide whitespace-nowrap">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section ref={statsRef} className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center group" style={reveal(statsVis, i * 0.1)}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-teal-50 border border-primary-100/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-100 transition-all duration-300">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} /></svg>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  <CountUp target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-gray-500 mt-1.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="features" ref={featRef} className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto" style={reveal(featVis)}>
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-5">
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-xs font-semibold text-primary-700">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">Everything You Need to<br /><span className="bg-gradient-to-r from-primary-600 to-teal-500 bg-clip-text text-transparent">Sell Online</span></h2>
            <p className="mt-5 text-lg text-gray-500">Powerful tools designed for growing businesses in Bangladesh and beyond.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className="group relative rounded-2xl border border-gray-200/80 bg-white p-6 hover:border-transparent hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-500 hover:-translate-y-1" style={reveal(featVis, 0.05 + i * 0.05)}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <svg className={`w-6 h-6 bg-gradient-to-r ${f.color} bg-clip-text`} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: f.color.includes('amber') ? '#f59e0b' : f.color.includes('primary') ? '#1a73e8' : f.color.includes('emerald') ? '#10b981' : f.color.includes('violet') ? '#8b5cf6' : f.color.includes('cyan') ? '#06b6d4' : f.color.includes('pink') ? '#ec4899' : f.color.includes('teal') ? '#14b8a6' : '#4b5563' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center text-xs font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  Learn more
                  <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" ref={stepsRef} className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" style={reveal(stepsVis)}>
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-5">
              <span className="text-xs font-semibold text-teal-700">Simple Setup</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900">Up and Running in <span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">3 Steps</span></h2>
            <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto">No technical skills needed. Go from zero to selling in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5">
              <div className="w-full h-full bg-gradient-to-r from-primary-200 via-teal-200 to-emerald-200 rounded-full" style={{ opacity: stepsVis ? 1 : 0, transition: 'opacity 1s ease 0.5s' }} />
            </div>

            {steps.map((s, i) => (
              <div key={i} className="relative text-center group" style={reveal(stepsVis, 0.2 + i * 0.15)}>
                <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 to-teal-500 text-white text-2xl font-bold mb-6 shadow-xl shadow-primary-200/50 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary-300/50 transition-all duration-500">
                  <span>{s.num}</span>
                  <div className="absolute inset-0 rounded-3xl animate-[pulse-glow_3s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.5}s` }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ INTEGRATIONS ═══════════════════ */}
      <section id="integrations" ref={intRef} className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" style={reveal(intVis)}>
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 mb-5">
              <span className="text-xs font-semibold text-violet-700">Integrations</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900">Connects With Your<br /><span className="bg-gradient-to-r from-violet-500 to-primary-500 bg-clip-text text-transparent">Favorite Tools</span></h2>
            <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto">Pre-built integrations with the most popular payment, delivery, and marketing platforms.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {integrations.map((item, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-gray-200/80 p-6 text-center hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-transparent transition-all duration-500" style={reveal(intVis, 0.05 + i * 0.05)}>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 8px 30px ${item.color}33` }}>
                  {item.name.charAt(0)}
                </div>
                <div className="text-sm font-bold text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section ref={testRef} className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" style={reveal(testVis)}>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5 mb-5">
              <span className="text-xs font-semibold text-amber-700">Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900">Loved by <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">Business Owners</span></h2>
            <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto">Join thousands of entrepreneurs who trust Ecomai to power their stores.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-gray-200/80 p-8 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden" style={reveal(testVis, 0.1 + i * 0.12)}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-50 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Stars count={t.rating} />
                <p className="mt-5 text-gray-600 leading-relaxed text-[15px] relative">"{t.text}"</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-200/50">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Revenue</div>
                    <div className="text-sm font-bold text-emerald-600">{t.revenue}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section ref={ctaRef} className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2rem] overflow-hidden p-12 sm:p-20 text-center" style={reveal(ctaVis)}>
            {/* Animated gradient BG */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-teal-500 to-emerald-500 bg-[length:200%_200%] animate-[gradient-x_6s_ease_infinite]" />
            {/* Glow orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl bg-white" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-15 blur-3xl bg-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl bg-white animate-[morph-blob_15s_ease-in-out_infinite]" />

            {/* Dot grid overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Ready to Grow Your<br />Business Online?
            </h2>
            <p className="relative text-lg text-white/80 max-w-xl mx-auto mb-10">
              Join 10,000+ store owners who trust Ecomai. Start your free trial today — no credit card required.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="group w-full sm:w-auto bg-white text-primary-700 px-8 py-4 rounded-2xl text-base font-semibold hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2.5">
                Create Your Store Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto border-2 border-white/30 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-white/10 hover:border-white/50 transition-all flex items-center justify-center">
                See Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-gray-950 text-gray-400 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-14 border-b border-gray-800/80">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-lg shadow-primary-900/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-xl font-extrabold text-white">Ecomai</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-xs">The all-in-one e-commerce platform built for Bangladesh and beyond. Launch, manage, and scale your online business.</p>
              <div className="flex gap-3">
                {[
                  { label: 'Twitter', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                  { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                ].map((s, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-gray-800/80 hover:bg-primary-600 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary-900/30" aria-label={s.label}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.path} /></svg>
                  </a>
                ))}
              </div>
            </div>
            {/* Link cols */}
            {[
              { title: 'Product', links: [['Features', '#features'], ['Pricing', '/pricing'], ['Templates', '#'], ['Integrations', '#integrations']] },
              { title: 'Company', links: [['About', '#'], ['Blog', '#'], ['Careers', '#'], ['Contact', '#']] },
              { title: 'Resources', links: [['Documentation', '#'], ['Help Center', '#'], ['API Reference', '#'], ['Status', '#']] },
              { title: 'Legal', links: [['Privacy Policy', '#'], ['Terms of Service', '#'], ['Cookie Policy', '#'], ['GDPR', '#']] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(([label, href], j) => (
                    <li key={j}>
                      {href.startsWith('/') ? (
                        <Link to={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                      ) : (
                        <a href={href} className="text-sm hover:text-white transition-colors">{label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
            <p className="text-sm">&copy; {new Date().getFullYear()} Ecomai. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <span>Built with ❤️ in Bangladesh</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
