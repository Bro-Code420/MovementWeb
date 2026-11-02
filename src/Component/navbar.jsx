
// import { useEffect, useState } from "react";
// import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

// // true = only admin sees the Staff tab
// // false = all logged-in users see the Staff tab
// const EMPLOYEE_TAB_ADMIN_ONLY = true;

// const Icon = ({ d, className = "h-5 w-5" }) => (
//   <svg
//     className={`${className} shrink-0`}
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="1.7"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     viewBox="0 0 24 24"
//     aria-hidden="true"
//   >
//     <path d={d} />
//   </svg>
// );

// const ICONS = {
//   add: "M12 8v8M8 12h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
//   list: "M9 3h6a1 1 0 011 1v1H8V4a1 1 0 011-1zM8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 12h6M9 16h6",
//   users: "M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8zM21 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
//   chart: "M3 3v18h18M7 15l4-4 3 3 5-6",
//   trash: "M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6",
//   logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
//   menu: "M4 6h16M4 12h16M4 18h16",
//   chevron: "M15 18l-6-6 6-6",
//   plus: "M12 5v14M5 12h14",
// };

// const Logo = ({ className = "h-9" }) => {
//   const [failed, setFailed] = useState(false);

//   if (failed) {
//     return (
//       <span className="text-lg font-extrabold tracking-tight text-[#0B4BAA]">
//         Movement <span className="text-[#00C2CB]">Rehab</span>
//       </span>
//     );
//   }

//   return (
//     <img
//       src="/logo.jpeg"
//       alt="Movement Rehab"
//       className={`${className} w-auto`}
//       onError={() => setFailed(true)}
//     />
//   );
// };

// const readCollapsed = () => {
//   try {
//     return localStorage.getItem("sidebarCollapsed") === "1";
//   } catch {
//     return false;
//   }
// };

// const NavigationTabs = () => {
//   const [open, setOpen] = useState(false);
//   const [collapsed, setCollapsed] = useState(readCollapsed);

//   const { pathname } = useLocation();
//   const navigate = useNavigate();

//   let employee = null;

//   try {
//     employee = JSON.parse(localStorage.getItem("loginEmployeeData"));
//   } catch {
//     employee = null;
//   }

//   const isLoggedIn = !!localStorage.getItem("webapptoken");

//   const isAdmin =
//     employee?.personalDetails?.email === import.meta.env.VITE_ADMIN_EMAIL;

//   const logout = () => {
//     localStorage.removeItem("webapptoken");
//     localStorage.removeItem("employeeData");
//     localStorage.removeItem("loginEmployeeData");
//     setOpen(false);
//     navigate("/auth");
//   };

//   // Navigation tabs
//   const tabs = [
//     {
//       name: "Dashboard",
//       path: "/",
//       icon: ICONS.add,
//       title: "Dashboard",
//     },
//     {
//       name: "Enquiry",
//       path: "/Enquiry",
//       icon: ICONS.add,
//       title: "Add Enquiry",
//     },
//     {
//       name: "New Bill",
//       path: "/Newbill",
//       icon: ICONS.list,
//       title: "Generate New Bill",
//     },
//     {
//       name: "All Enquiry",
//       path: "/allEnquiry",
//       icon: ICONS.list,
//       title: "All Enquiries",
//     },
//     {
//       name: "Staff",
//       path: "/allEmployee",
//       icon: ICONS.users,
//       title: "Employees",
//     },
//     {
//       name: "Reports",
//       path: "/Reports",
//       icon: ICONS.chart,
//       title: "Reports",
//       adminOnly: true,
//     },
//     {
//       name: "Daily Attendance",
//       path: "/daily-attendance",
//       icon: ICONS.chart,
//       title: "Daily Attendance",
//     },
//     {
//       name: "Staff Attendance",
//       path: "/attendence",
//       icon: ICONS.users,
//       title: "Staff Attendance",
//       adminOnly: true,
//     },
//     { name: "Recycle Bin", path: "/recycle-bin", icon: ICONS.trash, title: "Recycle Bin", adminOnly: true },
//   ];

