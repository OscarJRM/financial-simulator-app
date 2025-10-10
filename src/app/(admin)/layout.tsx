import { Navbar } from "@/shared/layout/Navbar";

/**
 * Layout para el panel de administración
 * 
 * Actualmente usa el Navbar compartido, pero puedes:
 * 1. Crear un AdminNavbar específico en features/admin/presentation/components/
 * 2. Crear un navbar personalizado en shared/layout/AdminNavbar.tsx
 * 3. Agregar un Sidebar específico para admin
 * 
 * Ejemplo:
 * import { AdminNavbar } from "@/features/admin/presentation/components/AdminNavbar";
 * import { AdminSidebar } from "@/shared/layout/AdminSidebar";
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {<Navbar />}
      {/* Aquí puedes agregar componentes específicos de admin como Sidebar */}
      {children}
    </>
  );
}
