'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock, DollarSign, Users, Code2, Rocket } from 'lucide-react';
import { GridBackground } from '@/components/backgrounds/GridBackground';
import { NodesAnimation } from '@/components/backgrounds/NodesAnimation';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Layers */}
        <GridBackground className="opacity-50" />
        <NodesAnimation className="opacity-60" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 border border-steel bg-carbon/50 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-xs text-ash tracking-widest uppercase">
                Now Accepting Projects
              </span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="headline-hero mb-6"
          >
            <span className="block text-bone">WE BUILD</span>
            <span className="block text-cobalt text-glow-cobalt">FAST.</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="headline-lg mb-12 text-chalk"
          >
            YOU GROW FASTER.
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-technical text-ash max-w-xl mx-auto mb-12"
          >
            Student-led web agency powered by AI. Premium websites at a fraction
            of the cost. Ship in days, not months.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <MagneticButton href="/signup">
              START YOUR PROJECT
            </MagneticButton>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="font-mono text-[10px] text-ash tracking-widest">SCROLL</span>
              <div className="w-[1px] h-8 bg-gradient-to-b from-cobalt to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          VALUE PROPOSITION - BENTO GRID
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-label text-cobalt block mb-4">WHY VECTORWEB</span>
            <h2 className="headline-lg">THE AGENCY<br />REIMAGINED</h2>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Old Agencies - Large Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:row-span-2"
            >
              <Card className="h-full bg-void border-red-900/30" crosshairs={false}>
                <span className="text-label text-red-400 block mb-6">OLD AGENCIES</span>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-mono text-sm font-bold text-bone mb-2">MONTHS TO LAUNCH</h4>
                      <p className="text-technical text-ash">
                        Endless meetings, revisions, and delays. Your site launches after the trend dies.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <DollarSign className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-mono text-sm font-bold text-bone mb-2">$15K+ BUDGETS</h4>
                      <p className="text-technical text-ash">
                        Premium prices for templates. Half goes to overhead and account managers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Users className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-mono text-sm font-bold text-bone mb-2">BLOATED TEAMS</h4>
                      <p className="text-technical text-ash">
                        10 people CC&apos;d on every email. Nobody knows what&apos;s happening.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* VectorWeb Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="interactive" className="h-full border-cobalt/30">
                <Zap className="w-8 h-8 text-cobalt mb-4" />
                <h4 className="font-mono text-sm font-bold text-bone mb-2">AI-SPEED</h4>
                <p className="text-technical text-ash">
                  Ship in 2 weeks, not 2 months. AI handles the boilerplate, humans perfect the details.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="interactive" className="h-full border-cobalt/30">
                <DollarSign className="w-8 h-8 text-cobalt mb-4" />
                <h4 className="font-mono text-sm font-bold text-bone mb-2">LEAN PRICING</h4>
                <p className="text-technical text-ash">
                  $1,500-5,000 for premium work. No office rent. No bloat. Pure value.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="interactive" className="h-full border-cobalt/30">
                <Code2 className="w-8 h-8 text-cobalt mb-4" />
                <h4 className="font-mono text-sm font-bold text-bone mb-2">STUDENT-LED</h4>
                <p className="text-technical text-ash">
                  Top engineering students who live and breathe modern tech. No legacy mindsets.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Card variant="interactive" className="h-full border-cobalt/30">
                <Rocket className="w-8 h-8 text-cobalt mb-4" />
                <h4 className="font-mono text-sm font-bold text-bone mb-2">FUTURE-PROOF</h4>
                <p className="text-technical text-ash">
                  Built with Next.js, Tailwind, and modern infra. Your site scales with you.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6 border-t border-steel">
        <GridBackground className="opacity-30" interactive={false} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="headline-lg mb-8">
              READY TO<br />
              <span className="text-cobalt">SHIP FAST?</span>
            </h2>
            <p className="text-technical text-ash max-w-lg mx-auto mb-12">
              Start with our creation wizard. Tell us about your business,
              pick your vibe, and get a proposal in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton href="/signup">
                GET STARTED
              </MagneticButton>

              <Link
                href="/login"
                className="font-mono text-sm text-ash hover:text-bone transition-colors flex items-center gap-2"
              >
                Already have an account?
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
