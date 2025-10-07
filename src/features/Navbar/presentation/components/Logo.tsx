import Link from 'next/link';
import { useInstitution } from '@/features/institution/hooks/useInstitution';

export function Logo() {
  const { config } = useInstitution();
  
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="w-9 h-9  rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
        {config.logo ? (
          <img
            src={config.logo}
            alt={config.institutionName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-black font-bold text-xl">
            {config.institutionName.charAt(0)}
          </span>
        )}
      </div>
      <span className="text-black text-lg hidden sm:block">
        {config.institutionName}
      </span>
    </Link>
  );
}
