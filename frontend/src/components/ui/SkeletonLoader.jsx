import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
    <div className="h-64 bg-gray-300"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-8 bg-gray-300 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-12 bg-gray-300 rounded"></div>
    </div>
  </div>
);

export const SkeletonDetail = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-32 mb-8"></div>
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="h-96 bg-gray-300"></div>
      <div className="p-8 space-y-6">
        <div className="h-10 bg-gray-300 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-300 rounded"></div>
          <div className="h-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);