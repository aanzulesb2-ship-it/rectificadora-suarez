"use client";

import { 
  Home, 
  Users, 
  FileText, 
  Wrench, 
  DollarSign,
  History,
  LogOut
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";


import { useAuth } from '../../components/AuthContext';

export default function SimpleSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();

  // Menú según rol
  const menuItems = role === 'tecnico'
    ? [
        { href: "/gestor/ordenes", icon: <Wrench className="w-5 h-5" />, label: "Órdenes" },
        { href: "/gestor/catalogos", icon: <FileText className="w-5 h-5" />, label: "Catálogos" },
      ]
    : [
        { href: "/gestor", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
        { href: "/gestor/clientes", icon: <Users className="w-5 h-5" />, label: "Clientes" },
        { href: "/gestor/nueva", icon: <FileText className="w-5 h-5" />, label: "Nueva Orden" },
        { href: "/gestor/ordenes", icon: <Wrench className="w-5 h-5" />, label: "Órdenes" },
        { href: "/gestor/facturacion", icon: <DollarSign className="w-5 h-5" />, label: "Facturación" },
        { href: "/gestor/historial", icon: <History className="w-5 h-5" />, label: "Historial" },
      ];


  const handleLogout = () => {
    // Eliminar cookies
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-stone-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-stone-900">Rectificadora</h1>
            <p className="text-xs text-stone-500">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Menú */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-red-50 text-red-600 font-medium"
                  : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:text-red-600 hover:bg-red-50 rounded-lg w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
