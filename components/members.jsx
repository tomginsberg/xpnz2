import {Skeleton} from "./ui/skeleton";

export default function MembersTab() {
    return (
        <div className="space-y-4 mt-[70px]">
            <Skeleton className="h-12 w-full"/>
            <Skeleton className="h-20 w-full"/>
            <Skeleton className="h-20 w-full"/>
            <Skeleton className="h-20 w-full"/>
        </div>
    );
}