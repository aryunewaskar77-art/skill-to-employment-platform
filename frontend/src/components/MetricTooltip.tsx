import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricTooltipProps {
    term: string;
    description?: string;
    children?: React.ReactNode;
}

export default function MetricTooltip({ term, description, children }: MetricTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const getStandardDescription = (t: string) => {
        const lowerT = t.toLowerCase();
        if (lowerT.includes('nco')) return "National Classification of Occupations 2015 — Standard 8-digit occupation & role mapping taxonomy.";
        if (lowerT.includes('nsqf')) return "National Skills Qualifications Framework (Levels 1 to 6) — Standard competency benchmark.";
        if (lowerT.includes('nic')) return "National Industrial Classification 2008 — Economic activity & sector code.";
        if (lowerT.includes('retention')) return "Continuous verified employment status after placement measured at 30, 90 (3m), 180 (6m), and 365 (12m) days.";
        if (lowerT.includes('uuid')) return "Pseudonymous, privacy-preserving internal identifier preventing direct PII leakage outside the identity boundary.";
        return description || "";
    };

    const finalDesc = getStandardDescription(term);

    return (
        <span 
            className="inline-flex items-center gap-1 relative cursor-help group"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <span className="underline decoration-slate-300 decoration-dashed underline-offset-4">
                {children || term}
            </span>
            <HelpCircle className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-xl z-[999] pointer-events-none transform opacity-100 transition-all duration-200">
                    <div className="font-bold mb-1 text-slate-300 border-b border-slate-700 pb-1">{term}</div>
                    <div className="leading-relaxed">{finalDesc}</div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
            )}
        </span>
    );
}
