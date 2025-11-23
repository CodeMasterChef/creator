import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function UserMenu() {
    const session = await auth();

    if (!session) {
        return null; // Don't show anything if not logged in
    }

    return (
        <Link 
            href="/admin" 
            className="text-sm sm:text-base font-medium px-3 sm:px-4 py-2 bg-primary hover:bg-yellow-500 text-gray-900 rounded-lg transition-all shadow-sm hover:shadow-md"
        >
            <span className="hidden sm:inline">Xin chào, Admin 👋</span>
            <span className="sm:hidden">Admin</span>
        </Link>
    );
}

