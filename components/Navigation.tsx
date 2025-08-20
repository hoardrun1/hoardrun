import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const router = useRouter();
  const { signOutFromFirebase } = useAuth();

  const handleLogout = () => {
    signOutFromFirebase();
    router.push('/auth/signin');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold">Vogood</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-gray-900"
              >
                home
              </Link>
              <Link 
                href="../finance-page.tsx"
                className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900"
              >
                Finance
              </Link>
              <Link 
                href="../home-page.tsx/investment-page.tsx"
                className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900"
              >
                Investments
              </Link>
              <Link 
                href="../home-page.tsx/cards-page.tsx"
                className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900"
              >
                Cards
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 