import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";

export function BackButton(props: { link: string }) {
  return (
    <section>
      <Link
        to={props.link}
        className="flex w-fit rounded-md bg-zinc-300/10 p-10 drop-shadow-md"
      >
        <ChevronLeft color="white" />
      </Link>
    </section>
  );
}
