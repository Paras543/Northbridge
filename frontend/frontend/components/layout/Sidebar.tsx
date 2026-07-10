"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/clients", label: "Clients", icon: "group" },
  { href: "/projects", label: "Projects", icon: "assignment" },
  { href: "/consultations", label: "Consultations", icon: "chat_bubble" },
  { href: "/knowledge-base", label: "Knowledge Base", icon: "account_tree" },
  { href: "/reports", label: "Reports", icon: "description" },
  { href: "/team", label: "Team Members", icon: "groups" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex bg-[#0a0a0c] border-r border-[#1a1a1f] fixed left-0 top-0 h-full w-sidebar-width flex-col py-8 px-5 z-50">
      {/* Brand Logo */}
      <div className="mb-8 px-2">
        <h1 className="font-headline-lg text-[20px] font-bold leading-tight text-white tracking-tight">
          NorthBridge
        </h1>
        <p className="text-[11px] uppercase tracking-widest text-[#a1a1aa] font-semibold mt-1">
          Enterprise Consulting
        </p>
      </div>

      {/* Sleek Action Button */}
      <Link
        href="/consultations/new"
        className="w-full bg-white text-black font-semibold text-[13px] py-2.5 rounded-lg mb-6 hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px] font-bold">add</span>
        New Consultation
      </Link>

      {/* Navigation Menu */}
      <ul className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  isActive
                    ? "flex items-center gap-3 px-3 py-2 rounded-lg text-white font-medium bg-[#1c1c24] transition-all"
                    : "flex items-center gap-3 px-3 py-2 rounded-lg text-[#9494b8] hover:text-white hover:bg-[#121218] transition-all"
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[13px] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Sign Out Action */}
      <div className="mt-auto pt-4 border-t border-[#1a1a1f]">
        <SignOutButton>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#9494b8] hover:text-white hover:bg-[#121218] transition-all text-left">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-[13px] font-medium">Logout</span>
          </button>
        </SignOutButton>
      </div>
    </nav>
  );
}
