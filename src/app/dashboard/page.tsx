'use client';
import React from 'react';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function DashboardPage() {
  const auth = getAuth(firebaseApp);

  return <DashboardLayout user={auth.currentUser} />;
} 