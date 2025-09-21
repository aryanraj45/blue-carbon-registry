import React, { Suspense, lazy, memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from './Navbar';
import Footer from './Footer';
import { ArrowRight, CheckCircle, Waves, Database, Satellite, Users } from 'lucide-react';
import { ColourfulText } from './ui/colorfultext';
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

// Use React.lazy for dynamic import
const World = lazy(() => import('@/components/ui/globe').then((m) => ({ default: m.World })));

// --- STATIC CONFIGURATIONS ---
const globeConfig = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: true,
  atmosphereColor: "#FFFFFF",
  atmosphereAltitude: 0.1,
  emissive: "#062056",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#38bdf8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 20.5937, lng: 78.9629 },
  autoRotate: true,
  autoRotateSpeed: 0.8,
};
const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
const sampleArcs = [
  { order: 1, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2, color: colors[Math.floor(Math.random() * colors.length)] },
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -1.303396, endLng: 36.852443, arcAlt: 0.5, color: colors[Math.floor(Math.random() * colors.length)] },
  { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2, color: colors[Math.floor(Math.random() * colors.length)] },
  { order: 2, startLat: 51.5072, startLng: -0.1276, endLat: 3.139, endLng: 101.6869, arcAlt: 0.3, color: colors[Math.floor(Math.random() * colors.length)] },
  { order: 3, startLat: -33.8688, startLng: 151.2093, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3, color: colors[Math.floor(Math.random() * colors.length)] },
  { order: 3, startLat: 21.3099, startLng: -157.8581, endLat: 40.7128, endLng: -74.006, arcAlt: 0.3, color: colors[Math.floor(Math.random() * colors.length)] },
];

const benefitItems = [
  'Automated verification reduces costs and complexity.',
  'Blockchain ensures full data integrity and transparency.',
  'AI-powered monitoring provides real-time project insights.',
  'Directly connects funders with high-impact local projects.',
];

// --- MEMOIZED COMPONENTS ---
const HeroSection = memo(() => (
  <section className="pt-24 pb-28 bg-black">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-cyan-400">
            <Waves className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-widest uppercase">Blue Carbon Ecosystems</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter leading-tight  text-fuchsia-500">
            The Trust Layer for BLUE CARBON <br />
          </h1>
          <p className="text-lg text-slate-300 max-w-lg">
            Our platform uses blockchain and satellite-based AI to provide transparent, verifiable, and community-focused monitoring for blue carbon ecosystem restoration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-all duration-300 hover:scale-105 group shadow-lg shadow-cyan-500/20">
                Access the Portal
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-slate-800/50">
              Learn More
            </Button>
          </div>
        </div>
        <div className="relative h-[500px] w-full max-w-lg mx-auto">
          <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400">Loading Globe...</div>}>
            <World data={sampleArcs} globeConfig={globeConfig} />
          </Suspense>
        </div>
      </div>
    </div>
  </section>
));

const FeaturesSection = memo(() => (
  <section id="features" className="relative py-24 bg-black backdrop-blur-md overflow-hidden">
    <BackgroundBeamsWithCollision>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tighter text-white mb-4">A New Standard for Environmental Verification</h2>
          <p className="text-lg text-slate-300">We integrate advanced technology to bring unparalleled trust and efficiency to the blue carbon marketplace.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all duration-300">
            <CardContent className="p-8 space-y-4 text-left">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 group-hover:border-cyan-500 transition-colors">
                <Satellite className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Smart MRV</h3>
              <p className="text-slate-400">Leverage satellite imagery and AI to automatically verify project data, ensuring accuracy and reducing manual overhead.</p>
            </CardContent>
          </Card>
          <Card className="group border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all duration-300">
            <CardContent className="p-8 space-y-4 text-left">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 group-hover:border-emerald-500 transition-colors">
                <Database className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Immutable Ledger</h3>
              <p className="text-slate-400">Every transaction and verified credit is recorded on a blockchain, creating a tamper-proof audit trail for all stakeholders.</p>
            </CardContent>
          </Card>
          <Card className="group border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all duration-300">
            <CardContent className="p-8 space-y-4 text-left">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 group-hover:border-cyan-500 transition-colors">
                <Users className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Community Empowerment</h3>
              <p className="text-slate-400">Onboard local communities, NGOs, and panchayats to drive restoration efforts and ensure equitable benefit sharing.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  </section>
));

