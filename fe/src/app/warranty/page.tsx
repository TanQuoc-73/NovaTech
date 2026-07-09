import Link from "next/link";

import { getDictionary, resolveLocale, type Locale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";

type WarrantyPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

const pageCopy: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    policiesTitle: string;
    quickHelpTitle: string;
    quickHelpDescription: string;
    continueShopping: string;
    steps: Array<{ title: string; description: string }>;
    policies: string[];
  }
> = {
  vi: {
    title: "Hỗ trợ bảo hành và đổi trả",
    subtitle:
      "Theo dõi quy trình bảo hành, chuẩn bị thông tin sản phẩm và liên hệ NovaTech khi cần hỗ trợ sau mua hàng.",
    policiesTitle: "Chính sách cần biết",
    quickHelpTitle: "Cần hỗ trợ nhanh?",
    quickHelpDescription:
      "Chuẩn bị mã đơn hàng, serial sản phẩm và mô tả lỗi trước khi liên hệ để được xử lý nhanh hơn.",
    continueShopping: "Tiếp tục mua sắm",
    steps: [
      {
        title: "Kiểm tra tình trạng",
        description:
          "NovaTech tiếp nhận thiết bị, kiểm tra serial, hóa đơn và tình trạng ngoại quan.",
      },
      {
        title: "Xác nhận chính sách",
        description:
          "Đội ngũ hỗ trợ đối chiếu thời hạn bảo hành, điều kiện đổi trả và linh kiện kèm theo.",
      },
      {
        title: "Xử lý và cập nhật",
        description:
          "Khách hàng được cập nhật tiến độ sửa chữa, đổi mới hoặc hoàn tất bảo hành.",
      },
    ],
    policies: [
      "Bảo hành theo tiêu chuẩn hãng sản xuất cho laptop, smartphone, tablet và màn hình.",
      "Hỗ trợ 1 đổi 1 trong thời gian quy định nếu sản phẩm lỗi phần cứng từ nhà sản xuất.",
      "Phụ kiện áp dụng chính sách riêng theo từng thương hiệu và tình trạng sản phẩm.",
      "Dữ liệu cá nhân nên được sao lưu trước khi gửi máy bảo hành.",
    ],
  },
  en: {
    title: "Warranty and return support",
    subtitle:
      "Track the warranty process, prepare product information, and contact NovaTech when you need after-sales support.",
    policiesTitle: "Key policies",
    quickHelpTitle: "Need quick support?",
    quickHelpDescription:
      "Prepare your order code, product serial number, and issue description before contacting us for faster handling.",
    continueShopping: "Continue shopping",
    steps: [
      {
        title: "Check condition",
        description:
          "NovaTech receives the device and checks the serial number, invoice, and exterior condition.",
      },
      {
        title: "Confirm policy",
        description:
          "The support team checks the warranty period, return conditions, and included accessories.",
      },
      {
        title: "Process and update",
        description:
          "Customers receive updates on repair progress, replacement, or warranty completion.",
      },
    ],
    policies: [
      "Warranty follows manufacturer standards for laptops, smartphones, tablets, and monitors.",
      "One-for-one replacement support applies within the stated period for manufacturer hardware defects.",
      "Accessories follow separate policies depending on brand and product condition.",
      "Personal data should be backed up before sending a device for warranty service.",
    ],
  },
  zh: {
    title: "保修与退换支持",
    subtitle:
      "跟踪保修流程，准备商品信息，并在需要售后支持时联系 NovaTech。",
    policiesTitle: "重要政策",
    quickHelpTitle: "需要快速支持？",
    quickHelpDescription:
      "联系前请准备订单编号、商品序列号和故障描述，以便更快处理。",
    continueShopping: "继续购物",
    steps: [
      {
        title: "检查状态",
        description: "NovaTech 接收设备并检查序列号、发票和外观状态。",
      },
      {
        title: "确认政策",
        description: "支持团队核对保修期限、退换条件和随附配件。",
      },
      {
        title: "处理并更新",
        description: "客户会收到维修进度、换新或保修完成的更新。",
      },
    ],
    policies: [
      "笔记本、智能手机、平板电脑和显示器按制造商标准保修。",
      "如产品存在制造商硬件缺陷，在规定期限内支持一换一。",
      "配件根据品牌和商品状态适用单独政策。",
      "送修前请先备份个人数据。",
    ],
  },
};

export default async function WarrantyPage({ searchParams }: WarrantyPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);
  const copy = pageCopy[locale];

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950 flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-amber-800">
            {dictionary.nav.warranty}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">
            {copy.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-stone-700">
            {copy.subtitle}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {copy.steps.map((step, index) => (
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
              {copy.policiesTitle}
            </h2>
            <div className="mt-5 grid gap-3">
              {copy.policies.map((policy) => (
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
              {copy.quickHelpTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {copy.quickHelpDescription}
            </p>
            <Link
              href={`/?lang=${locale}#featured-products`}
              className="mt-5 inline-flex h-10 items-center rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              {copy.continueShopping}
            </Link>
          </aside>
        </div>
      </section>
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
