"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserProfile } from "@/types/user";
import { ReactNode } from "react";

interface ProtectedLinkProps {
  href: string;
  children: ReactNode;
  requiredRole?: "ADMIN" | "CUSTOMER";
  className?: string;
  activeClassName?: string;
  userProfile: UserProfile | null;
}

export default function ProtectedLink({
  href,
  children,
  requiredRole,
  className = "",
  activeClassName = "",
  userProfile
}: ProtectedLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);
  
  // Rol kontrolü
  if (requiredRole && (!userProfile || userProfile.role !== requiredRole)) {
    return null;
  }
  
  return (
    <Link
      href={href}
      className={`${className} ${isActive ? activeClassName : ""}`}
    >
      {children}
    </Link>
  );
} 