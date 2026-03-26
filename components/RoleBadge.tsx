
import React from 'react';
import { Role } from '../types';

interface RoleBadgeProps {
  roles?: Role[];
  role?: Role; // Backward compatibility or single role display
  limit?: number;
}

// Define priority: SSR > Admin > Mod > Author > Translator > User
const ROLE_PRIORITY: Record<Role, number> = {
  [Role.SSR]: 0,
  [Role.ADMIN]: 1,
  [Role.MOD]: 2,
  [Role.AUTHOR]: 3,
  [Role.TRANSLATOR]: 4,
  [Role.USER]: 5
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ roles, role, limit }) => {
  // Normalize to array
  let displayRoles: Role[] = roles ? [...roles] : (role ? [role] : []);
  
  // Rule: User cannot bear both roles Admin and Mod at the same time.
  // If Admin is present, filter out Mod for display purposes.
  if (displayRoles.includes(Role.ADMIN)) {
    displayRoles = displayRoles.filter(r => r !== Role.MOD);
  }

  // Sort roles based on priority
  displayRoles.sort((a, b) => {
    return (ROLE_PRIORITY[a] || 99) - (ROLE_PRIORITY[b] || 99);
  });
  
  // Filter out USER role if there are other roles (reduce clutter), unless it's the only one
  let filteredRoles = displayRoles.length > 1 
    ? displayRoles.filter(r => r !== Role.USER) 
    : displayRoles;

  if (limit && limit > 0) {
    filteredRoles = filteredRoles.slice(0, limit);
  }

  if (filteredRoles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 ml-2 items-center">
      {filteredRoles.map((r, index) => {
          let styles = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";

          switch (r) {
              case Role.SSR:
                  styles = "bg-gradient-to-r from-pink-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-x font-extrabold border-2 border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.6)] backdrop-blur-md";
                  break;
              case Role.ADMIN:
                  styles = "bg-gradient-to-r from-violet-500 to-fuchsia-500 dark:from-violet-600 dark:to-fuchsia-600 text-white border border-violet-400/50 shadow-md shadow-violet-500/30 backdrop-blur-md";
                  break;
              case Role.MOD:
                  styles = "bg-gradient-to-r from-blue-500 to-violet-500 dark:from-blue-600 dark:to-violet-600 text-white border border-blue-400/50 shadow-sm shadow-blue-500/20 backdrop-blur-md";
                  break;
              case Role.AUTHOR:
                  styles = "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 backdrop-blur-md";
                  break;
              case Role.TRANSLATOR:
                  styles = "bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 backdrop-blur-md";
                  break;
          }

          return (
            <span key={index} className={`px-2 py-0.5 text-xs font-bold rounded-full border ${styles} whitespace-nowrap`}>
              {r}
            </span>
          );
      })}
    </div>
  );
};