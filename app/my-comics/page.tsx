import { Library } from "lucide-react";

export default function MyComicsPage() {
    return (
        <div className="flex flex-col w-full min-h-screen items-center justify-center bg-white dark:bg-black p-4 text-center">
            <div className="rounded-full bg-blue-500/10 p-6 mb-4">
                <Library size={48} className="text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">My Comics</h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
                This feature is coming soon! You will be able to see all the fan-fiction comics you've generated in one place.
            </p>
        </div>
    );
}
