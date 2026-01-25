'use client';

import { Project } from '@/lib/api';
import { CreditCard, Scan, ArrowRight, Wallet } from 'lucide-react';

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
        <div className="bg-[#050505] text-gray-300 font-mono text-sm border border-white/10 relative shadow-2xl">
            {/* Invoice Header */}
            <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between md:items-start gap-6 bg-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Scan size={24} className="text-blue-500" />
                        <h1 className="text-2xl font-bold tracking-tight text-white">INVOICE_{invoiceNumber}</h1>
                    </div>
                    <pre className="text-[10px] text-blue-500/50 leading-tight">
                        {` __      __        __            __          __  
 \\ \\    / /__  ___| |_ ___ _ _   \\ \\   / /__ | |__ 
  \\ \\/\\/ / -_)/ _|  _/ _ \\ '_|    \\ \\/\\/ / -_)| '_ \\
   \\_/\\_/\\___|\\__|\\__\\___/_|       \\_/\\_/\\___||_.__/`}
                    </pre>
                </div>
                <div className="text-right">
                    <div className="inline-block border border-yellow-500/50 text-yellow-400 px-3 py-1 text-xs mb-2 bg-yellow-500/10">
                        PAYMENT_STATUS: PENDING
                    </div>
                    <p className="text-xs text-gray-500">DUE_DATE: <span className="text-white">{dueDate}</span></p>
                </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/10">
                <div className="p-6 border-r border-white/10">
                    <span className="text-xs text-blue-500/70 uppercase tracking-wilder block mb-2">BILL_TO</span>
                    <strong className="block text-lg mb-1 text-white">{project.business_name}</strong>
                    <span className="block text-gray-500">{project.domain_choice}</span>
                </div>
                <div className="p-6 bg-[#0a0a0a] flex flex-col justify-center">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-500">ISSUE_DATE</span>
                        <span>{issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">REF_ID</span>
                        <span className="text-blue-400 font-mono">{project.id.slice(0, 12)}...</span>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black border-b border-white/10 text-xs uppercase text-gray-500">
                            <th className="p-4 font-normal w-24">ID</th>
                            <th className="p-4 font-normal w-[50%]">DESCRIPTION</th>
                            <th className="p-4 font-normal text-right whitespace-nowrap">QTY</th>
                            <th className="p-4 font-normal text-right whitespace-nowrap">RATE</th>
                            <th className="p-4 font-normal text-right whitespace-nowrap">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {services.map((service) => (
                            <tr key={service.id} className="group hover:bg-blue-500/5 transition-colors">
                                <td className="p-4 text-gray-600 group-hover:text-blue-400 transition-colors font-mono">{service.id}</td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-200">{service.description}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{service.detail}</div>
                                </td>
                                <td className="p-4 text-right text-gray-400">{service.quantity}</td>
                                <td className="p-4 text-right text-gray-500">
                                    {service.note ? (
                                        <span className="text-green-500 whitespace-nowrap">{service.note}</span>
                                    ) : (
                                        `$${service.rate}`
                                    )}
                                </td>
                                <td className="p-4 text-right font-bold text-white">${service.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total Section */}
            <div className="border-t border-white/10 bg-[#080808] p-8 flex justify-end relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                <div className="w-72 space-y-3 relative z-10">
                    <div className="flex justify-between text-gray-500 text-xs">
                        <span>SUBTOTAL</span>
                        <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-xs">
                        <span>NETWORK_FEES</span>
                        <span>$0.00</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                        <span className="font-bold text-lg text-white">TOTAL_DUE</span>
                        <span className="font-bold text-3xl text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                            ${totalPrice}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 bg-[#050505]">
                <div>
                    <h3 className="text-xs uppercase text-blue-500/50 tracking-widest mb-4">PAYMENT_CHANNELS</h3>
                    <div className="space-y-3 text-xs">
                        <div className="flex items-center gap-3 p-3 border border-white/10 bg-[#111] hover:border-blue-500/50 transition-colors cursor-pointer group rounded-sm">
                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20">
                                <CreditCard size={16} className="text-gray-400 group-hover:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <strong className="block text-white">STRIPE / CREDIT</strong>
                                <span className="text-gray-600">Secure instant settlement</span>
                            </div>
                            <ArrowRight size={14} className="text-gray-600 group-hover:translate-x-1 transition-transform group-hover:text-blue-400" />
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-white/10 bg-[#111] hover:border-purple-500/50 transition-colors cursor-pointer group rounded-sm">
                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20">
                                <Wallet size={16} className="text-gray-400 group-hover:text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <strong className="block text-white">CRYPTO ASSETS</strong>
                                <span className="text-gray-600">ETH / SOL / USDC</span>
                            </div>
                            <ArrowRight size={14} className="text-gray-600 group-hover:translate-x-1 transition-transform group-hover:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="text-xs text-gray-500 leading-relaxed font-mono">
                    <h3 className="uppercase tracking-widest mb-2 text-gray-700">EXECUTION_PROTOCOLS</h3>
                    <p className="mb-2">
                        Payment must be remitted within 14 days. Late settlements trigger a 5% compounding fee.
                        Smart contracts will automatically release codebase access upon full balance verification.
                    </p>
                    <p className="mt-4 text-blue-500/50">
                        &gt; END_OF_BLOCK
                    </p>
                </div>
            </div>
        </div>
    );
}
