import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { data, Form, redirect, useActionData } from "react-router";
import { z } from "zod";

const GasgoOrderSchema = z.object({
  fullName: z.string().min(8, "To'liq ismingiz bo'lishi shart"),
  phoneNumber: z.string().min(7, "Telefon raqamingiz bo'lishi shart"),
});

export async function indexAction({ request }: { request: Request }) {
  const formData = await request.formData();

  const rawData = Object.fromEntries(formData.entries());
  console.log("formdata", rawData);

  const validatedForm = GasgoOrderSchema.safeParse({
    fullName: formData.get("fullName"),
    phoneNumber: formData.get("phoneNumber"),
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
  return redirect(`/location`);
}

export function IndexPage() {
  const actionData = useActionData();
  const errors = actionData?.errors;

  function handlePhoneNumber(e: React.FormEvent<HTMLInputElement>) {
    let raw = e.currentTarget.value;

    let digits = "";
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch >= "0" && ch <= "9") {
        digits += ch;
      }
    }
    let formatted = "";
    if (digits.length > 0) formatted += digits.substring(0, 2);
    if (digits.length > 2) formatted += " " + digits.substring(2, 5);
    if (digits.length > 5) formatted += " " + digits.substring(5, 7);
    if (digits.length > 7) formatted += " " + digits.substring(7, 9);

    e.currentTarget.value = formatted.trim();
  }
  return (
    <section className="flex min-h-[100dvh] flex-col items-center justify-between gap-16 p-16">
      <header className="pb-16 pt-[36px]">
        <img src="/Logo_GASGO.png" alt="" width={80} height={80} />
      </header>
      <main className="flex items-center justify-center">
        <Form
          method="POST"
          className="min-w-[320px]"
          id="gasgo-order"
          viewTransition
        >
          <div className="flex w-full flex-col justify-center gap-16 pb-16">
            <div>
              <input
                type="text"
                placeholder="Ism Familya"
                name="fullName"
                className="outline-solid min-w-[350px] rounded-md bg-zinc-300/10 px-24 py-10 text-white ring-brand-green focus:outline-none focus:ring"
              />
            </div>
            {errors?.fullName && (
              <ValidationError>
                <span>{errors.fullName}</span>
              </ValidationError>
            )}

            <div className="outline-solid min-w-[264px] rounded-md bg-zinc-800 pl-16 text-base text-white ring-brand-green focus-within:ring focus-within:ring-brand-green focus:ring">
              <span className="pr-16 text-white">+998</span>
              <input
                type="tel"
                placeholder="Telefon raqam"
                name="phoneNumber"
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  handlePhoneNumber(e)
                }
                className="-ml-16 min-w-[264px] rounded-md bg-transparent bg-zinc-800 px-24 py-10 text-white focus:outline-none"
              />
            </div>
            {errors?.phoneNumber && (
              <ValidationError>
                <span>{errors.phoneNumber}</span>
              </ValidationError>
            )}
          </div>
        </Form>
      </main>
      <footer className="flex w-full flex-col gap-16 pb-16">
        <div className="mx-auto max-w-[260px] text-center text-xs text-zinc-200">
          Davom etish orqali siz{" "}
          <span className="font-medium text-white">
            Foydalanish shartlariga{" "}
          </span>{" "}
          rozilik bildirasiz
        </div>
        <button
          type="submit"
          form="gasgo-order"
          tabIndex={0}
          className="w-full rounded-md bg-brand-green/10 px-16 py-10 text-white outline outline-[0.9px] outline-brand-green drop-shadow-md"
        >
          Buyurtmani boshlash
        </button>
      </footer>
    </section>
  );
}

function ValidationError(props: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center gap-8 text-red-500">
      <span>
        <CircleAlert size={16} />
      </span>
      {props.children}
    </div>
  );
}
