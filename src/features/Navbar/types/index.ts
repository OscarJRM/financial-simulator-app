export interface NavbarProps {
  className?: string;
}

export interface MenuItem {
  label: string;
  href?: string;
  subItems?: SubMenuItem[];
}

export interface SubMenuItem {
  label: string;
  href: string;
  description?: string;
}

export interface UserInfo {
  name: string;
  email: string;
  role: 'client' | 'admin';
}
