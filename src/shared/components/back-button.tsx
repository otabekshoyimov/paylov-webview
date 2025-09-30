import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";

export function BackButton(props: { link: string }) {
  return (
    <section>
      <Link
        to={props.link}
        className="flex w-fit rounded-2xl bg-gray-300/10 px-16 py-2"
      >
        <ChevronLeft />
      </Link>
    </section>
  );
}
