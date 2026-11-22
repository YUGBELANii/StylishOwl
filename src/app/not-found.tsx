import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="eyebrow eyebrow--dark">404 / WRONG TURN</p>
      <h1>Nothing<br /><span>here.</span></h1>
      <p>This page may have moved, or the piece you're looking for isn't available.</p>
      <Link className="button button--dark" href="/"><ArrowLeft size={16} /> Back to home</Link>
    </main>
  );
}
