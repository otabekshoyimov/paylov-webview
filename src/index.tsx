import { data, redirect, useFetcher } from "react-router";
import { z } from "zod";

const GasgoOrderSchema = z.object({
  fullName: z.string().min(1, "To'liq ismingiz bo'lishi shart"),
  phoneNumber: z.coerce.number().min(1, "Telefon raqamingiz bo'lishi shart"),
  privacyPolicy: z.literal("on", {
    error: () => ({
      message: "Maxfiylik siyosatiga rozilik bildirishingiz shart",
    }),
  }),
});

export async function indexAction({ request }: { request: Request }) {
  const formData = await request.formData();

  const rawData = Object.fromEntries(formData.entries());
  console.log("formdata", rawData);

  const validatedForm = GasgoOrderSchema.safeParse({
    fullName: formData.get("fullName"),
    phoneNumber: formData.get("phoneNumber"),
    privacyPolicy: formData.get("privacyPolicy"),
  });

  if (!validatedForm.success) {
    const errors: Record<string, string> = {};
    console.log(validatedForm.error.issues);
    validatedForm.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field && typeof field === "string") {
        errors[field] = issue.message;
      }
    });
    return data({ errors }, { status: 400 });
  }

  localStorage.setItem("orders", JSON.stringify(validatedForm));

  return redirect(`/location`);
}

export function BottoSheet() {
  const saved = JSON.parse(localStorage.getItem("orders") || "{}");
  const fetcher = useFetcher();
  const errors = fetcher.data?.errors;
  return (
    <section className="flex flex-col items-center justify-center gap-8 pt-8">
      <header className="pb-8">
        <img src="/Logo_GASGO.png" alt="" width={48} height={40} />
      </header>
      <main>
        <fetcher.Form method="POST" className="min-w-[320px]">
          <div className="flex w-full flex-col gap-8 pb-8">
            <div>
              <input
                type="text"
                defaultValue={saved.fullName || ""}
                placeholder="To'liq ismingiz"
                name="fullName"
                className="outline-solid min-w-[320px] rounded-md px-8 py-1 shadow outline outline-zinc-300/10"
              />
            </div>
            {errors?.fullName && (
              <div className="text-red-500">{errors.fullName}</div>
            )}

            <div className="text-base">
              <span className="pr-8">+998</span>
              <input
                type="number"
                defaultValue={saved.phoneNumber || ""}
                placeholder="Telefon raqamingiz"
                name="phoneNumber"
                className="outline-solid min-w-[264px] rounded-md px-8 py-1 shadow outline outline-zinc-300/10"
              />
            </div>
            {errors?.phoneNumber && (
              <div className="text-red-500">{errors.phoneNumber}</div>
            )}

            <div className="flex items-center gap-8">
              <input type="checkbox" name="privacyPolicy" />
              <label htmlFor="">Maxfiylik siyosati</label>
            </div>
            {errors?.privacyPolicy && (
              <div className="flex-wrap text-red-500">
                {errors.privacyPolicy}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-brand-green px-16 py-4 text-white shadow"
          >
            Buyurtmani boshlash
          </button>
        </fetcher.Form>
      </main>
    </section>
  );
}
