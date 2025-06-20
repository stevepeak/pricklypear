import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "../ui/table";

export function DocumentTableSkeleton() {
  return (
    <>
      <TableRow>
        <TableCell colSpan={7}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-1/3" />
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-1/4" />
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-1/4" />
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
