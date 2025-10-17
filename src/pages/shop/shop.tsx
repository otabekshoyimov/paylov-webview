import { CircleDashed, Truck } from "lucide-react";
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
  const userOrderLitrAmount = String(formData.get("userOrderLitrAmount"));
  console.log("user input amount 🥶", userOrderLitrAmount);

  console.log("❤️", Object.fromEntries(formData.entries()));

  const url = new URL(request.url);
  const name = String(url.searchParams.get("name"));
  const phoneNumber = String(url.searchParams.get("phoneNumber"));
  const location = String(url.searchParams.get("location"));

  console.log("GASGO ORDER DATA ⛽️:", {
    name: name,
    phoneNumber: phoneNumber?.split(" ").join(""),
    location: location,
    amount: userOrderLitrAmount,
  });
  return redirect(
    `/shop?${new URLSearchParams({
      name: name,
      phoneNumber: phoneNumber?.split(" ").join(""),
      location: location,
      amount: userOrderLitrAmount,
    })}`,
  );
}

export function ShopPage() {
  const gasGoAsync = useLoaderData<ShopPageLoaderData>();
  const fetcher = useFetcher();

  const [selectedTab, setSelectedTab] = useState<Set<Key>>(
    new Set([gasGoAsync.gasTypes[0]?.name]),
  );
  console.log("selectedTab", selectedTab);

  const [tabMoneyInputs, setTabMoneyInputs] = useState<{
    [key: string]: number;
  }>({});
  console.log("tab inputs", tabMoneyInputs);

  const convertedGasTypes = convertGasgoItemPriceFromTiyinToSums(gasGoAsync);
  console.log("conv gas types", convertedGasTypes);
  const totalLitr = getTotalLitr({ convertedGasTypes, tabMoneyInputs });
  console.log("total litr", totalLitr);

  const selectedGasName = String(Array.from(selectedTab)[0]);
  console.log("selected gas name", selectedGasName);

  const selectedGasType = gasGoAsync.gasTypes.find(
    (g) => g.name === selectedGasName,
  );
  console.log("selected gas type", selectedGasType);

  const deliveryPrice =
    totalLitr < 30 ? gasGoAsync.gasRule.deliveryPrice / 100 : 0;

  console.log("deliveryPrice 💵", deliveryPrice);

  const totalSums = getTotalSums({ tabMoneyInputs, gasGoAsync, totalLitr });

  const litersPerTab = convertedGasTypes.map((gasType) => {
    const enteredSum = tabMoneyInputs[gasType.name] ?? 0;
    const pricePerLitr = gasType.price;
    const liters = enteredSum / pricePerLitr;

    return {
      name: gasType.name,
      price: pricePerLitr,
      enteredSum,
      liters,
    };
  });

  console.log("liters per tab", litersPerTab);

  const colorMap: Record<string, string> = {
    "AI 92": "bg-green-600",
    "AI 95": "bg-red-600",
  };

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
              className={({ isSelected }) => {
                const selectedColor = colorMap[gasItem.name];
                return `rounded-2xl border-none px-16 py-4 text-2xl ${isSelected ? `${selectedColor} outline-solid text-white outline outline-1 outline-white drop-shadow` : "bg-white text-black"}`;
              }}
            >
              <SelectionIndicator />
              {gasItem.name}
            </ToggleButton>
          ))}
          <SelectionIndicator />
        </ToggleButtonGroup>
        <div>
          {selectedGasType && (
            <span>
              1 litr narxi:{" "}
              {(selectedGasType.price / 100).toLocaleString("uz-UZ")} so'm
            </span>
          )}
        </div>

        <div className="mt-[120px] w-full text-center">
          <label className="flex max-w-full flex-col items-center gap-16">
            <span>So'mni kiriting</span>
            {selectedGasName && (
              <input
                key={selectedGasName}
                type="text"
                inputMode="numeric"
                placeholder="0 so'm"
                value={tabMoneyInputs[selectedGasName] ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setTabMoneyInputs((prev) => ({
                    ...prev,
                    [selectedGasName]: Number(value),
                  }));
                }}
                className="w-[180px] rounded-md bg-zinc-300/10 px-24 py-10 text-center text-2xl ring-brand-green focus:outline-none"
              />
            )}
          </label>
        </div>
      </main>
      <footer className="mt-auto px-8 pb-16">
        <fetcher.Form
          className="flex flex-col justify-between gap-16"
          method="post"
        >
          <div>
            <div className="flex gap-8 pb-16">
              <span className="pr-4">
                <Truck className="text-gray-500" />
              </span>

              {deliveryPrice === 0 ? (
                <span className="text-zinc-600/10">
                  Yetkazib berish:{" "}
                  <span className="text-white">{deliveryPrice} so'm</span>
                </span>
              ) : (
                <span className="text-gray-400">
                  Yetkazib berish 30 L gacha: {""}
                  <span className="text-white">
                    {" "}
                    {deliveryPrice.toLocaleString("uz-UZ")} so'm
                  </span>
                </span>
              )}
            </div>
            <div className="flex flex-col gap-8 pb-16">
              {litersPerTab.map((item) => (
                <div key={item.name} className="flex gap-8">
                  <span className="pr-4">
                    {item.name === "AI 92" ? (
                      <CircleDashed className="text-green-400" />
                    ) : (
                      <CircleDashed className="text-red-400" />
                    )}
                  </span>
                  <span>{item?.name}</span>
                  <span>{item?.price?.toLocaleString("uz-UZ")}</span>
                  <span>*</span>
                  <span>{item?.liters.toFixed(2)} L</span>
                </div>
              ))}
            </div>
            <input type="hidden" value={totalLitr} name="userOrderLitrAmount" />
          </div>
          <div className="flex items-center gap-8">
            <span className="text-gray-400"> Jami: </span>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="block tabular-nums leading-none"
              >
                {`${totalSums.toLocaleString("uz-UZ")} `}
              </motion.span>
            </AnimatePresence>
            <span>so'm</span>
          </div>
          <button className="rounded-3xl bg-white px-24 py-10 text-black">
            {`${totalSums.toLocaleString("uz-UZ")} so'm to'lash`}
          </button>
        </fetcher.Form>
      </footer>
    </section>
  );
}

