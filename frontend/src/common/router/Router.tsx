import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../containers/Layout';
import { useAuthContext } from '../../contexts/AuthContext';
import AppStore from '../../pages/apps-store/AppStore';
import Dashboard from '../../pages/dashboard/Dashboard';
import Login from '../../pages/login/Login';
import Apps from '../../pages/my-apps/Apps';
import OrganizationActivity from '../../pages/organization/components/OrganizationActivity';
import OrganizationData from '../../pages/organization/components/OrganizationData';
import OrganizationFinancial from '../../pages/organization/components/OrganizationFinancial/OrganizationFinancial';
import OrganizationGeneral from '../../pages/organization/components/OrganizationGeneral/OrganizationGeneral';
import OrganizationLegal from '../../pages/organization/components/OrganizationLegal';
import Organization from '../../pages/organization/Organization';
import Users from '../../pages/users/Users';
import AuthGuard from '../guards/AuthGuards';

const Router = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to={'/'}></Navigate>}
        />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />}></Route>
          <Route path="organization" element={<Organization />}>
            <Route index element={<Navigate to={'general'}></Navigate>} />
            <Route path="general" element={<OrganizationGeneral />} />
            <Route path="activity" element={<OrganizationActivity />} />
            <Route path="legal" element={<OrganizationLegal />} />
            <Route path="financial" element={<OrganizationFinancial />} />
            <Route path="data" element={<OrganizationData />} />
          </Route>
          <Route path="users" element={<Users />}></Route>
          <Route path="apps" element={<Apps />}></Route>
          <Route path="store" element={<AppStore />}></Route>
        </Route>
        <Route path="*" element={<Navigate to={'/'}></Navigate>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
