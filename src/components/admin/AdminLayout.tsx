import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link'; // Assuming this is a Next.js project
// If not Next.js, and you use react-router-dom:
// import { Link } from 'react-router-dom';
// import { useSession } from 'next-auth/react'; // Or your client-side auth check
// import { useRouter } from 'next/router'; // For Next.js client-side navigation

interface AdminLayoutProps {
  children: ReactNode;
}

// Mock client-side admin check for demo
async function checkAdminClientSide(): Promise<boolean> {
    // In a real app, this might involve fetching user's role from an API or checking session data
    // For demo, simulate a delay and return true if a mock condition is met
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async check
    // const session = await getSession(); // Example with NextAuth
    // return session?.user?.isAdmin === true;
    console.warn("DEV MODE: AdminLayout client-side check assuming admin for demo.");
    return true; // For demo, assume admin
}


export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // const { data: session, status } = useSession(); // For NextAuth
  // const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Client-side check for admin, redirect if not admin
    // This is a secondary check; primary check should be server-side middleware
    // if (status === 'loading') return;
    // if (status === 'unauthenticated' || !session?.user?.isAdmin) { // Adjust based on your session structure
    //   router.replace('/'); // Redirect to home or login
    // }
    const verifyAdmin = async () => {
        const isAdminUser = await checkAdminClientSide();
        setIsAdmin(isAdminUser);
        setIsLoading(false);
        if (!isAdminUser) {
            // router.replace('/'); // Redirect if not admin
            console.log("Client-side check: Not an admin. Would redirect.");
        }
    };
    verifyAdmin();
  }, [/* status, session, router */]);

  if (isLoading) {
    return <div className="p-4 text-center">Checking admin privileges...</div>;
  }
  if (!isAdmin) {
    return <div className="p-4 text-center text-red-500">Access Denied. You are not authorized to view this page. (Client-side check)</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-3">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
        <nav>
          <ul>
            <li><Link href="/admin/dashboard" className="block py-1.5 px-2 rounded hover:bg-gray-700">Dashboard</Link></li>
            <li><Link href="/admin/users" className="block py-1.5 px-2 rounded hover:bg-gray-700">User Management</Link></li>
            <li><Link href="/admin/settings" className="block py-1.5 px-2 rounded hover:bg-gray-700">System Settings</Link></li>
            {/* Add more admin links */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        {children}
      </main>
    </div>
  );
};