function getTotalLitr({
  tabMoneyInputs,
  convertedGasTypes,
}: {
  tabMoneyInputs: Record<string, number>;
  convertedGasTypes: {
    price: number;
    id: string;
    name: string;
  }[];
}): number {
  let totalLitr = 0;
  for (const [gasName, enteredSum] of Object.entries(tabMoneyInputs)) {
    const gasType = convertedGasTypes.find((g) => g.name === gasName);
    if (!gasType) {
      throw new Error(`Gas type not found for name: ${gasName}`);
    }
    const pricePerLitr = gasType.price;
    console.log("total litr fn", gasName, enteredSum);
    totalLitr = totalLitr + enteredSum / pricePerLitr;
  }
  return totalLitr;
}

function convertGasgoItemPriceFromTiyinToSums(gasGoAsync: GasGo): {
  price: number;
  id: string;
  name: string;
}[] {
  return gasGoAsync.gasTypes.map((item) => ({
    ...item,
    price: item.price / 100,
  }));
}

function getTotalSums({
  tabMoneyInputs,
  gasGoAsync,
  totalLitr,
}: {
  tabMoneyInputs: Record<string, number>;
  gasGoAsync: GasGo;
  totalLitr: number;
}): number {
  let totalSum = 0;
  for (const [_, enteredSum] of Object.entries(tabMoneyInputs)) {
    totalSum = totalSum + enteredSum;
  }
  const hasEnteredAnyValue = totalSum > 0;

  const gasgoDeliveryPrice =
    hasEnteredAnyValue && totalLitr < 30
      ? gasGoAsync.gasRule.deliveryPrice / 100
      : 0;

  return totalSum + gasgoDeliveryPrice;
}
