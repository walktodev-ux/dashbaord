// import { redirect } from "next/navigation";

// export default function Page() {
//   redirect("/sign-in");
// }


import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Головна</h1>
      <ul className="list-disc pl-5 space-y-2">
        <li><Link className="underline" href="/sign-in">Sign In</Link></li>
        <li><Link className="underline" href="/dashboard">Dashboard</Link></li>
      </ul>
    </main>
  );
}
