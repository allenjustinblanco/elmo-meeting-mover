import { Loader2 } from "lucide-react";

export function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h2 className="mt-4 text-2xl font-semibold">Loading...</h2>
      <p className="mt-2 text-muted-foreground">
        Please wait while we fetch the meeting data.
      </p>
    </div>
  );
}
