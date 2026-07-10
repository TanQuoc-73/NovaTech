"use client";

import { useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  Clock,
  Contact,
  FileText,
  HeadphonesIcon,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Shield,
  Truck,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/shared/i18n";
import type { Dictionary } from "@/shared/i18n";

type WarrantyCopy = {
  title: string;
  subtitle: string;
  stepsTitle: string;
  policiesTitle: string;
  quickHelpTitle: string;
  quickHelpDescription: string;
  continueShopping: string;
  lookupTitle: string;
  lookupPlaceholder: string;
  lookupButton: string;
  lookupResult: string;
  lookupError: string;
  faqTitle: string;
  contactTitle: string;
  contactDescription: string;
  chatNow: string;
  callNow: string;
  emailUs: string;
  responseTime: string;
  steps: Array<{ title: string; description: string }>;
  policies: Array<{ icon: string; text: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

const pageCopy: Record<Locale, WarrantyCopy> = {
  vi: {
    title: "Hỗ trợ bảo hành và đổi trả",
    subtitle:
      "Theo dõi quy trình bảo hành, kiểm tra tình trạng sản phẩm và liên hệ NovaTech khi cần hỗ trợ sau mua hàng.",
    stepsTitle: "Quy trình bảo hành",
    policiesTitle: "Chính sách cần biết",
    quickHelpTitle: "Cần hỗ trợ nhanh?",
    quickHelpDescription:
      "Chuẩn bị mã đơn hàng, serial sản phẩm và mô tả lỗi trước khi liên hệ để được xử lý nhanh hơn.",
    continueShopping: "Tiếp tục mua sắm",
    lookupTitle: "Kiểm tra bảo hành",
    lookupPlaceholder: "Nhập mã đơn hàng hoặc serial",
    lookupButton: "Tra cứu",
    lookupResult: "Sản phẩm của bạn còn thời hạn bảo hành.",
    lookupError: "Không tìm thấy thông tin. Vui lòng kiểm tra lại mã.",
    faqTitle: "Câu hỏi thường gặp",
    contactTitle: "Liên hệ hỗ trợ",
    contactDescription: "Đội ngũ NovaTech sẵn sàng hỗ trợ bạn qua các kênh sau:",
    chatNow: "Chat ngay",
    callNow: "Gọi ngay",
    emailUs: "Gửi email",
    responseTime: "Thời gian phản hồi: trong vòng 24h",
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
      { icon: "laptop", text: "Bảo hành theo tiêu chuẩn hãng cho laptop, smartphone, tablet và màn hình." },
      { icon: "refresh", text: "Hỗ trợ 1 đổi 1 trong thời gian quy định nếu lỗi phần cứng từ nhà sản xuất." },
      { icon: "accessory", text: "Phụ kiện áp dụng chính sách riêng theo từng thương hiệu và tình trạng." },
      { icon: "backup", text: "Dữ liệu cá nhân nên được sao lưu trước khi gửi máy bảo hành." },
    ],
    faqs: [
      {
        question: "Thời gian bảo hành là bao lâu?",
        answer: "Thời gian bảo hành tiêu chuẩn là 12 tháng đối với laptop và smartphone, 24 tháng đối với màn hình và linh kiện PC. Một số sản phẩm có thể có thời gian bảo hành dài hơn tùy theo chính sách của hãng.",
      },
      {
        question: "Làm thế nào để gửi máy bảo hành?",
        answer: "Bạn có thể mang trực tiếp đến cửa hàng NovaTech gần nhất hoặc gửi qua đường chuyển phát. Vui lòng đóng gói cẩn thận, kèm theo hóa đơn mua hàng và phiếu bảo hành.",
      },
      {
        question: "Có được đổi trả sản phẩm không?",
        answer: "Sản phẩm mới mua trong vòng 7 ngày có thể đổi trả nếu còn nguyên vẹn, đầy đủ phụ kiện và không có dấu hiệu sử dụng. Sản phẩm lỗi phần cứng được hỗ trợ 1 đổi 1 trong thời gian bảo hành.",
      },
      {
        question: "Mất hóa đơn thì có được bảo hành không?",
        answer: "Chúng tôi khuyến khích giữ hóa đơn để được hỗ trợ nhanh nhất. Trong trường hợp mất hóa đơn, NovaTech có thể tra cứu thông tin đơn hàng qua email hoặc số điện thoại đã đăng ký.",
      },
      {
        question: "Bảo hành có bao gồm dữ liệu trong máy không?",
        answer: "Bảo hành không bao gồm bảo vệ dữ liệu. Chúng tôi khuyến cáo bạn sao lưu toàn bộ dữ liệu quan trọng trước khi gửi thiết bị đi bảo hành. NovaTech không chịu trách nhiệm về mất mát dữ liệu.",
      },
    ],
  },
  en: {
    title: "Warranty and return support",
    subtitle:
      "Track the warranty process, check product status, and contact NovaTech when you need after-sales support.",
    stepsTitle: "Warranty Process",
    policiesTitle: "Key Policies",
    quickHelpTitle: "Need quick support?",
    quickHelpDescription:
      "Prepare your order code, product serial number, and issue description before contacting us for faster handling.",
    continueShopping: "Continue shopping",
    lookupTitle: "Check Warranty",
    lookupPlaceholder: "Enter order number or serial",
    lookupButton: "Search",
    lookupResult: "Your product is still under warranty.",
    lookupError: "No information found. Please check your code.",
    faqTitle: "Frequently Asked Questions",
    contactTitle: "Contact Support",
    contactDescription: "Our team is ready to assist you through the following channels:",
    chatNow: "Chat now",
    callNow: "Call now",
    emailUs: "Send email",
    responseTime: "Response time: within 24h",
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
      { icon: "laptop", text: "Warranty follows manufacturer standards for laptops, smartphones, tablets, and monitors." },
      { icon: "refresh", text: "One-for-one replacement within the stated period for manufacturer hardware defects." },
      { icon: "accessory", text: "Accessories follow separate policies depending on brand and product condition." },
      { icon: "backup", text: "Personal data should be backed up before sending a device for warranty service." },
    ],
    faqs: [
      {
        question: "How long is the warranty period?",
        answer: "Standard warranty is 12 months for laptops and smartphones, 24 months for monitors and PC components. Some products may have extended warranty depending on manufacturer policy.",
      },
      {
        question: "How do I send my device for warranty?",
        answer: "You can bring it to your nearest NovaTech store or ship it via courier. Please pack carefully and include the purchase invoice and warranty card.",
      },
      {
        question: "Can I return or exchange products?",
        answer: "New products purchased within 7 days can be returned if unused, with all accessories intact. Hardware-defective products are eligible for 1-for-1 replacement during warranty.",
      },
      {
        question: "Is warranty still valid without an invoice?",
        answer: "We recommend keeping your invoice for fastest support. If lost, NovaTech can look up your order via registered email or phone number.",
      },
      {
        question: "Does warranty cover data recovery?",
        answer: "Warranty does not cover data protection. We strongly recommend backing up all important data before sending your device for service. NovaTech is not responsible for data loss.",
      },
    ],
  },
  zh: {
    title: "保修与退换支持",
    subtitle: "跟踪保修流程，检查产品状态，并在需要售后支持时联系 NovaTech。",
    stepsTitle: "保修流程",
    policiesTitle: "重要政策",
    quickHelpTitle: "需要快速支持？",
    quickHelpDescription: "联系前请准备订单编号、商品序列号和故障描述，以便更快处理。",
    continueShopping: "继续购物",
    lookupTitle: "查询保修",
    lookupPlaceholder: "输入订单号或序列号",
    lookupButton: "查询",
    lookupResult: "您的产品仍在保修期内。",
    lookupError: "未找到相关信息，请检查输入。",
    faqTitle: "常见问题",
    contactTitle: "联系支持",
    contactDescription: "我们的团队随时通过以下渠道为您提供帮助：",
    chatNow: "在线聊天",
    callNow: "立即致电",
    emailUs: "发送邮件",
    responseTime: "响应时间：24小时内",
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
      { icon: "laptop", text: "笔记本、智能手机、平板和显示器按制造商标准保修。" },
      { icon: "refresh", text: "制造商硬件缺陷在规定期限内支持一换一。" },
      { icon: "accessory", text: "配件根据品牌和商品状态适用单独政策。" },
      { icon: "backup", text: "送修前请先备份个人数据。" },
    ],
    faqs: [
      {
        question: "保修期是多久？",
        answer: "笔记本电脑和智能手机标准保修期为12个月，显示器和PC组件为24个月。部分产品可能根据制造商政策享有更长保修期。",
      },
      {
        question: "如何送修设备？",
        answer: "您可以将设备送到最近的 NovaTech 门店，或通过快递寄送。请仔细包装并附上购买发票和保修卡。",
      },
      {
        question: "可以退换货吗？",
        answer: "购买后7天内未使用且配件齐全的新品可以退换。硬件缺陷产品在保修期内支持一换一。",
      },
      {
        question: "没有发票还能保修吗？",
        answer: "我们建议保留发票以获得最快支持。如丢失，NovaTech 可通过注册邮箱或电话号码查询订单信息。",
      },
      {
        question: "保修包含数据恢复吗？",
        answer: "保修不包括数据保护。我们强烈建议在送修前备份所有重要数据。NovaTech 不对数据丢失负责。",
      },
    ],
  },
};

function PolicyIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "laptop":
      return <Shield className="h-5 w-5" />;
    case "refresh":
      return <RefreshCw className="h-5 w-5" />;
    case "accessory":
      return <Wrench className="h-5 w-5" />;
    case "backup":
      return <FileText className="h-5 w-5" />;
    default:
      return <CheckCircle className="h-5 w-5" />;
  }
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <ChevronDown
      className={`h-4 w-4 text-[var(--muted)] transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    />
  );
}

export function WarrantyContent({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const copy = pageCopy[locale];
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<"idle" | "found" | "not-found">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleLookup(event: React.FormEvent) {
    event.preventDefault();
    if (lookupQuery.trim().length < 3) return;
    setLookupResult(Math.random() > 0.3 ? "found" : "not-found");
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          {copy.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {copy.subtitle}
        </p>
      </div>

      {/* Step process */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          {copy.stepsTitle}
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {copy.steps.map((step, index) => (
            <article
              key={step.title}
              className="group relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--badge-bg)] text-[var(--badge-text)] transition-transform duration-300 group-hover:scale-110">
                  {index === 0 ? (
                    <Search className="h-5 w-5" />
                  ) : index === 1 ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  Bước {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* Main grid: Policies + Sidebar */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-8">
          {/* Policies */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {copy.policiesTitle}
            </h2>
            <div className="mt-5 grid gap-3">
              {copy.policies.map((policy) => (
                <div
                  key={policy.text}
                  className="flex items-start gap-3 rounded-lg bg-[var(--badge-bg)] px-4 py-3"
                >
                  <span className="mt-0.5 shrink-0 text-[var(--primary)]">
                    <PolicyIcon icon={policy.icon} />
                  </span>
                  <p className="text-sm font-semibold leading-6 text-[var(--foreground)]">
                    {policy.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Warranty Lookup */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--foreground)]">
              <Search className="h-5 w-5 text-[var(--primary)]" />
              {copy.lookupTitle}
            </h2>
            <form onSubmit={handleLookup} className="mt-4">
              <div className="flex gap-2">
                <input
                  value={lookupQuery}
                  onChange={(e) => {
                    setLookupQuery(e.target.value);
                    setLookupResult("idle");
                  }}
                  placeholder={copy.lookupPlaceholder}
                  className="h-11 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/20"
                />
                <button
                  type="submit"
                  disabled={lookupQuery.trim().length < 3}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                  {copy.lookupButton}
                </button>
              </div>
            </form>
            {lookupResult === "found" ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {copy.lookupResult}
              </div>
            ) : lookupResult === "not-found" ? (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {copy.lookupError}
              </div>
            ) : null}
          </section>

          {/* FAQ */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--foreground)]">
              <MessageCircle className="h-5 w-5 text-[var(--primary)]" />
              {copy.faqTitle}
            </h2>
            <div className="mt-5 space-y-2">
              {copy.faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border border-[var(--border)]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-3 bg-[var(--surface)] px-4 py-3.5 text-left text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--badge-bg)]"
                    >
                      <span className="pr-2">{faq.question}</span>
                      <ChevronDownIcon open={isOpen} />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="border-t border-[var(--border)] bg-[var(--badge-bg)] px-4 py-3.5 text-sm leading-6 text-[var(--muted)]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
              <HeadphonesIcon className="h-4 w-4 text-[var(--primary)]" />
              {copy.quickHelpTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {copy.quickHelpDescription}
            </p>
            <Link
              href={`/?lang=${locale}`}
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {copy.continueShopping}
            </Link>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
              <Contact className="h-4 w-4 text-[var(--primary)]" />
              {copy.contactTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {copy.contactDescription}
            </p>
            <div className="mt-5 space-y-3">
              <a
                href="tel:0961315200"
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--badge-bg)]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-green-100 text-green-700">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm">0961 315 200</p>
                  <p className="text-xs font-medium text-[var(--muted)]">{copy.callNow}</p>
                </div>
              </a>
              <a
                href="mailto:support@novatech.com"
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--badge-bg)]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-blue-700">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm">support@novatech.com</p>
                  <p className="text-xs font-medium text-[var(--muted)]">{copy.emailUs}</p>
                </div>
              </a>
              <Link
                href={`/?lang=${locale}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--badge-bg)]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-100 text-cyan-700">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm">NovaTech Chat</p>
                  <p className="text-xs font-medium text-[var(--muted)]">{copy.chatNow}</p>
                </div>
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--badge-bg)] px-4 py-3 text-xs font-semibold text-[var(--badge-text)]">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {copy.responseTime}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
              <Truck className="mx-auto h-5 w-5 text-[var(--primary)]" />
              <p className="mt-2 text-lg font-bold text-[var(--foreground)]">7</p>
              <p className="text-xs font-medium text-[var(--muted)]">
                {locale === "vi" ? "Ngày đổi trả" : locale === "zh" ? "天退换" : "Days return"}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
              <Clock className="mx-auto h-5 w-5 text-[var(--primary)]" />
              <p className="mt-2 text-lg font-bold text-[var(--foreground)]">24</p>
              <p className="text-xs font-medium text-[var(--muted)]">
                {locale === "vi" ? "Tháng BH" : locale === "zh" ? "月保修" : "Months warranty"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
