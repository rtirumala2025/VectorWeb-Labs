'use client';

import { Project } from '@/lib/api';

interface InvoiceViewProps {
    project: Project;
}

export function InvoiceView({ project }: InvoiceViewProps) {
    const today = new Date();
    const issueDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Due date is 14 days from today
    const dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Extract data from project
    const invoiceNumber = project.id.slice(0, 6).toUpperCase();
    const totalPrice = project.ai_price_quote?.price || 1200;
    const basePrice = 500;
    const customFeaturesPrice = totalPrice - basePrice;

    // Services table data
    const services = [
        {
            description: 'Website Design – Base Package',
            quantity: 1,
            rate: basePrice,
            total: basePrice
        },
        {
            description: 'AI Logic & Custom Features',
            quantity: 1,
            rate: customFeaturesPrice,
            total: customFeaturesPrice
        },
        {
            description: 'Maintenance Setup',
            quantity: 1,
            rate: 0,
            total: 0,
            note: 'Included'
        }
    ];

    return (
        <div className="bg-white text-void p-8 md:p-12 font-sans">
            {/* Header */}
            <div className="flex items-start justify-between mb-12 pb-6 border-b-2 border-void">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-void mb-2">
                        VectorWeb Labs Invoice
                    </h1>
                    <p className="text-sm text-gray-600">Professional Web Development Services</p>
                </div>
                <div className="text-right">
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 bg-cobalt flex items-center justify-center text-white font-bold text-xl">
                        VW
                    </div>
                </div>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Invoice Number</span>
                    <span className="font-mono font-bold text-lg">{invoiceNumber}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Issue Date</span>
                    <span className="font-mono">{issueDate}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Due Date</span>
                    <span className="font-mono text-red-600 font-bold">{dueDate}</span>
                </div>
            </div>

            {/* Bill To */}
            <div className="mb-12">
                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Bill To</span>
                <p className="font-bold text-lg">{project.business_name}</p>
                <p className="text-gray-600">{project.domain_choice}</p>
            </div>

            {/* Services Table */}
            <div className="mb-12">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-void">
                            <th className="text-left py-3 text-xs uppercase tracking-wider text-gray-500">Description</th>
                            <th className="text-center py-3 text-xs uppercase tracking-wider text-gray-500 w-20">Qty</th>
                            <th className="text-right py-3 text-xs uppercase tracking-wider text-gray-500 w-28">Rate</th>
                            <th className="text-right py-3 text-xs uppercase tracking-wider text-gray-500 w-28">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-4">
                                    <span className="font-medium">{service.description}</span>
                                </td>
                                <td className="py-4 text-center font-mono">{service.quantity}</td>
                                <td className="py-4 text-right font-mono">
                                    {service.note ? (
                                        <span className="text-green-600">${service.rate} ({service.note})</span>
                                    ) : (
                                        `$${service.rate}`
                                    )}
                                </td>
                                <td className="py-4 text-right font-mono font-bold">${service.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-64">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-mono">${totalPrice}</span>
                    </div>
                    <div className="flex justify-between py-4 border-b-2 border-void">
                        <span className="font-bold text-lg">TOTAL DUE</span>
                        <span className="font-mono font-bold text-lg text-cobalt">${totalPrice}</span>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-gray-50 border border-gray-200 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Payment Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <span className="text-xs text-gray-500 block mb-1">PayPal</span>
                        <span className="font-mono text-sm text-cobalt">paypal.me/vectorweblabs</span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block mb-1">Venmo</span>
                        <span className="font-mono text-sm text-cobalt">@VectorWebLabs</span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block mb-1">Cash App</span>
                        <span className="font-mono text-sm text-cobalt">$VectorWebLabs</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Thank you for your business!</p>
                <p className="mt-1">VectorWeb Labs • vectorweblabs.com • hello@vectorweblabs.com</p>
            </div>
        </div>
    );
}

export default InvoiceView;
