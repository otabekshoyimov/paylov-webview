import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { redirect, useFetcher, useLoaderData } from "react-router";
import { BackButton } from "../../shared/components/back-button";

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

export const BASE_URL = "https://paylov.uz";
export const query = `
  query MyQuery {
    gasGo {
      gasTypes {
        id
        name
        price
      }
      gasRule {
        deliveryPrice
        freeDeliveryQuantity
      }
    }
  }
`;

export const API_TOKEN = "80807e49ac288fea004257f9b16209539a695c49";

export async function shopPageLoader(): Promise<GasGo> {
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
  return json.data.gasGo;
}
type ShopPageLoaderData = Awaited<ReturnType<typeof shopPageLoader>>;

export async function shopPageAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const amount = String(formData.get("amount"));
  console.log("amount:", JSON.parse(amount));

  const url = new URL(request.url);
  const name = String(url.searchParams.get("name"));
  const phoneNumber = String(url.searchParams.get("phoneNumber"));
  const location = String(url.searchParams.get("location"));

  console.log("GASGO ORDER DATA ⛽️:", {
    name: name,
    phoneNumber: phoneNumber?.split(" ").join(""),
    location: location,
    amount: JSON.parse(amount),
  });
  return redirect(
    `/shop?${new URLSearchParams({
      name: name,
      phoneNumber: phoneNumber?.split(" ").join(""),
      location: location,
      amount: amount,
    })}`,
  );
}

export function ShopPage() {
  const gasGoAsync = useLoaderData<ShopPageLoaderData>();

  const [amount, setAmount] = useState<{ [key: string]: number }>(
    Object.fromEntries(gasGoAsync.gasTypes.map((item) => [item.name, 0])),
  );

  const deliveryPrice =
    getTotalLitr() > 30 ? 0 : gasGoAsync.gasRule.deliveryPrice / 100;

  function getTotalLitr(): number {
    let total = 0;
    Object.entries(amount).forEach(([_, val]) => {
      total = total + val;
    });
    return total;
  }

  function convertGasgoItemPriceFromTiyinToSums(gasGoAsync: GasGo) {
    return gasGoAsync.gasTypes.map((item) => ({
      ...item,
      price: item.price / 100,
    }));
  }

  const convertedGasTypes = convertGasgoItemPriceFromTiyinToSums(gasGoAsync);

  function getTotalAmount(): number {
    let total = 0;
    for (const item of convertedGasTypes) {
      total += amount[item.name] * item.price;
    }
    return total;
  }

  const handleAmountChange = (header: string, newAmount: number): void => {
    setAmount((prev) => ({
      ...prev,
      [header]: newAmount,
    }));
  };

  function getFinalTotal(): number {
    const totalGasCost = getTotalAmount();
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
            amount={amount[item.name]}
            handleAmountChange={handleAmountChange}
          />
        ))}
      </main>
      <footer className="mt-auto px-8 pb-16">
        <fetcher.Form
          className="flex flex-col justify-between gap-16"
          method="post"
        >
          <div>
            <span>
              {`Yetkazib berish 30 litrgacha:
              ${deliveryPrice.toLocaleString("uz-UZ")} so'm`}
            </span>
            <input type="hidden" value={deliveryPrice} name="deliveryPrice" />
            <input type="hidden" value={JSON.stringify(amount)} name="amount" />
          </div>
          <div className="flex items-center gap-8">
            <span> Jami: </span>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={getTotalAmount()}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="block tabular-nums leading-none"
              >
                {`${getFinalTotal().toLocaleString("uz-UZ")} `}
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
  handleAmountChange: (header: string, newAmount: number) => void;
  amount: number;
}) {
  const fetcher = useFetcher();

  return (
    <div className="">
      <div className="flex w-full items-center justify-between gap-8">
        <span>{props.name}</span>
        <span className="text-center text-zinc-300">{`${props.price.toLocaleString("uz-UZ")} so'm`}</span>
        <fetcher.Form>
          <div className="flex items-center justify-center gap-16">
            <button
              type="button"
              onClick={() =>
                props.handleAmountChange(props.name, props.amount - 1)
              }
              className="text-2xl"
              disabled={props.amount === 0}
            >
              -
            </button>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={props.amount}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="inline-block w-[2ch] text-center text-lg tabular-nums"
              >
                {props.amount}
              </motion.span>
            </AnimatePresence>

            <button
              type="button"
              onClick={() =>
                props.handleAmountChange(props.name, props.amount + 1)
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
