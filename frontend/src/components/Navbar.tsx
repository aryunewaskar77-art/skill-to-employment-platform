"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, MapPin, UserCheck, ShieldAlert, Activity, BarChart3, Layers, FileCheck, Circle } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';

function NavbarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams?.get('tab') || 'overview';
    const [reviewCount, setReviewCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/identity/review-queue');
                if (res.ok) {
                    const data = await res.json();
                    setReviewCount(data.length);
                }
            } catch (e) {
                console.error('Failed to fetch review queue length', e);
            }
        };
        fetchCount();
        
        const interval = setInterval(fetchCount, 15000);
        window.addEventListener('reviewQueueUpdated', fetchCount);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('reviewQueueUpdated', fetchCount);
        };
    }, []);

    const navLinks = [
        { name: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Data Observatory', href: '/data-observatory', icon: BarChart3 },
        { name: 'Yojna & Schemes', href: '/schemes', icon: Layers },
        { name: 'Skill-Gap Command Center', href: '/skill-gap', icon: MapPin },
        { name: 'Policy Interventions', href: '/policy', icon: FileCheck },
        { name: 'Review Queue', href: '/review-queue', icon: UserCheck, badge: reviewCount }
    ];

    return (
        <div className="flex flex-col border-b border-slate-200 sticky top-0 z-50 bg-white">
            {/* Top Header Tier: Government Identity & Architecture Positioning */}
            <div className="bg-slate-900 text-slate-300 text-xs py-2 px-6 flex flex-col md:flex-row justify-between items-center tracking-wide gap-4 border-b border-slate-800">
                {/* Left: Emblem Placeholder + Dept Name */}
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center shadow-inner border border-slate-600">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="font-bold text-slate-100 hidden sm:inline-block">
                        Skill Development, Employment & Innovation Department (SEEID)
                    </span>
                    <span className="font-bold text-slate-100 sm:hidden">SEEID (GoM)</span>
                </div>
                
                {/* Center/Right: Platform Name & Architecture Layer */}
                <div className="flex-1 flex justify-center hidden lg:flex">
                    <span className="text-slate-400 font-medium">SIH26-26135 Platform <span className="mx-2 text-slate-600">|</span> Privacy-Preserving Interoperability & Outcome Intelligence Layer</span>
                </div>

                {/* Right: Live Badge */}
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-inner shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-medium text-emerald-100">Synthetic Mock Connectors Active (EPFO/ESIC Mocks)</span>
                </div>
            </div>

            {/* Primary Navigation Bar Tier */}
            <nav className="bg-white px-6 flex items-center shadow-sm overflow-x-auto relative">
                <div className="flex items-center gap-6 min-w-max h-14">
                    
                    {/* Primary Links */}
                    <div className="flex items-center h-full">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || (link.href === '/dashboard' && pathname.startsWith('/dashboard'));

                            return (
                                <Link 
                                    key={link.name} 
                                    href={link.href}
                                    className={`relative flex items-center gap-2 px-4 h-full text-sm font-semibold transition-all duration-200 border-b-2
                                        ${isActive 
                                            ? 'text-emerald-700 bg-emerald-50/50 border-emerald-600' 
                                            : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50 border-transparent hover:border-slate-300'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                                    {link.name}
                                    
                                    {link.badge !== undefined && link.badge !== null && link.badge > 0 && (
                                        <span className="ml-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default function Navbar() {
    return (
        <Suspense fallback={<div className="h-[96px] bg-white border-b border-slate-200"></div>}>
            <NavbarContent />
        </Suspense>
    );
}
