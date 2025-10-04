import { useFetcher } from "react-router";
import { BackButton } from "../../shared/components/back-button";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
    <section className="flex min-h-[100dvh] flex-col p-16 text-white">
      <div className="pb-16">
        <BackButton link={"/location"} />
      </div>
      <header className="flex justify-between px-8 pb-8 text-zinc-200">
        <span>Benzin turi</span>
        <span className="pr-[58px]">Narx</span>
        <span className="pr-24">Litr</span>
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
      <footer className="mt-auto px-8 pb-16">
        <fetcher.Form className="flex items-center justify-between">
          <span className="flex items-baseline gap-8">
            So'm:
            <span className="inline-block w-[8ch] overflow-hidden text-right">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={getTotalQuantity()}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="block w-[2ch] tabular-nums leading-none"
                >
                  {getTotalQuantity()}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
          <button className="rounded-md bg-brand-green/10 px-24 py-10 text-white shadow outline outline-[0.9px] outline-brand-green drop-shadow-md">
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
    <div className="">
      <div className="flex w-full items-center justify-between gap-8">
        <span>{props.name}</span>
        <span className="text-center text-zinc-300">{`${props.price} so'm`}</span>
        <fetcher.Form>
          <div className="flex items-center justify-center gap-16">
            <button
              type="button"
              onClick={() =>
                props.handleQuantityChange(props.name, props.quantity + 1)
              }
              className="text-2xl"
            >
              +
            </button>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={props.quantity}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="inline-block w-[2ch] text-center text-lg tabular-nums"
              >
                {props.quantity}
              </motion.span>
            </AnimatePresence>

            <button
              type="button"
              onClick={() =>
                props.handleQuantityChange(props.name, props.quantity - 1)
              }
              className="text-2xl"
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
