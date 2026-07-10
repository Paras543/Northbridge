"use client";

import { UserButton } from "@clerk/nextjs";

export function TopBar({ title, search = true }: { title: string; search?: boolean }) {
  return (
    <header className="bg-white flex justify-between items-center h-16 px-8 border-b border-neutral-100 sticky top-0 z-30">
      <div className="flex items-center gap-8 flex-1">
        <h2 className="text-[16px] font-semibold text-neutral-800 hidden md:block">
          {title}
        </h2>
        {search && (
          <div className="relative w-full max-w-sm hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[18px]">
              search
            </span>
            <input
              className="w-full pl-9 pr-4 py-1.5 bg-neutral-50 border border-neutral-200/80 rounded-lg focus:outline-none focus:border-black focus:ring-0 font-body-sm text-[13px] placeholder-neutral-400 transition-colors"
              placeholder="Search portfolio, projects..."
              type="text"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="text-neutral-500 hover:text-black transition-colors p-1.5 rounded-lg hover:bg-neutral-50">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button className="text-neutral-500 hover:text-black transition-colors p-1.5 rounded-lg hover:bg-neutral-50">
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>
        <div className="h-5 w-px bg-neutral-200 mx-1" />
        <UserButton />
      </div>
    </header>
  );
}
