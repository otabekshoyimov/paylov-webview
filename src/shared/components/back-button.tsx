import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";

export function BackButton(props: { link: string }) {
  return (
    <section>
      <Link
        to={props.link}
        className="flex w-fit rounded-2xl bg-white px-4 py-2 shadow"
      >
        <ChevronLeft />
      </Link>
    </section>
  );
}
