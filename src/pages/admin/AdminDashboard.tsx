import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardHome from '@/components/admin/DashboardHome';
import CreateCampaign from '@/components/admin/CreateCampaign';
import CampaignsList from '@/components/admin/CampaignsList';
import AdminProfile from '@/components/admin/AdminProfile';

const AdminDashboard = () => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/auth" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/create-campaign" element={<CreateCampaign />} />
        <Route path="/campaigns" element={<CampaignsList />} />
        <Route path="/campaigns/:id" element={<CreateCampaign />} />
        <Route path="/profile" element={<AdminProfile />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
