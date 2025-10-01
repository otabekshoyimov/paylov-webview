import { useFetcher } from "react-router";
import { BackButton } from "../../shared/components/back-button";
import { useState } from "react";

export function ShopPage() {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    "Ai 95": 0,
    "Ai 92": 0,
  });
  const items = [
    { name: "Ai 95", price: 11000 },
    { name: "Ai 92", price: 10000 },
  ];

  function getTotalQuantity() {
    let total = 0;
    for (const item of items) {
      total += quantities[item.name] * item.price;
    }
    return total;
  }

  const handleQuantityChange = (header: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [header]: newQuantity,
    }));
  };

  const fetcher = useFetcher();
  return (
    <section className="flex min-h-screen flex-col p-16 text-white">
      <header className="pb-16">
        <BackButton link={"/location"} />
      </header>
      <main className="flex flex-col gap-16 px-8">
        {items.map((item) => (
          <GasgoOrderItem
            key={item.name}
            name={item.name}
            price={item.price}
            quantity={quantities[item.name]}
            handleQuantityChange={handleQuantityChange}
          />
        ))}
      </main>
      <footer className="mt-auto px-8 pb-8">
        <fetcher.Form className="flex justify-between">
          <span>Jami: {getTotalQuantity()} so'm</span>
          <button className="rounded-2xl bg-brand-green/10 px-16 py-2 text-white shadow outline outline-[0.9px] outline-brand-green">
            To'lovni tasdiqlash
          </button>
        </fetcher.Form>
      </footer>
    </section>
  );
}

function GasgoOrderItem(props: {
  name: string;
  price: number;
  handleQuantityChange: (header: string, newQuantity: number) => void;
  quantity: number;
}) {
  const fetcher = useFetcher();

  return (
    <div className="flex w-full items-center gap-16">
      <header className="min-w-fit justify-center text-center text-xl">
        <span>{props.name}</span>
      </header>

      <div className="flex w-full justify-between gap-8">
        <span className="text-center">{`${props.price} so'm`}</span>
        <fetcher.Form>
          <div className="flex items-center justify-center gap-16">
            <button
              type="button"
              onClick={() =>
                props.handleQuantityChange(props.name, props.quantity + 1)
              }
              className="text-xl"
            >
              +
            </button>
            <span className="text-xl">{props.quantity}</span>
            <button
              type="button"
              onClick={() =>
                props.handleQuantityChange(props.name, props.quantity - 1)
              }
              className="text-xl"
              disabled={props.quantity === 0}
            >
              -
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
