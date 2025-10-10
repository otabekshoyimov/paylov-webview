import { useFetcher, useLoaderData } from "react-router";
import { BackButton } from "../../shared/components/back-button";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { API_TOKEN, BASE_URL, query } from "../index";

type GasRule = {
  deliveryPrice: number;
  freeDeliveryQuantity: number;
};

type GasItem = {
  id: string;
  name: string;
  price: number;
};

type GasGo = {
  gasRule: GasRule;
  gasTypes: GasItem[];
};

type GasgoResponse = {
  data: {
    gasGo: GasGo;
  };
};

export async function shopPageLoader(): Promise<GasGo> {
  try {
    const res = await fetch(`${BASE_URL}/graphql/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Response("Failed to fetch data", { status: res.status });
    }
    const json: GasgoResponse = await res.json();

    console.log("gasgo", json.data.gasGo);
    return json.data.gasGo;
  } catch (error) {
    console.error("err", error, { cause: error });
    throw new Error("Error");
  }
}
type ShopPageLoaderData = Awaited<ReturnType<typeof shopPageLoader>>;

export function ShopPage() {
  const gasGoAsync = useLoaderData<ShopPageLoaderData>();
  console.log("loaderData", gasGoAsync);

  console.log(
    "ob",
    Object.fromEntries(gasGoAsync.gasTypes.map((item) => [item.name, 0])),
  );
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    Object.fromEntries(gasGoAsync.gasTypes.map((item) => [item.name, 0])),
  );

  console.log("quantit", quantities);

  const [deliveryPrice, setDeliveryPrice] = useState(
    gasGoAsync.gasRule.deliveryPrice / 100,
  );
  console.log("😂", deliveryPrice);

  function getTotalLitr() {
    let total = 0;
    Object.entries(quantities).forEach(([key, val]) => {
      total = total + val;
    });
    return total;
  }
  console.log("tot litr", getTotalLitr());

  useEffect(() => {
    if (getTotalLitr() > 30) {
      setDeliveryPrice(0);
    } else {
      setDeliveryPrice(gasGoAsync.gasRule.deliveryPrice / 100);
    }
  }, [quantities, deliveryPrice]);

  function convertGasgoItemPriceFromTiyinToSums(gasGoAsync: GasGo) {
    return gasGoAsync.gasTypes.map((item) => ({
      ...item,
      price: item.price / 100,
    }));
  }
  console.log("tiyin", convertGasgoItemPriceFromTiyinToSums(gasGoAsync));

  const convertedGasTypes = convertGasgoItemPriceFromTiyinToSums(gasGoAsync);

  function getTotalQuantity(): number {
    let total = 0;
    for (const item of convertedGasTypes) {
      total += quantities[item.name] * item.price;
    }

    return total;
  }

  const handleQuantityChange = (header: string, newQuantity: number): void => {
    setQuantities((prev) => ({
      ...prev,
      [header]: newQuantity,
    }));
  };

  function getFinalTotal(): number {
    const totalGasCost = getTotalQuantity();
    const totalLiters = getTotalLitr();

    if (totalLiters === 0) {
      return 0;
    }
    if (totalLiters < 30) {
      return totalGasCost + deliveryPrice;
    }

    return totalGasCost;
  }

  const fetcher = useFetcher();
  return (
    <section className="flex min-h-[100svh] flex-col p-16 text-white">
      <div className="pb-16">
        <BackButton link={"/location"} />
      </div>
      <header className="flex justify-between px-8 pb-8 text-zinc-200">
        <span>Benzin turi</span>
        <span className="pr-[58px]">Narx</span>
        <span className="pr-24">Litr</span>
      </header>
      <main className="flex flex-col gap-16 px-8">
        {convertedGasTypes.map((item) => (
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
        <fetcher.Form className="flex flex-col justify-between gap-16">
          <div>
            <span> Yetkazib berish 30 litrgacha: {deliveryPrice} so'm</span>
            <input type="hidden" value={deliveryPrice} name="deliveryPrice" />
          </div>
          <div className="flex items-center gap-8">
            <span> Jami: </span>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={getTotalQuantity()}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="block tabular-nums leading-none"
              >
                {`${getFinalTotal()} `}
              </motion.span>
            </AnimatePresence>
            <span>so'm</span>
          </div>
          <button className="rounded-md bg-white px-24 py-10 text-black">
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
                props.handleQuantityChange(props.name, props.quantity - 1)
              }
              className="text-2xl"
              disabled={props.quantity === 0}
            >
              -
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
                props.handleQuantityChange(props.name, props.quantity + 1)
              }
              className="text-2xl"
            >
              +
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
