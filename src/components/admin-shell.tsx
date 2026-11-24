"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, ArrowUpRight, Boxes, ChartNoAxesCombined, ChevronRight,
  CircleHelp, FolderKanban, Gauge, LayoutDashboard, MessageSquare,
  Package, Settings2, ShoppingBag, TicketPercent, Users, Wallet,
} from "lucide-react";

const primary = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Collections", icon: FolderKanban },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
];
const growth = [
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Discounts", icon: TicketPercent },
  { href: "/admin/returns", label: "Returns", icon: Wallet },
];

function NavLink({ item, pathname }: { item: (typeof primary)[number] | (typeof growth)[number]; pathname: string }) {
  const active = "exact" in item && item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;
  return (
    <Link href={item.href} prefetch className={`admin-nav-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
      <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{active && <ChevronRight className="admin-nav-chevron" size={14}/>}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><span className="admin-brand-mark">S</span><span>STYLISH<span>OWL.</span><small>STORE MANAGEMENT</small></span></Link>
        <div className="admin-nav-caption">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">{primary.map(item => <NavLink key={item.href} item={item} pathname={pathname}/>)}</nav>
        <div className="admin-nav-caption admin-nav-caption--spaced">CUSTOMER & GROWTH</div>
        <nav className="admin-nav" aria-label="Customer and growth navigation">{growth.map(item => <NavLink key={item.href} item={item} pathname={pathname}/>)}</nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" className="admin-nav-link"><ArrowUpRight size={17}/><span>View storefront</span></Link>
          <div className="admin-user"><span className="admin-avatar">A</span><span><strong>Store admin</strong><small>Administrator</small></span><Settings2 size={16}/></div>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div><span className="admin-topbar-kicker">YOUR STORE</span><strong>Control centre</strong></div>
          <div className="admin-topbar-right"><span className="admin-live-dot"/> Store management <Link href="/" aria-label="Open storefront"><ArrowUpRight size={17}/></Link></div>
        </header>
        <nav className="admin-mobile-nav" aria-label="Admin navigation">
          {[...primary.slice(0, 5), ...growth].map(item => {
            const active = "exact" in item && item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} prefetch className={active ? "is-active" : ""}><Icon size={17}/><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="admin-content" key={pathname}>{children}</div>
      </div>
    </div>
  );
}
