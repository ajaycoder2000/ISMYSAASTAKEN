'use client';

import { SignIn } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const LogoBadge3D = dynamic(() => import("@/components/LogoBadge3D"), { ssr: false });

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-12 px-4">
      <div className="flex flex-col items-center">
        <LogoBadge3D size={140} />
      </div>
      <SignIn />
    </div>
  );
}
