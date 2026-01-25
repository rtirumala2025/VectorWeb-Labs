'use client';

import { Project } from '@/lib/api';

interface ContractViewProps {
    project: Project;
}

export function ContractView({ project }: ContractViewProps) {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Extract data from project
    const businessName = project.business_name || 'Client';
    const email = project.user_id || 'email@example.com'; // Using user_id as placeholder
    const phone = project.client_phone || 'Not provided';
    const totalPrice = project.ai_price_quote?.price || 1200;
    const deposit = Math.round(totalPrice / 2);
    const features = project.ai_price_quote?.features || ['Responsive Design', 'SEO Optimization', 'Contact Form'];
    const suggestedStack = project.ai_price_quote?.suggested_stack || 'Next.js + Tailwind CSS + Supabase';

    return (
        <div className="bg-white text-void p-8 md:p-12 font-serif">
            {/* Header */}
            <div className="border-b-2 border-void pb-6 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-void mb-4">
                    VectorWeb Labs – Web Design Agreement
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-bold">Date:</span> {today}
                    </div>
                    <div>
                        <span className="font-bold">Client Name / Business:</span> {businessName}
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-bold">Client Contact Info:</span> {email} / {phone}
                    </div>
                </div>
            </div>

            {/* Intro */}
            <p className="mb-8 leading-relaxed">
                This agreement is between <strong>VectorWeb Labs</strong> (we) and <strong>{businessName}</strong> (you).
                It covers the work we will do together to build your website.
            </p>

            {/* Section 1: Scope of Work */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">1. Scope of Work</h2>
                <p className="mb-4">We will build a website for you including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Pages:</strong> Home, About, Services, Contact.</li>
                    <li><strong>Features:</strong> {features.join(', ')}</li>
                    <li><strong>Tech Stack:</strong> {suggestedStack}</li>
                    <li><strong>Deliverables:</strong> Fully working website, mobile-friendly layout, basic SEO, and basic security setup.</li>
                </ul>
            </section>

            {/* Section 2: Your Responsibilities */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">2. Your Responsibilities</h2>
                <p className="mb-4">You need to provide:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All text, images, logos, and branding.</li>
                    <li>Timely approvals and feedback.</li>
                    <li>Access to hosting/domain accounts.</li>
                </ul>
                <p className="mt-4 italic text-sm text-gray-600">
                    Note: Delays in materials may push back the timeline.
                </p>
            </section>

            {/* Section 3: Timeline */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">3. Timeline</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Start:</strong> We begin work within 24 hours after getting your deposit.</li>
                    <li><strong>Estimated Completion:</strong> 14 days from deposit.</li>
                </ul>
            </section>

            {/* Section 4: Payment Terms */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">4. Payment Terms</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Total Fee:</strong> ${totalPrice}</li>
                    <li><strong>Deposit:</strong> ${deposit} (50% upfront, non-refundable)</li>
                    <li><strong>Final Payment:</strong> Remaining balance before handover.</li>
                    <li><strong>Methods:</strong> PayPal, Venmo, Cash App, or Zelle.</li>
                </ul>
            </section>

            {/* Section 5: Revisions */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">5. Revisions</h2>
                <p>Up to 2–3 rounds of revisions included during the design phase.</p>
            </section>

            {/* Section 6: Post-Launch Support */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">6. Post-Launch Support</h2>
                <p>We offer a 7-day free period after launch to fix bugs. After that, updates require a support plan.</p>
            </section>

            {/* Section 7: Cancellation */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">7. Cancellation</h2>
                <p>You can cancel with written notice 1 week before delivery. Deposit is non-refundable.</p>
            </section>

            {/* Section 8: Agreement */}
            <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">8. Agreement</h2>
                <p className="mb-8">By signing below, you agree to everything in this document.</p>

                {/* Signature Lines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <div>
                        <div className="border-b border-gray-400 mb-2 h-12"></div>
                        <p className="text-sm"><strong>Client Signature</strong></p>
                        <p className="text-xs text-gray-500">Date: _______________</p>
                    </div>
                    <div>
                        <div className="border-b border-gray-400 mb-2 h-12"></div>
                        <p className="text-sm"><strong>VectorWeb Labs Representative</strong></p>
                        <p className="text-xs text-gray-500">Date: _______________</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ContractView;
