"use client";

import HomeButton from "./HomeButton";
import AdminUnicorn from "./AdminUnicorn";
import UserStatus from "./UserStatus";

interface NavigationLayoutProps {
  children: React.ReactNode;
  showHomeButton?: boolean;
  showAdminIcon?: boolean;
  showUserStatus?: boolean;
}

export default function NavigationLayout({ 
  children, 
  showHomeButton = true,
  showAdminIcon = true,
  showUserStatus = true 
}: NavigationLayoutProps) {
  return (
    <>
      {showHomeButton && <HomeButton />}
      {showAdminIcon && <AdminUnicorn />}
      {showUserStatus && <UserStatus />}
      {children}
    </>
  );
}