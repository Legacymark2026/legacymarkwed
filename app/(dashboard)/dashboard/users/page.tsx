import { getUsers } from "@/actions/admin";
import { auth } from "@/lib/auth";
import { UsersDashboardClient } from "@/components/users/UsersDashboardClient";

export default async function UsersPage() {
    const [result, session] = await Promise.all([getUsers(), auth()]);

    if ('error' in result) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-full">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
                    <h2 className="font-bold text-lg">Error fatal</h2>
                    <p>{result.error}</p>
                </div>
            </div>
        );
    }

    const { users } = result;
    const currentUserId = session?.user?.id ?? "";

    return (
        <div className="h-full">
            <UsersDashboardClient
                initialUsers={users as any}
                currentUserId={currentUserId}
            />
        </div>
    );
}
