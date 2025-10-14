import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  SelectionIndicator,
  ToggleButton,
  ToggleButtonGroup,
  type Key,
} from "react-aria-components";
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
  const userInputAmount = String(formData.get("userInputAmount"));
  console.log("user input amount 🥶", userInputAmount);

  console.log("❤️", Object.fromEntries(formData.entries()));

  const quantities = String(formData.get("quantities"));
  console.log("quan:", JSON.parse(quantities));
  const url = new URL(request.url);
  const name = String(url.searchParams.get("name"));
  const phoneNumber = String(url.searchParams.get("phoneNumber"));
  const location = String(url.searchParams.get("location"));

  console.log("GASGO ORDER DATA ⛽️:", {
    name: name,
    phoneNumber: phoneNumber?.split(" ").join(""),
    location: location,
    litr: userInputAmount,
  });
  return redirect(
    `/shop?${new URLSearchParams({
      name: name,
      phoneNumber: phoneNumber?.split(" ").join(""),
      location: location,
      litr: userInputAmount,
    })}`,
  );
}

export function ShopPage() {
  const gasGoAsync = useLoaderData<ShopPageLoaderData>();

  const [userInputAmount, setUserInputAmount] = useState<number>(0);

  const [selectedTab, setSelectedTab] = useState<Set<Key>>(
    new Set([gasGoAsync.gasTypes[0]?.name]),
  );

  const selectedName = Array.from(selectedTab)[0];

  const selectedGas = gasGoAsync.gasTypes.find((g) => g.name === selectedName);

  const gasgoDeliveryPrice = gasGoAsync.gasRule.deliveryPrice / 100;

  function convertGasgoItemPriceFromTiyinToSums(gasGoAsync: GasGo) {
    return gasGoAsync.gasTypes.map((item) => ({
      ...item,
      price: item.price / 100,
    }));
  }

  const convertedGasTypes = convertGasgoItemPriceFromTiyinToSums(gasGoAsync);

  function getFinalTotal(): number {
    if (!selectedGas) return 0;

    const pricePerLiter = selectedGas.price / 100;
    const totalLiters = userInputAmount;
    if (!totalLiters) return 0;

    const totalCost = pricePerLiter * totalLiters;
    const deliveryPrice =
      totalLiters < 30 ? gasGoAsync.gasRule.deliveryPrice / 100 : 0;

    return totalCost + deliveryPrice;
  }

  const fetcher = useFetcher();

  return (
    <section className="flex min-h-[100svh] flex-col p-16 text-white">
      <div className="pb-16">
        <BackButton link={"/location"} />
      </div>
      <header className="flex justify-center px-8 pb-8 text-zinc-200">
        <span>Yoqilg'i turi</span>
      </header>
      <main className="flex flex-col items-center justify-between gap-16 px-8">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selectedTab}
          className={
            "outline-solid flex w-fit items-center rounded-2xl bg-white shadow outline-zinc-300/10"
          }
          onSelectionChange={(key) => {
            setSelectedTab(key);
          }}
        >
          {convertedGasTypes.map((gasItem) => (
            <ToggleButton
              key={gasItem.name}
              id={gasItem.name}
              className={({ isSelected }) =>
                `rounded-2xl border-none px-16 py-4 ${isSelected ? "bg-black text-white drop-shadow" : "bg-white text-black"} `
              }
            >
              {gasItem.name}
            </ToggleButton>
          ))}
          <SelectionIndicator />
        </ToggleButtonGroup>
        <div>
          {selectedGas && (
            <span>
              1 litr narxi: {(selectedGas.price / 100).toLocaleString("uz-UZ")}{" "}
              so'm
            </span>
          )}
        </div>

        <div className="mt-[120px] w-full text-center">
          <label className="flex flex-col items-center justify-center gap-8">
            <span>Litrlar sonini kiriting</span>
            <input
              type="number"
              placeholder="0"
              onChange={(e) => setUserInputAmount(Number(e.target.value))}
              className="w-[68px] rounded-md bg-zinc-300/10 px-24 py-10 text-center text-2xl ring-brand-green focus:outline-none"
            />
          </label>
        </div>
      </main>
      <footer className="mt-auto px-8 pb-16">
        <fetcher.Form
          className="flex flex-col justify-between gap-16"
          method="post"
        >
          <div>
            <span>
              {`Yetkazib berish 30 litrgacha:
              ${gasgoDeliveryPrice.toLocaleString("uz-UZ")} so'm`}
            </span>
            <input
              type="hidden"
              value={userInputAmount}
              name="userInputAmount"
            />
          </div>
          <div className="flex items-center gap-8">
            <span> Jami: </span>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
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
