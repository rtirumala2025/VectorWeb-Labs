'use client';

import { Project } from '@/lib/api';
import { CreditCard, Scan, ArrowRight } from 'lucide-react';

interface InvoiceViewProps {
    project: Project;
}

export function InvoiceView({ project }: InvoiceViewProps) {
    const today = new Date();
    const issueDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });

    // Due date is 14 days from today
    const dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });

    // Extract data from project
    const invoiceNumber = project.id.slice(0, 8).toUpperCase();
    const totalPrice = project.ai_price_quote?.price || 1200;
    const basePrice = 500;
    const customFeaturesPrice = totalPrice - basePrice;

    // Services table data
    const services = [
        {
            id: 'SVC-001',
            description: 'Core_Architecture_Setup',
            detail: 'Next.js + Tailwind + DB Init',
            quantity: 1,
            rate: basePrice,
            total: basePrice
        },
        {
            id: 'SVC-002',
            description: 'AI_Logic_Integration',
            detail: 'Custom features & API connections',
            quantity: 1,
            rate: customFeaturesPrice,
            total: customFeaturesPrice
        },
        {
            id: 'SVC-003',
            description: 'Security_Layer_V1',
            detail: 'Basic auth & safe headers',
            quantity: 1,
            rate: 0,
            total: 0,
            note: 'INCLUDED'
        }
    ];

    return (
        <div className="bg-void text-bone font-mono text-sm border border-steel relative">
            {/* Invoice Header */}
            <div className="p-8 border-b border-steel flex flex-col md:flex-row justify-between md:items-start gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Scan size={24} className="text-cobalt" />
                        <h1 className="text-2xl font-bold tracking-tight">INVOICE_{invoiceNumber}</h1>
                    </div>
                    <p className="text-ash text-xs uppercase tracking-wider">VECTORWEB_LABS FINANCIAL DEPT.</p>
                </div>
                <div className="text-right">
                    <div className="inline-block border border-red-500/50 text-red-400 px-3 py-1 text-xs mb-2">
                        PAYMENT_STATUS: PENDING
                    </div>
                    <p className="text-xs text-ash">DUE_DATE: <span className="text-bone">{dueDate}</span></p>
                </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-steel">
                <div className="p-6 border-r border-steel md:border-r-0 lg:border-r">
                    <span className="text-xs text-ash uppercase tracking-wider block mb-2">BILL_TO</span>
                    <strong className="block text-lg mb-1">{project.business_name}</strong>
                    <span className="block text-ash">{project.domain_choice}</span>
                </div>
                <div className="p-6 bg-carbon/20 flex flex-col justify-center">
                    <div className="flex justify-between mb-2">
                        <span className="text-ash">ISSUE_DATE</span>
                        <span>{issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-ash">REF_ID</span>
                        <span>{project.id.slice(0, 12)}...</span>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-carbon border-b border-steel text-xs uppercase text-ash">
                            <th className="p-4 font-normal w-24">ID</th>
                            <th className="p-4 font-normal">DESCRIPTION</th>
                            <th className="p-4 font-normal text-right">QTY</th>
                            <th className="p-4 font-normal text-right">RATE</th>
                            <th className="p-4 font-normal text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-steel/30">
                        {services.map((service) => (
                            <tr key={service.id} className="group hover:bg-carbon/10 transition-colors">
                                <td className="p-4 text-ash group-hover:text-cobalt transition-colors">{service.id}</td>
                                <td className="p-4">
                                    <div className="font-bold">{service.description}</div>
                                    <div className="text-xs text-ash mt-0.5">{service.detail}</div>
                                </td>
                                <td className="p-4 text-right">{service.quantity}</td>
                                <td className="p-4 text-right text-ash">
                                    {service.note ? (
                                        <span className="text-green-400">{service.note}</span>
                                    ) : (
                                        `$${service.rate}`
                                    )}
                                </td>
                                <td className="p-4 text-right font-bold">${service.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total Section */}
            <div className="border-t border-steel bg-carbon/10 p-6 flex justify-end">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-ash text-xs">
                        <span>SUBTOTAL</span>
                        <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-ash text-xs">
                        <span>TAX (0%)</span>
                        <span>$0.00</span>
                    </div>
                    <div className="border-t border-steel pt-3 flex justify-between items-baseline">
                        <span className="font-bold text-lg">TOTAL_DUE</span>
                        <span className="font-bold text-2xl text-cobalt">${totalPrice}</span>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-steel">
                <div>
                    <h3 className="text-xs uppercase text-ash tracking-widest mb-4">PAYMENT_CHANNELS</h3>
                    <div className="space-y-3 text-xs">
                        <div className="flex items-center gap-3 p-3 border border-steel bg-carbon/30 hover:border-cobalt transition-colors cursor-pointer group">
                            <CreditCard size={16} className="text-ash group-hover:text-cobalt" />
                            <div className="flex-1">
                                <strong className="block text-bone">STRIPE / CARD</strong>
                                <span className="text-ash">Secure instant transfer</span>
                            </div>
                            <ArrowRight size={14} className="text-ash group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-steel bg-carbon/30 hover:border-cobalt transition-colors cursor-pointer group">
                            <span className="font-bold text-ash group-hover:text-cobalt">₿</span>
                            <div className="flex-1">
                                <strong className="block text-bone">CRYPTO</strong>
                                <span className="text-ash">BTC / ETH / SOL accepted</span>
                            </div>
                            <ArrowRight size={14} className="text-ash group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                <div className="text-xs text-ash leading-relaxed">
                    <h3 className="uppercase tracking-widest mb-2 text-ash">TERMS_&_CONDITIONS</h3>
                    <p>
                        Payment due within 14 days of issue. Late payments subject to 5% compounding interest per month.
                        Digital assets released upon full settlement of balance.
                    </p>
                    <p className="mt-4 font-mono text-cobalt">
                        &gt; END_OF_TRANSMISSION
                    </p>
                </div>
            </div>
        </div>
    );
}

export default InvoiceView;
