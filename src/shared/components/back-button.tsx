import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";

export function BackButton(props: { link: string }) {
  return (
    <section>
      <Link
        to={props.link}
        className="flex w-fit rounded-2xl bg-zinc-300/10 p-4 shadow"
      >
        <ChevronLeft color="white" />
      </Link>
    </section>
  );
}