const BenefitsSection = memo(() => (
  <section className="py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl">
          <div className="shadow-lg shadow-slate-950/50">
            <div className="p-3 bg-slate-800/70 rounded-t-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="p-6 bg-slate-900 rounded-b-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-white">Pichavaram Mangrove Forest</h4>
                <span className="text-xs font-mono px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">VERIFIED</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2.5 rounded-full" style={{width: '75%'}}></div>
              </div>
              <div className="text-sm text-slate-400 grid grid-cols-3 gap-4">
                <div><span className="font-bold text-white">1,250</span> ha Planted</div>
                <div><span className="font-bold text-white">8,200</span> tCO₂e Sequestered</div>
                <div><span className="font-bold text-white">98%</span> Health</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold tracking-tighter text-lime-500">
            Designed for <span className="bg-gradient-to-r text-lime-500 bg-clip-text text-transparent">Impact and Scale</span>
          </h2>
          <p className="text-lg text-slate-300">Our unified platform streamlines the entire lifecycle of a blue carbon project, from planting to credit issuance.</p>
          <div className="space-y-3 pt-2">
            {benefitItems.map((benefit) => (
              <div key={benefit} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 mt-1 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
));

const CtaSection = memo(() => (
  <section className="py-28">
    <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-6">Join the Movement</h2>
      <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
        Whether you're a project developer, corporate partner, or community leader, our platform provides the tools to drive meaningful climate action.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/login">
          <Button size="lg" className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-all duration-300 hover:scale-105 group shadow-lg shadow-cyan-500/20">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
));

// --- HOMEPAGE MAIN ---
const Homepage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar />
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="blurry-dot one"></div>
        <div className="blurry-dot two"></div>
        <div className="blurry-dot three"></div>
      </div>
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <section id="about" className="py-24 bg-black backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold tracking-tighter text-white mb-4">The Power of Coastal Ecosystems</h2>
              <p className="text-lg text-slate-300">Our mission is to protect and restore them.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 text-center border border-slate-800 bg-slate-900/50 rounded-lg">
                <div className="text-4xl font-bold text-lime-500 tracking-tighter">10x</div>
                <div className="text-sm text-slate-400 mt-1">More Carbon Storage</div>
              </div>
              <div className="p-6 text-center border border-slate-800 bg-slate-900/50 rounded-lg">
                <div className="text-4xl font-bold text-lime-500 tracking-tighter">100%</div>
                <div className="text-sm text-slate-400 mt-1">On-Chain Verification</div>
              </div>
              <div className="p-6 text-center border border-slate-800 bg-slate-900/50 rounded-lg">
                <div className="text-4xl font-bold text-lime-500 tracking-tighter">70%</div>
                <div className="text-sm text-slate-400 mt-1">Reduced MRV Costs</div>
              </div>
              <div className="p-6 text-center border border-slate-800 bg-slate-900/50 rounded-lg">
                <div className="text-4xl font-bold text-lime-500 tracking-tighter">24/7</div>
                <div className="text-sm text-slate-400 mt-1">AI-Powered Monitoring</div>
              </div>
            </div>
          </div>
        </section>
        <CtaSection />
      </main>
      <Footer />
      <style>{`
        .blurry-dot {
          position: absolute;
          border-radius: 9999px;
          filter: blur(128px);
          will-change: transform, opacity;
        }
        .blurry-dot.one {
          top: 25%; left: 25%; width: 18rem; height: 18rem;
          background-color: rgba(6, 182, 212, 0.05);
          animation: pulse-slow 7s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .blurry-dot.two {
          top: 50%; right: 33.33%; width: 24rem; height: 24rem;
          background-color: rgba(16, 185, 129, 0.05);
          animation: pulse-slower 9s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .blurry-dot.three {
          bottom: 25%; left: 33.33%; width: 20rem; height: 20rem;
          background-color: rgba(96, 165, 250, 0.05);
          animation: ping-slow 5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes pulse-slow { 50% { opacity: 0.8; } }
        @keyframes pulse-slower { 50% { opacity: 0.6; } }
        @keyframes ping-slow { 75%, 100% { transform: scale(1.8); opacity: 0; } }
      `}</style>
    </div>
  );
};

export default memo(Homepage);