//   // Owner-only tabs are not shown to anyone else (the API refuses them too).
//   if (!isAdmin) {
//     for (let i = tabs.length - 1; i >= 0; i -= 1) {
//       if (tabs[i].adminOnly) tabs.splice(i, 1);
//     }
//   }

//   if (EMPLOYEE_TAB_ADMIN_ONLY && !isAdmin) {
//     const staffIndex = tabs.findIndex((tab) => tab.path === "/allEmployee");
//     if (staffIndex !== -1) {
//       tabs.splice(staffIndex, 1);
//     }
//   }

//   const email = employee?.personalDetails?.email || "";
//   const name =
//     employee?.personalDetails?.name || email.split("@")[0] || "User";

//   const current =
//     tabs.find((tab) =>
//       tab.path === "/"
//         ? pathname === "/"
//         : pathname.toLowerCase().startsWith(tab.path.toLowerCase())
//     )?.title || "Movement Rehab";

//   const toggleCollapsed = () => {
//     const next = !collapsed;
//     setCollapsed(next);

//     try {
//       localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
//     } catch {
//       // Ignore unavailable localStorage
//     }
//   };

//   // Close the mobile drawer when the route changes
//   useEffect(() => {
//     setOpen(false);
//   }, [pathname]);

//   // Close the drawer with Escape
//   useEffect(() => {
//     const onKey = (event) => {
//       if (event.key === "Escape") {
//         setOpen(false);
//       }
//     };

//     window.addEventListener("keydown", onKey);

//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   // Add spacing for the sidebar and top bar
//   useEffect(() => {
//     if (!isLoggedIn) return;

//     const classes = [
//       "pt-16",
//       "bg-slate-50",
//       "transition-[padding]",
//       "duration-200",
//       collapsed ? "lg:pl-[76px]" : "lg:pl-64",
//     ];

//     document.body.classList.add(...classes);

//     return () => document.body.classList.remove(...classes);
//   }, [isLoggedIn, collapsed]);

//   // Logged-out header
//   if (!isLoggedIn) {
//     return (
//       <header className="border-b border-slate-200 bg-white">
//         <div className="h-1 bg-gradient-to-r from-[#00C2CB] to-[#0B4BAA]" />

//         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
//           <Link to="/">
//             <Logo />
//           </Link>

//           <Link
//             to="/auth"
//             className="rounded-xl bg-[#0B4BAA] px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2"
//           >
//             Login
//           </Link>
//         </div>
//       </header>
//     );
//   }

//   // Sidebar content
//   const SidebarBody = ({ slim }) => (
//     <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#082F6B] to-[#051F4A] text-white">
//       <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,194,203,0.22),transparent_55%)]" />

//       <div className="relative flex h-full flex-col px-3 py-5">
//         {/* Brand */}
//         <Link
//           to="/"
//           title="Movement Rehab"
//           className={`mb-7 flex items-center rounded-2xl bg-white shadow-lg shadow-black/20 ring-1 ring-white/40 ${
//             slim ? "mx-auto h-11 w-11 justify-center" : "px-4 py-3"
//           }`}
//         >
//           {slim ? (
//             <span className="text-sm font-extrabold tracking-tight text-[#0B4BAA]">
//               M<span className="text-[#00C2CB]">R</span>
//             </span>
//           ) : (
//             <Logo />
//           )}
//         </Link>

//         {!slim && (
//           <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200/50">
//             Menu
//           </p>
//         )}

//         {/* Navigation links */}
//         <nav className="space-y-1.5">
//           {tabs.map((tab) => (
//             <NavLink
//               key={tab.path}
//               to={tab.path}
//               end={tab.path === "/"}
//               title={slim ? tab.name : undefined}
//               className={({ isActive }) =>
//                 `group relative flex items-center gap-3 rounded-xl py-2 text-[14.5px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
//                   slim ? "justify-center px-2" : "px-2.5"
//                 } ${
//                   isActive
//                     ? "bg-white/10 text-white shadow-inner ring-1 ring-white/10"
//                     : "text-blue-100/70 hover:bg-white/5 hover:text-white"
//                 }`
//               }
//             >
//               {({ isActive }) => (
//                 <>
//                   {isActive && (
//                     <span className="absolute -left-3 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#00C2CB]" />
//                   )}

