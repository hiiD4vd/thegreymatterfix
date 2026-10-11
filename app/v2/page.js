import { Suspense } from "react";
import A24Frame from "@/components/v2/A24Frame";

export const metadata = {
  title: "The Grey Matter V2",
  description: "Version 2 homepage.",
};

export default function VersionTwoPage() {
  return (
    <Suspense fallback={null}>
      <A24Frame />
    </Suspense>
  );
}
