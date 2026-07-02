import Link from "next/link";

import { getDictionary, resolveLocale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";

type WarrantyPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

const warrantySteps = [
  {
    title: "Kiem tra tinh trang",
    description:
      "NovaTech tiep nhan thiet bi, kiem tra serial, hoa don va tinh trang ngoai quan.",
  },
  {
    title: "Xac nhan chinh sach",
    description:
      "Doi ngu ho tro doi chieu thoi han bao hanh, dieu kien doi tra va linh kien kem theo.",
  },
  {
    title: "Xu ly va cap nhat",
    description:
      "Khach hang duoc cap nhat tien do sua chua, doi moi hoac hoan tat bao hanh.",
  },
] as const;

const policies = [
  "Bao hanh theo tieu chuan hang san xuat cho laptop, smartphone, tablet va man hinh.",
  "Ho tro 1 doi 1 trong thoi gian quy dinh neu san pham loi phan cung tu nha san xuat.",
  "Phu kien ap dung chinh sach rieng theo tung thuong hieu va tinh trang san pham.",
  "Du lieu ca nhan nen duoc sao luu truoc khi gui may bao hanh.",
] as const;

export default async function WarrantyPage({ searchParams }: WarrantyPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950">
      <SiteHeader dictionary={dictionary} locale={locale} />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-amber-800">
            {dictionary.nav.warranty}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">
            Ho tro bao hanh va doi tra
          </h1>
          <p className="mt-4 text-base leading-7 text-stone-700">
            Theo doi quy trinh bao hanh, chuan bi thong tin san pham va lien he
            NovaTech khi can ho tro sau mua hang.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {warrantySteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-5 shadow-sm"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md bg-amber-100 text-sm font-bold text-amber-900">
                {index + 1}
              </span>
              <h2 className="mt-4 text-base font-semibold text-stone-950">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-6">
            <h2 className="text-xl font-semibold text-stone-950">
              Chinh sach can biet
            </h2>
            <div className="mt-5 grid gap-3">
              {policies.map((policy) => (
                <p
                  key={policy}
                  className="rounded-md bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-stone-700"
                >
                  {policy}
                </p>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-amber-900/10 bg-[#fffdf7] p-6">
            <h2 className="text-base font-semibold text-stone-950">
              Can ho tro nhanh?
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Chuan bi ma don hang, serial san pham va mo ta loi truoc khi lien
              he de duoc xu ly nhanh hon.
            </p>
            <Link
              href={`/?lang=${locale}#featured-products`}
              className="mt-5 inline-flex h-10 items-center rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              Tiep tuc mua sam
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
