import React from 'react';
import { grayColor3, grayColor2 } from '@/constants/color';

export default function InboxLoading() {
  return (
    <div style={{ backgroundColor: grayColor2, minHeight: '100vh', color: grayColor3 }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Skeleton for main heading */}
        <div className="flex justify-center mb-8">
          <div 
            className="h-10 w-16 rounded animate-pulse"
            style={{ backgroundColor: '#404040' }}
          />
        </div>

        {/* Skeleton for tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-8">
            <div 
              className="h-8 w-12 rounded animate-pulse"
              style={{ backgroundColor: '#404040' }}
            />
            <div 
              className="h-8 w-20 rounded animate-pulse"
              style={{ backgroundColor: '#404040' }}
            />
          </div>
        </div>

        {/* Skeleton for filter */}
        <div className="flex justify-center mb-8">
          <div 
            className="h-10 w-48 rounded animate-pulse"
            style={{ backgroundColor: '#404040' }}
          />
        </div>

        {/* Skeleton for notification items */}
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((item) => (
            <div 
              key={item}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: '#1e1e1e' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full animate-pulse"
                  style={{ backgroundColor: '#404040' }}
                />
                <div className="space-y-2">
                  <div 
                    className="h-4 w-40 rounded animate-pulse"
                    style={{ backgroundColor: '#404040' }}
                  />
                  <div 
                    className="h-3 w-24 rounded animate-pulse"
                    style={{ backgroundColor: '#404040' }}
                  />
                </div>
              </div>
              <div 
                className="h-8 w-16 rounded animate-pulse"
                style={{ backgroundColor: '#404040' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
