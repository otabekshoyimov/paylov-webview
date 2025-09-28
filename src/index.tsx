import { redirect, useFetcher } from "react-router";

export async function indexAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const fullName = formData.get("fullName");
  const phoneNumber = formData.get("phoneNumber");
  const privacyPolicy = formData.get("privacyPolicy");

  console.log("formdata", fullName, phoneNumber, privacyPolicy);

  localStorage.setItem(
    "orders",
    JSON.stringify({ fullName, phoneNumber, privacyPolicy }),
  );

  return redirect(`/location`);
}

export function BottoSheet() {
  const fetcher = useFetcher();
  return (
    <section className="flex flex-col items-center justify-center gap-8 pt-8">
      <header className="pb-8">
        <img src="/Logo_GASGO.png" alt="" width={48} height={40} />
      </header>
      <main>
        <fetcher.Form method="POST">
          <div className="flex flex-col gap-8 pb-8">
            <input
              type="text"
              placeholder="To'liq ismingiz"
              name="fullName"
              className="outline-solid rounded-md px-8 py-1 shadow outline outline-zinc-300/10"
            />

            <div className="text-base">
              <span className="outline-solid rounded-md px-8 py-1 shadow outline outline-zinc-300/10">
                +998
              </span>
              <input
                type="number"
                placeholder="Telefon raqamingiz"
                name="phoneNumber"
                className="outline-solid rounded-md px-8 py-1 shadow outline outline-zinc-300/10"
              />
            </div>

            <div className="flex items-center gap-8">
              <input type="checkbox" name="privacyPolicy" />
              <label htmlFor="">Maxfiylik siyosati</label>
            </div>
          </div>
          <button
            type="submit"
            className="bg-brand-green rounded-2xl px-16 py-4 text-white"
          >
            Buyurtmani boshlash
          </button>
        </fetcher.Form>
      </main>
    </section>
  );
}
