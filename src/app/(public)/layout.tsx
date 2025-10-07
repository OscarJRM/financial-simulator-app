import { Navbar } from "@/shared/layout/Navbar";

export default function PublicLayout({    
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
