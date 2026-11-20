import { LoaderCircle } from "lucide-react";

// A spinning circle shown while something is loading.
export default function Loader() {
  return (
    <LoaderCircle
      className="mx-auto block size-5 animate-spin"
      role="status"
      aria-label="Loading"
    />
  );
}
