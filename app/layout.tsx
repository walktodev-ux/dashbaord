// import "./globals.css";
// import type { ReactNode } from "react";
// import Providers from "./providers";

// export const metadata = {
//   title: "Walkto CRM",
//   description: "CRM для психологів",
// };

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="uk">
//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }


import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";

import "react-datepicker/dist/react-datepicker.css";


export const metadata: Metadata = {
  title: "Walkto CRM Starter",
  description: "Starter"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
