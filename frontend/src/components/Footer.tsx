import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    <div className="text-center md:text-left">
                        <h4 className="text-slate-200 font-bold text-sm tracking-wide mb-1">
                            Government of Maharashtra &mdash; Skill Development, Employment & Innovation Department (SEEID)
                        </h4>
                        <p className="text-xs text-slate-500">
                            Built for Smart India Hackathon 2026 (SIH26-26135) &copy; {new Date().getFullYear()}
                        </p>
                    </div>


                    
                </div>
            </div>
        </footer>
    );
}
