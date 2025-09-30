import { Link, useFetcher } from "react-router";

export function ShopPage() {
  return (
    <section>
      <header className="pb-8">
        <Link to={"/location"} className="rounded-2xl bg-gray-400 px-16 py-2">
          back
        </Link>
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