//                   <span
//                     className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors ${
//                       isActive
//                         ? "bg-[#00C2CB] text-[#051F4A]"
//                         : "bg-white/5 text-blue-100/80 group-hover:bg-white/10"
//                     }`}
//                   >
//                     <Icon d={tab.icon} className="h-[18px] w-[18px]" />
//                   </span>

//                   {!slim && <span>{tab.name}</span>}
//                 </>
//               )}
//             </NavLink>
//           ))}
//         </nav>

//         {/* Sidebar footer */}
//         <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
//           {!slim && (
//             <p className="px-2 pb-1 text-[11px] leading-snug text-blue-200/50">
//               Elevate your health &amp; performance
//             </p>
//           )}

//           <div
//             className={`flex items-center gap-3 rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10 ${
//               slim ? "justify-center" : ""
//             }`}
//             title={slim ? name : undefined}
//           >
//             <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#00C2CB] to-[#0B4BAA] text-sm font-bold uppercase text-white ring-2 ring-white/20">
//               {name.charAt(0)}
//             </div>

//             {!slim && (
//               <div className="min-w-0">
//                 <p className="truncate text-sm font-semibold">{name}</p>

//                 <span className="mt-0.5 inline-block rounded-full bg-[#00C2CB]/15 px-2 py-0.5 text-[11px] font-semibold text-[#7FE9EE]">
//                   {isAdmin ? "Admin" : "Staff"}
//                 </span>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={logout}
//             title={slim ? "Logout" : undefined}
//             className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-blue-100/70 transition hover:bg-rose-500/15 hover:text-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
//               slim ? "justify-center" : ""
//             }`}
//           >
//             <Icon d={ICONS.logout} className="h-[18px] w-[18px]" />
//             {!slim && "Logout"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* Desktop sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-40 hidden shadow-xl shadow-slate-900/10 transition-[width] duration-200 lg:block ${
//           collapsed ? "w-[76px]" : "w-64"
//         }`}
//       >
//         <SidebarBody slim={collapsed} />

//         <button
//           onClick={toggleCollapsed}
//           aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//           className="absolute -right-3 top-[34px] grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-[#0B4BAA] shadow-md transition hover:bg-[#E6F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
//         >
//           <Icon
//             d={ICONS.chevron}
//             className={`h-3.5 w-3.5 transition-transform ${
//               collapsed ? "rotate-180" : ""
//             }`}
//           />
//         </button>
//       </aside>

//       {/* Mobile drawer */}
//       <div
//         className={`fixed inset-0 z-50 lg:hidden ${
//           open ? "" : "pointer-events-none"
//         }`}
//       >
//         <button
//           aria-label="Close menu"
//           onClick={() => setOpen(false)}
//           className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity ${
//             open ? "opacity-100" : "opacity-0"
//           }`}
//         />

//         <aside
//           className={`absolute inset-y-0 left-0 w-72 transform shadow-2xl transition-transform duration-200 ${
//             open ? "translate-x-0" : "-translate-x-full"
//           }`}
//         >
//           <SidebarBody slim={false} />
//         </aside>
//       </div>

//       {/* Top navigation bar */}
//       <header
//         className={`fixed left-0 right-0 top-0 z-30 h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-[left] duration-200 ${
//           collapsed ? "lg:left-[76px]" : "lg:left-64"
//         }`}
//       >
//         <div className="h-[3px] bg-gradient-to-r from-[#00C2CB] via-[#0B4BAA] to-[#082F6B]" />

