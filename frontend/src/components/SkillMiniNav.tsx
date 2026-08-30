"use client";
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { BookOpen, Map as MapIcon } from 'lucide-react';
import { Suspense } from 'react';

function SkillMiniNavContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams?.get('tab');

    const isSkillsDirectory = (pathname === '/dashboard' && tab === 'skills') || pathname.includes('/skill/');
    const isSkillGapMap = pathname === '/skill-gap';

    return (
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <Link 
                href="/dashboard?tab=skills" 
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${isSkillsDirectory ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
            >
                <BookOpen className="w-4 h-4" />
                Skills Directory
            </Link>
            <Link 
                href="/skill-gap" 
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${isSkillGapMap ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
            >
                <MapIcon className="w-4 h-4" />
                Skill-Gap GIS Map
            </Link>
        </div>
    );
}

export default function SkillMiniNav() {
    return (
        <Suspense fallback={<div className="h-10 border-b border-gray-200 mb-6 bg-gray-50 animate-pulse"></div>}>
            <SkillMiniNavContent />
        </Suspense>
    );
}
