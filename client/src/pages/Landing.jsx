import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import GlassButton from '../components/GlassButton';

import {
  Car, Search, MapPin, Shield, Users, Star, ArrowRight,
  Zap, Globe, Clock, ChevronDown
} from 'lucide-react';
import { DateSelect } from '../components/DateSelect';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function HeroOrb({ className }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
  );
}

function FeatureCard({ icon: Icon, title, desc, color, index }) {
  const colors = {
    cyan: 'from-primary/20 to-blue-600/5 border-primary/20 text-primary',
    orange: 'from-blue-400/20 to-blue-400/5 border-blue-400/20 text-blue-400',
    teal: 'from-blue-600/30 to-blue-600/5 border-blue-600/20 text-blue-600',
  };
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className={`bg-gradient-to-br ${colors[color].split(' ').slice(0,2).join(' ')} border ${colors[color].split(' ')[2]} rounded-2xl p-6 backdrop-blur-sm group hover:scale-[1.02] transition-transform duration-200`}
    >
      <div className={`w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center mb-4 ${colors[color].split(' ')[3]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function StepBadge({ num, label, sub }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/10 border border-primary/20 flex items-center justify-center text-xl font-black text-primary mb-4">
        {num}
      </div>
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [stats, setStats] = useState({ rides: 0, users: 0, cities: 0 });

  useEffect(() => {
    // Animate counters
    const targets = { rides: 1240, users: 8400, cities: 34 };
    Object.entries(targets).forEach(([key, target]) => {
      let start = 0;
      const inc = target / 60;
      const timer = setInterval(() => {
        start += inc;
        if (start >= target) { start = target; clearInterval(timer); }
        setStats(prev => ({ ...prev, [key]: Math.floor(start) }));
      }, 30);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (date) params.set('date', date);
    navigate(`/find-ride?${params.toString()}`);
  };

  return (
    <div className="min-h-screen font-inter overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Orbs */}
        <HeroOrb className="w-96 h-96 bg-primary/20 -top-20 -left-20" />
        <HeroOrb className="w-80 h-80 bg-blue-600/30 top-1/2 -right-20" />
        <HeroOrb className="w-64 h-64 bg-blue-400/10 bottom-20 left-1/3" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300B4D8%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              Smart Carpooling for Modern Travelers
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground leading-tight mb-6">
              Share the Road,
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                Split the Cost
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Connect with trusted drivers and riders heading your way.
              Safe, affordable, and planet-friendly travel — one shared seat at a time.
            </motion.p>

            {/* Search Widget */}
            <motion.div variants={fadeUp} className="max-w-3xl mx-auto">
              <form onSubmit={handleSearch} className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-4 shadow-2xl shadow-black/30">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <input
                      value={from}
                      onChange={e => setFrom(e.target.value)}
                      placeholder="Leaving from..."
                      className="w-full pl-9 pr-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/60" />
                    <input
                      value={to}
                      onChange={e => setTo(e.target.value)}
                      placeholder="Going to..."
                      className="w-full pl-9 pr-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
                    />
                  </div>
                  <div className="relative">
                    <DateSelect
                      value={date}
                      onChange={setDate}
                      className="py-3 bg-background/60"
                    />
                  </div>
                </div>
                <GlassButton type="submit" size="lg" className="w-full">
                  <Search className="w-4 h-4" /> Search Rides
                </GlassButton>
              </form>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 sm:gap-16 mt-12">
              {[
                { val: stats.rides.toLocaleString(), label: 'Rides Shared' },
                { val: stats.users.toLocaleString(), label: 'Travelers' },
                { val: stats.cities, label: 'Cities' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-foreground">{val}+</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/40"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Why PaddleShare?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for real people. Designed for trust.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Shield} title="Verified Riders & Drivers" desc="Every user is verified with ID checks and community ratings so you always travel with trusted people." color="cyan" index={0} />
            <FeatureCard icon={Globe} title="Real-Time Ride Matching" desc="Our intelligent matching connects you with the best available rides in seconds." color="orange" index={1} />
            <FeatureCard icon={Star} title="Community Ratings" desc="Transparent reviews and star ratings keep everyone accountable and quality high." color="teal" index={2} />
            <FeatureCard icon={Zap} title="Instant Booking" desc="Reserve your seat with one tap. No back-and-forth — just confirm and go." color="orange" index={3} />
            <FeatureCard icon={Users} title="Group Travel" desc="Book multiple seats for your whole group, or meet new travel companions along the way." color="teal" index={4} />
            <FeatureCard icon={Car} title="Carbon Footprint Reduced" desc="Every shared ride means fewer cars on the road. Small step, big impact for our planet." color="cyan" index={5} />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">How It Works</h2>
              <p className="text-muted-foreground">Three simple steps to your next shared journey</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
              <div className="hidden sm:block absolute top-7 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <StepBadge num="1" label="Post or Search" sub="Offer your route or search for rides near you" />
              <StepBadge num="2" label="Match & Chat" sub="Connect with your co-traveler before the ride" />
              <StepBadge num="3" label="Ride & Review" sub="Travel together and leave honest feedback" />
            </div>


          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Loved by Travelers</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Priya M.', role: 'Regular Rider', stars: 5, text: 'PaddleShare has completely changed how I commute. I\'ve saved over $200 last month alone!' },
              { name: 'Carlos D.', role: 'Weekend Driver', stars: 5, text: 'I love covering fuel costs on my road trips. Met amazing people along the way too.' },
              { name: 'Sophie L.', role: 'Student', stars: 5, text: 'Super easy to find rides from campus. Always felt safe — all drivers are rated and verified.' },
            ].map(({ name, role, stars, text }, i) => (
              <motion.div
                key={name}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-6"
              >
                <div className="flex mb-3">
                  {[...Array(stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-blue-400 fill-blue-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-primary/10 to-blue-600/20 rounded-3xl blur-3xl" />
          <div className="relative bg-card/60 backdrop-blur-xl border border-primary/20 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Ready to share your next ride?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of travelers already using PaddleShare.</p>
            <GlassButton size="xl" onClick={() => window.location.href = '/login'}>
              Start for Free <ArrowRight className="w-5 h-5" />
            </GlassButton>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Paddle<span className="text-primary">Share</span></span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 PaddleShare. Built for conscious travelers.</p>
        </div>
      </footer>
    </div>
  );
}