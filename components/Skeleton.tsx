import React from 'react';

export const Skeleton = ({ className = '' }: { className?: string }) => {
    return (
        <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
    );
};

export const NovelCardSkeleton = () => {
    return (
        <div className="flex flex-col bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden h-full">
            <Skeleton className="w-full aspect-[2/3] rounded-none" />
            <div className="p-3 flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-1 mt-1">
                    <Skeleton className="h-4 w-12 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                </div>
            </div>
        </div>
    );
};

export const BannerSkeleton = () => {
    return (
        <div className="relative bg-slate-900 overflow-hidden h-[400px] md:h-[450px] animate-pulse">
            <div className="absolute inset-0 bg-slate-800"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-24 flex flex-col md:flex-row items-center md:items-end h-full justify-center md:justify-start">
                <div className="hidden md:block w-48 h-72 flex-shrink-0 rounded-lg bg-slate-700 mr-8"></div>
                <div className="flex-1 text-center md:text-left max-w-3xl w-full">
                    <div className="h-6 w-32 bg-slate-700 rounded-full mb-4 mx-auto md:mx-0"></div>
                    <div className="h-10 w-3/4 bg-slate-700 rounded mb-4 mx-auto md:mx-0"></div>
                    <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 w-5/6 bg-slate-700 rounded mb-6 mx-auto md:mx-0"></div>
                    <div className="h-12 w-32 bg-slate-700 rounded-lg mx-auto md:mx-0"></div>
                </div>
            </div>
        </div>
    );
};
