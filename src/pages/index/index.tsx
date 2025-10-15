import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { data, Form, redirect, useActionData } from "react-router";
import { z } from "zod";

const GasgoOrderSchema = z.object({
  name: z.string().min(4, "Ismingiz bo'lishi shart"),
  phoneNumber: z.string().min(7, "Telefon raqamingiz bo'lishi shart"),
});

export async function indexAction({ request }: { request: Request }) {
  const formData = await request.formData();
  console.log("formdata", Object.fromEntries(formData.entries()));

  const name = String(formData.get("name")).trim();
  const phoneNumber = String(formData.get("phoneNumber"));

  const validatedForm = GasgoOrderSchema.safeParse({
    name: name,
    phoneNumber: phoneNumber,
  });

  if (!validatedForm.success) {
    return data(
      { errors: z.flattenError(validatedForm.error) },
      { status: 400 },
    );
  }

  return redirect(
    `/location?${new URLSearchParams({
      name: validatedForm.data.name,
      phoneNumber: validatedForm.data.phoneNumber,
    })}`,
  );
}

export function IndexPage() {
  const actionData = useActionData();
  const errors = actionData?.errors.fieldErrors;

  function handlePhoneNumber(e: React.FormEvent<HTMLInputElement>): void {
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
        <Form method="POST" className="" id="gasgo-order" viewTransition>
          <div className="flex w-full flex-col justify-center gap-16">
            <label className="flex flex-col gap-8">
              <span className="text-white">Ism</span>

              <input
                type="text"
                placeholder="Ism"
                name="name"
                className="outline-solid rounded-md bg-zinc-300/10 px-24 py-10 text-white ring-brand-green focus:outline-none focus:ring"
              />
              {errors?.name && (
                <ValidationError>
                  <span>{errors.name}</span>
                </ValidationError>
              )}
            </label>

            <label className="flex flex-col gap-8">
              <span className="text-white"> Telefon raqam</span>

              <div className="outline-solid rounded-md bg-zinc-800 pl-16 text-base text-white ring-brand-green focus-within:ring focus-within:ring-brand-green focus:ring">
                <span className="pr-16 text-white">+998</span>
                <input
                  type="tel"
                  placeholder="00 000 00 00"
                  name="phoneNumber"
                  onChange={(e: React.FormEvent<HTMLInputElement>) =>
                    handlePhoneNumber(e)
                  }
                  className="-ml-16 rounded-md bg-transparent bg-zinc-800 px-24 py-10 text-white focus:outline-none"
                />
              </div>
              {errors?.phoneNumber && (
                <ValidationError>
                  <span>{errors.phoneNumber}</span>
                </ValidationError>
              )}
            </label>
          </div>
        </Form>
      </main>
      <footer className="flex w-full flex-col gap-16 pb-16">
        <div className="mx-auto text-center text-xs text-zinc-200">
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
          className="w-full rounded-md bg-white px-16 py-10 text-black"
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
