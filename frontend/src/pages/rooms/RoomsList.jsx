import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { SkeletonList } from '../../components/ui/SkeletonLoader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function RoomsList() {
  const { data, loading, error, refetch } = useFetch('http://localhost:5000/api/rooms');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Our Rooms</h1>
        <SkeletonList count={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} retry={refetch} fullPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Our Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data?.data?.map(room => (
          <RoomCard key={room._id} room={room} />
        ))}
      </div>
    </div>
  );
}