//         <div className="flex h-[calc(4rem-3px)] items-center gap-3 px-4 sm:px-6">
//           <button
//             onClick={() => setOpen(true)}
//             aria-label="Open menu"
//             aria-expanded={open}
//             className="rounded-xl p-2 text-[#0B4BAA] transition hover:bg-[#E6F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] lg:hidden"
//           >
//             <Icon d={ICONS.menu} />
//           </button>

//           <div className="min-w-0 leading-tight">
//             <p className="hidden truncate text-xs font-medium text-slate-400 sm:block">
//               Movement Rehab <span className="mx-1 text-slate-300">/</span>{" "}
//               {current}
//             </p>

//             <h1 className="truncate text-lg font-bold tracking-tight text-slate-800">
//               {current}
//             </h1>
//           </div>

//           <div className="ml-auto flex items-center gap-3">
//             <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 md:block">
//               {new Date().toLocaleDateString("en-IN", {
//                 weekday: "short",
//                 day: "numeric",
//                 month: "short",
//                 year: "numeric",
//               })}
//             </span>

//             {pathname !== "/" &&
//               !pathname.toLowerCase().startsWith("/reports") && (
//                 <Link
//                   to="/"
//                   className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B4BAA] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2"
//                 >
//                   <Icon d={ICONS.plus} className="h-4 w-4" />
//                   <span className="hidden sm:inline">New Enquiry</span>
//                 </Link>
//               )}
//           </div>
//         </div>
//       </header>
//     </>
//   );
// };

// export default NavigationTabs;




import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

// true = only admin sees the Staff tab
// false = all logged-in users see the Staff tab
const EMPLOYEE_TAB_ADMIN_ONLY = true;

