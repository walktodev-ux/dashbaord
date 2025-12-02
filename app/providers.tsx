// "use client";
// import { SessionProvider } from "next-auth/react";

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false}>
//       {children}
//     </SessionProvider>
//   );
// }


"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
