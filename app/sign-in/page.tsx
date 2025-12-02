// "use client";
// import { signIn } from "next-auth/react";

// export default function SignInPage() {
//   return (
//     <main className="min-h-dvh grid place-items-center p-6">
//       <section className="w-full max-w-sm space-y-6">
//         <header className="space-y-2">
//           <h1 className="text-2xl font-semibold">Авторизуйтесь,</h1>
//           <p className="text-sm text-neutral-500">
//             щоб увійти у свій робочий простір.
//           </p>
//         </header>

//         <div className="space-y-3">
//           <button
//             type="button"
//             onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
//             className="w-full rounded-md border px-4 py-2 text-sm hover:bg-neutral-50"
//           >
//             Увійти через Google
//           </button>

//           <button
//             type="button"
//             onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
//             className="w-full rounded-md border px-4 py-2 text-sm opacity-60"
//             title="Apple додамо пізніше"
//             disabled
//           >
//             Увійти через Apple
//           </button>
//         </div>

//         <footer className="text-xs text-neutral-500">
//           Натискаючи «Увійти», ви погоджуєтесь з умовами використання.
//         </footer>
//       </section>
//     </main>
//   );
// }


import { signIn } from "@/auth";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  async function handleGoogleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form action={handleGoogleSignIn} className="space-y-4">
        <h1 className="text-2xl font-semibold text-center">Увійти</h1>
        <button
          type="submit"
          className="px-4 py-2 rounded-md border"
        >
          Увійти через Google
        </button>
      </form>
    </main>
  );
}
