import type { Locale } from "./config";

export const dictionaries = {
  vi: {
    common: {
      all: "Tat ca",
      inStock: "con hang",
      rating: "sao",
    },
    nav: {
      categories: "Danh muc",
      products: "San pham",
      warranty: "Bao hanh",
      signIn: "Dang nhap",
      cart: "Gio hang",
    },
    home: {
      eyebrow: "Autumn Tech Edit",
      title: "Nang cap goc lam viec va giai tri voi thiet bi cong nghe chon loc",
      subtitle:
        "Laptop, smartphone, man hinh va phu kien tu cac thuong hieu uy tin, duoc sap xep de nguoi mua tim nhanh theo nhu cau that.",
      primaryCta: "Xem san pham",
      secondaryCta: "Danh muc noi bat",
      dealLabel: "Deal trong ngay",
      dealTitle: "Laptop Creator Pro 14",
      dealDescription:
        "Intel Core Ultra, man hinh OLED 120Hz, RAM 32GB va bao hanh 24 thang cho khach hang doanh nghiep.",
      stats: {
        products: "San pham",
        brands: "Thuong hieu",
        support: "Ho tro",
      },
      featuredLabel: "Lua chon noi bat",
      featuredTitle: "San pham ban chay",
      viewAll: "Xem tat ca",
    },
    hero: {
      goToSlide: "Chuyen den banner",
      stats: {
        products: { label: "San pham", value: "240+" },
        brands: { label: "Thuong hieu", value: "32" },
        support: { label: "Ho tro", value: "24/7" },
      },
      slides: [
        {
          label: "Deal trong ngay",
          tag: "Hot autumn",
          title: "Laptop Creator Pro 14",
          description:
            "Man hinh OLED 120Hz, RAM 32GB va bao hanh 24 thang cho khach hang doanh nghiep.",
          deviceType: "Laptop",
          price: "Tu 31.990.000d",
          highlightLabel: "Qua tang",
          highlight: "Tang balo va goi cai dat",
          gradient: "from-[#3b2418] via-[#7c2d12] to-[#b45309]",
        },
        {
          label: "Bo suu tap moi",
          tag: "Smart life",
          title: "Smartphone flagship cho mua le hoi",
          description:
            "Hieu nang manh, camera dem tot va sac nhanh cho lich trinh di chuyen lien tuc.",
          deviceType: "Smartphone",
          price: "Tu 18.990.000d",
          highlightLabel: "Uu dai",
          highlight: "Tra gop 0% den 12 thang",
          gradient: "from-[#2f1d14] via-[#92400e] to-[#dc2626]",
        },
        {
          label: "Setup workdesk",
          tag: "Creator desk",
          title: "Man hinh 4K va phu kien cho ban lam viec am ap",
          description:
            "Goi san pham toi uu cho designer, developer va van phong hien dai.",
          deviceType: "Monitor",
          price: "Tu 11.990.000d",
          highlightLabel: "Combo",
          highlight: "Giam den 20% khi mua kem phu kien",
          gradient: "from-[#1c1917] via-[#78350f] to-[#a16207]",
        },
      ],
    },
    categories: {
      laptop: "Laptop",
      pc: "PC",
      smartphone: "Smartphone",
      monitor: "Man hinh",
      accessory: "Phu kien",
      tablet: "Tablet",
      audio: "Am thanh",
    },
    badges: {
      new: "Moi",
      installment: "Tra gop 0%",
      bestseller: "Ban chay",
      office: "Van phong",
      accessory: "Phu kien",
    },
  },
  en: {
    common: {
      all: "All",
      inStock: "in stock",
      rating: "stars",
    },
    nav: {
      categories: "Categories",
      products: "Products",
      warranty: "Warranty",
      signIn: "Sign in",
      cart: "Cart",
    },
    home: {
      eyebrow: "Autumn Tech Edit",
      title: "Upgrade your work and entertainment setup with curated tech",
      subtitle:
        "Laptops, smartphones, monitors, and accessories from trusted brands, organized so shoppers can find what fits their real needs.",
      primaryCta: "Shop products",
      secondaryCta: "Featured categories",
      dealLabel: "Deal of the day",
      dealTitle: "Laptop Creator Pro 14",
      dealDescription:
        "Intel Core Ultra, 120Hz OLED display, 32GB RAM, and 24-month warranty for business customers.",
      stats: {
        products: "Products",
        brands: "Brands",
        support: "Support",
      },
      featuredLabel: "Featured picks",
      featuredTitle: "Best sellers",
      viewAll: "View all",
    },
    hero: {
      goToSlide: "Go to banner",
      stats: {
        products: { label: "Products", value: "240+" },
        brands: { label: "Brands", value: "32" },
        support: { label: "Support", value: "24/7" },
      },
      slides: [
        {
          label: "Deal of the day",
          tag: "Hot autumn",
          title: "Laptop Creator Pro 14",
          description:
            "120Hz OLED display, 32GB RAM, and a 24-month warranty for business customers.",
          deviceType: "Laptop",
          price: "From 31,990,000 VND",
          highlightLabel: "Gift",
          highlight: "Backpack and setup package included",
          gradient: "from-[#3b2418] via-[#7c2d12] to-[#b45309]",
        },
        {
          label: "New collection",
          tag: "Smart life",
          title: "Flagship smartphones for the festive season",
          description:
            "Strong performance, better night photos, and fast charging for busy days.",
          deviceType: "Smartphone",
          price: "From 18,990,000 VND",
          highlightLabel: "Offer",
          highlight: "0% installment up to 12 months",
          gradient: "from-[#2f1d14] via-[#92400e] to-[#dc2626]",
        },
        {
          label: "Workdesk setup",
          tag: "Creator desk",
          title: "4K monitors and accessories for a warmer desk",
          description:
            "A curated setup for designers, developers, and modern office teams.",
          deviceType: "Monitor",
          price: "From 11,990,000 VND",
          highlightLabel: "Bundle",
          highlight: "Save up to 20% with accessories",
          gradient: "from-[#1c1917] via-[#78350f] to-[#a16207]",
        },
      ],
    },
    categories: {
      laptop: "Laptops",
      pc: "PCs",
      smartphone: "Smartphones",
      monitor: "Monitors",
      accessory: "Accessories",
      tablet: "Tablets",
      audio: "Audio",
    },
    badges: {
      new: "New",
      installment: "0% installment",
      bestseller: "Best seller",
      office: "Office",
      accessory: "Accessory",
    },
  },
  zh: {
    common: {
      all: "全部",
      inStock: "有库存",
      rating: "星",
    },
    nav: {
      categories: "分类",
      products: "商品",
      warranty: "保修",
      signIn: "登录",
      cart: "购物车",
    },
    home: {
      eyebrow: "秋季科技精选",
      title: "用精选科技产品升级你的工作与娱乐空间",
      subtitle:
        "笔记本、智能手机、显示器和配件来自可靠品牌，按真实需求整理，方便快速选购。",
      primaryCta: "查看商品",
      secondaryCta: "热门分类",
      dealLabel: "今日优惠",
      dealTitle: "Laptop Creator Pro 14",
      dealDescription:
        "Intel Core Ultra、120Hz OLED 屏幕、32GB 内存，并为企业客户提供 24 个月保修。",
      stats: {
        products: "商品",
        brands: "品牌",
        support: "支持",
      },
      featuredLabel: "精选推荐",
      featuredTitle: "热销商品",
      viewAll: "查看全部",
    },
    hero: {
      goToSlide: "切换到横幅",
      stats: {
        products: { label: "商品", value: "240+" },
        brands: { label: "品牌", value: "32" },
        support: { label: "支持", value: "24/7" },
      },
      slides: [
        {
          label: "今日优惠",
          tag: "秋季热门",
          title: "Laptop Creator Pro 14",
          description: "120Hz OLED 屏幕、32GB 内存，并为企业客户提供 24 个月保修。",
          deviceType: "笔记本",
          price: "31,990,000 越南盾起",
          highlightLabel: "赠品",
          highlight: "赠送背包和安装服务",
          gradient: "from-[#3b2418] via-[#7c2d12] to-[#b45309]",
        },
        {
          label: "新品系列",
          tag: "智能生活",
          title: "节日季旗舰智能手机",
          description: "强劲性能、优秀夜拍和快速充电，适合忙碌的日常。",
          deviceType: "智能手机",
          price: "18,990,000 越南盾起",
          highlightLabel: "优惠",
          highlight: "最长 12 个月 0% 分期",
          gradient: "from-[#2f1d14] via-[#92400e] to-[#dc2626]",
        },
        {
          label: "工作桌搭",
          tag: "创作者桌面",
          title: "4K 显示器和配件，打造温暖桌面",
          description: "为设计师、开发者和现代办公团队精选的桌面方案。",
          deviceType: "显示器",
          price: "11,990,000 越南盾起",
          highlightLabel: "套装",
          highlight: "搭配配件最高省 20%",
          gradient: "from-[#1c1917] via-[#78350f] to-[#a16207]",
        },
      ],
    },
    categories: {
      laptop: "笔记本",
      pc: "台式电脑",
      smartphone: "智能手机",
      monitor: "显示器",
      accessory: "配件",
      tablet: "平板电脑",
      audio: "音频",
    },
    badges: {
      new: "新品",
      installment: "0% 分期",
      bestseller: "热销",
      office: "办公",
      accessory: "配件",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
