import { useFetcher } from "react-router";
import { BackButton } from "../../shared/components/back-button";

export function ShopPage() {
  return (
    <section>
      <header className="pb-8">
        <BackButton link={"/location"} />
      </header>
      <main className="flex gap-8">
        <GasgoOrderItem header="Ai 95" price={11000} />
        <GasgoOrderItem header="Ai 92" price={10000} />
      </main>
    </section>
  );
}

function GasgoOrderItem(props: { header: string; price: number }) {
  const fetcher = useFetcher();

  return (
    <section className="bg-gray-400">
      <header>{props.header}</header>
      <main>
        <fetcher.Form>
          <div>
            {/* <label htmlFor="">Ai 95</label> */}
            <span>{props.price}</span>
            {/* <input type="number" /> */}
          </div>
        </fetcher.Form>
      </main>
    </section>
  );
}
