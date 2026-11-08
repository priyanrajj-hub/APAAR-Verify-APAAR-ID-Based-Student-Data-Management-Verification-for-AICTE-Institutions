'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '@apaar/shared-types';

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  institution: {
    id: 'user_inst_01',
    email: 'registrar@cit.edu.in',
    name: 'Dr. Rajesh Raman (Registrar)',
    role: 'institution',
    institutionId: 'INST_CIT_001',
    institutionName: 'Chennai Institute of Technology',
    verified: true,
  },
  aicte: {
    id: 'user_aicte_01',
    email: 'officer.south@aicte-india.org',
    name: 'Smt. Sunita Rao (Director, AICTE Approval Bureau)',
    role: 'aicte',
    verified: true,
  },
  auditor: {
    id: 'user_auditor_01',
    email: 'auditor@cag.gov.in',
    name: 'Shri Vikram Malhotra (Senior Audit Officer)',
    role: 'auditor',
    verified: true,
  },
  student: {
    id: 'user_student_01',
    email: 'aarav.sharma@dtu.ac.in',
    name: 'Aarav Sharma (B.Tech CSE, 3rd Year)',
    role: 'student',
    institutionId: 'INST_DTU_005',
    institutionName: 'Delhi Technological University',
    apaarId: '987654321018',
    verified: true,
  },
  verifier: {
    id: 'user_verifier_01',
    email: 'talent.acquisition@tcs.com',
    name: 'Priya Iyer (TCS Talent Verification Lead)',
    role: 'verifier',
    verified: true,
  },
  superadmin: {
    id: 'user_admin_01',
    email: 'superadmin@moe.gov.in',
    name: 'Dr. K. Vijayaraghavan (National Systems Admin)',
    role: 'superadmin',
    verified: true,
  },
};

interface AuthContextValue {
  user: UserProfile;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('institution');
  const [isDemoMode, setDemoMode] = useState<boolean>(true);

  useEffect(() => {
    const savedRole = localStorage.getItem('apaar_demo_role') as UserRole;
    if (savedRole && DEMO_USERS[savedRole]) {
      setRole(savedRole);
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    if (DEMO_USERS[newRole]) {
      setRole(newRole);
      localStorage.setItem('apaar_demo_role', newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: DEMO_USERS[role],
        role,
        switchRole,
        isDemoMode,
        setDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