const Icon = ({ d, className = "h-5 w-5" }) => (
  <svg
    className={`${className} shrink-0`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  // Dashboard: home icon
  dashboard: "M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6", 
  // Enquiry: person with plus icon
  enquiry: "M16 20v-1.5a4.5 4.5 0 00-4.5-4.5h-3A4.5 4.5 0 004 18.5V20M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19 8v6M16 11h6",
  // New Bill: invoice/document with a currency mark
  invoice: "M6 3h9l4 4v14H6a2 2 0 01-2-2V5a2 2 0 012-2zM14 3v5h5M8 12h8M8 16h4M12 10v4m-2-2h4",
  // All Enquiry: clipboard with checklist rows
  enquiries: "M9 4h6a2 2 0 012 2v1h2v14H5V7h2V6a2 2 0 012-2zM9 4V3h6v1M9 11h1m2 0h3M9 15h1m2 0h3",
  // Staff: group of people
  users: "M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9.5 11a4 4 0 100-8 4 4 0 000 8zM20 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  // Staff attendance: employee badge with check
  staffCheck: "M12 3a3 3 0 100 6 3 3 0 000-6zM5 20v-1a7 7 0 0114 0v1H5zm11-8 2 2 3-3",
  // Reports: analytics bars
  chart: "M4 19V5M4 19h16M8 15v-4M12 15V7M16 15v-7M20 15V4",
  // Daily attendance: calendar with a check
  calendarCheck: "M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zm3 9 2 2 4-4",
  trash: "M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  menu: "M4 6h16M4 12h16M4 18h16",
  chevron: "M15 18l-6-6 6-6",
  plus: "M12 5v14M5 12h14",
};

// Brand name as text (no logo image)
const Logo = () => (
  <span className="whitespace-nowrap text-xl font-extrabold tracking-tight text-[#0B4BAA]">
    Movement <span className="text-[#00C2CB]">Rehab</span>
  </span>
);

const readCollapsed = () => {
  try {
    return localStorage.getItem("sidebarCollapsed") === "1";
  } catch {
    return false;
  }
};

const NavigationTabs = () => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  let employee = null;

  try {
    employee = JSON.parse(localStorage.getItem("loginEmployeeData"));
  } catch {
    employee = null;
  }

  const isLoggedIn = !!localStorage.getItem("webapptoken");

  const isAdmin =
    employee?.personalDetails?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const logout = () => {
    localStorage.removeItem("webapptoken");
    localStorage.removeItem("employeeData");
    localStorage.removeItem("loginEmployeeData");
    setOpen(false);
    navigate("/auth");
  };

  // Navigation tabs
  const tabs = [
    {
      name: "Dashboard",
      path: "/",
      icon: ICONS.dashboard,
      title: "Dashboard",
    },
    {
      name: "Enquiry",
      path: "/Enquiry",
      icon: ICONS.enquiry,
      title: "Add Enquiry",
    },
    {
      name: "New Bill",
      path: "/Newbill",
      icon: ICONS.invoice,
      title: "Generate New Bill",
    },
    {
      name: "All Enquiry",
      path: "/allEnquiry",
      icon: ICONS.enquiries,
      title: "All Enquiries",
    },
    {
      name: "Staff",
      path: "/allEmployee",
      icon: ICONS.users,
      title: "Employees",
    },
    {
      name: "Reports",
      path: "/Reports",
      icon: ICONS.chart,
      title: "Reports",
      adminOnly: true,
    },
    {
      name: "Daily Attendance",
      path: "/daily-attendance",
      icon: ICONS.calendarCheck,
      title: "Daily Attendance",
    },
    {
      name: "Staff Attendance",
      path: "/attendence",
      icon: ICONS.staffCheck,
      title: "Staff Attendance",
      adminOnly: true,
    },
    { name: "Recycle Bin", path: "/recycle-bin", icon: ICONS.trash, title: "Recycle Bin", adminOnly: true },
  ];

  // Owner-only tabs are not shown to anyone else (the API refuses them too).
  if (!isAdmin) {
    for (let i = tabs.length - 1; i >= 0; i -= 1) {
      if (tabs[i].adminOnly) tabs.splice(i, 1);
    }
  }

  if (EMPLOYEE_TAB_ADMIN_ONLY && !isAdmin) {
    const staffIndex = tabs.findIndex((tab) => tab.path === "/allEmployee");
    if (staffIndex !== -1) {
      tabs.splice(staffIndex, 1);
    }
  }

  const email = employee?.personalDetails?.email || "";
  const name =
    employee?.personalDetails?.name || email.split("@")[0] || "User";

  const current =
    tabs.find((tab) =>
      tab.path === "/"
        ? pathname === "/"
        : pathname.toLowerCase().startsWith(tab.path.toLowerCase())
    )?.title || "Movement Rehab";

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);

    try {
      localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
    } catch {
      // Ignore unavailable localStorage
    }
  };

  // Close the mobile drawer when the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close the drawer with Escape
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Add spacing for the sidebar and top bar
  useEffect(() => {
    if (!isLoggedIn) return;

    const classes = [
      "pt-16",
      "bg-slate-50",
      "transition-[padding]",
      "duration-200",
      collapsed ? "lg:pl-[76px]" : "lg:pl-64",
    ];

    document.body.classList.add(...classes);

    return () => document.body.classList.remove(...classes);
  }, [isLoggedIn, collapsed]);

  // Logged-out header
  if (!isLoggedIn) {
    return (
      <header className="border-b border-slate-200 bg-white">
        <div className="h-1 bg-gradient-to-r from-[#00C2CB] to-[#0B4BAA]" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/">
            <Logo />
          </Link>

          <Link
            to="/auth"
            className="rounded-xl bg-[#0B4BAA] px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2"
          >
            Login
          </Link>
        </div>
      </header>
    );
  }

  // Sidebar content
  const SidebarBody = ({ slim }) => (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#082F6B] to-[#051F4A] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,194,203,0.22),transparent_55%)]" />

      <div className="relative flex h-full flex-col px-3 py-5">
        {/* Brand */}
        <Link
          to="/"
          title="Movement Rehab"
          className={`mb-7 flex items-center rounded-2xl bg-white shadow-lg shadow-black/20 ring-1 ring-white/40 ${
            slim ? "mx-auto h-11 w-11 justify-center" : "min-h-[60px] w-full justify-center px-3 py-2.5"
          }`}
        >
          {slim ? (
            <span className="text-sm font-extrabold tracking-tight text-[#0B4BAA]">
              M<span className="text-[#00C2CB]">R</span>
            </span>
          ) : (
            <Logo />
          )}
        </Link>

        {!slim && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200/50">
            Menu
          </p>
        )}

        {/* Navigation links */}
        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pb-3 pr-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === "/"}
              title={slim ? tab.name : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl py-2 text-[14.5px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
                  slim ? "justify-center px-2" : "px-2.5"
                } ${
                  isActive
                    ? "bg-white/10 text-white shadow-inner ring-1 ring-white/10"
                    : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#00C2CB]" />
                  )}

                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#00C2CB] text-[#051F4A]"
                        : "bg-white/5 text-blue-100/80 group-hover:bg-white/10"
                    }`}
                  >
                    <Icon d={tab.icon} className="h-[18px] w-[18px]" />
                  </span>

                  {!slim && <span>{tab.name}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto shrink-0 space-y-2 border-t border-white/10 bg-[#061F49]/95 pt-4">
          {!slim && (
            <p className="px-2 pb-1 text-[11px] leading-snug text-blue-200/50">
              Elevate your health &amp; performance
            </p>
          )}

          <div
            className={`flex items-center gap-3 rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10 ${
              slim ? "justify-center" : ""
            }`}
            title={slim ? name : undefined}
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#00C2CB] to-[#0B4BAA] text-sm font-bold uppercase text-white ring-2 ring-white/20">
              {name.charAt(0)}
            </div>

            {!slim && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{name}</p>

                <span className="mt-0.5 inline-block rounded-full bg-[#00C2CB]/15 px-2 py-0.5 text-[11px] font-semibold text-[#7FE9EE]">
                  {isAdmin ? "Admin" : "Staff"}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            title={slim ? "Logout" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-blue-100/70 transition hover:bg-rose-500/15 hover:text-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] ${
              slim ? "justify-center" : ""
            }`}
          >
            <Icon d={ICONS.logout} className="h-[18px] w-[18px]" />
            {!slim && "Logout"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden shadow-xl shadow-slate-900/10 transition-[width] duration-200 lg:block ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <SidebarBody slim={collapsed} />

        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[34px] grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-[#0B4BAA] shadow-md transition hover:bg-[#E6F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
        >
          <Icon
            d={ICONS.chevron}
            className={`h-3.5 w-3.5 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute inset-y-0 left-0 w-72 transform shadow-2xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarBody slim={false} />
        </aside>
      </div>

      {/* Top navigation bar */}
      <header
        className={`fixed left-0 right-0 top-0 z-30 h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-[left] duration-200 ${
          collapsed ? "lg:left-[76px]" : "lg:left-64"
        }`}
      >
        <div className="h-[3px] bg-gradient-to-r from-[#00C2CB] via-[#0B4BAA] to-[#082F6B]" />

        <div className="flex h-[calc(4rem-3px)] items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="rounded-xl p-2 text-[#0B4BAA] transition hover:bg-[#E6F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] lg:hidden"
          >
            <Icon d={ICONS.menu} />
          </button>

          <div className="min-w-0 leading-tight">
            <p className="hidden truncate text-xs font-medium text-slate-400 sm:block">
              Movement Rehab <span className="mx-1 text-slate-300">/</span>{" "}
              {current}
            </p>

            <h1 className="truncate text-lg font-bold tracking-tight text-slate-800">
              {current}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 md:block">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>

            {pathname.toLowerCase() !== "/enquiry" &&
              !pathname.toLowerCase().startsWith("/reports") && (
                <Link
                  to="/Enquiry"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B4BAA] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#0B4BAA]/30 transition hover:bg-[#093d8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] focus-visible:ring-offset-2"
                >
                  <Icon d={ICONS.plus} className="h-4 w-4" />
                  <span className="hidden sm:inline">New Enquiry</span>
                </Link>
              )}
          </div>
        </div>
      </header>
    </>
  );
};

export default NavigationTabs;