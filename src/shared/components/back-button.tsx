import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export function BackButton(props: { link: string }) {
  return (
    <section>
      <Link to={props.link} viewTransition className="flex w-fit">
        <ArrowLeft color="white" />
      </Link>
    </section>
  );
}
