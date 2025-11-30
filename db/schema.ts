import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 1. Products
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  priceCents: integer("price_cents").default(0),
  mainImage: text("main_image"),
  gallery: text("gallery"), // JSON string for array of images
  tags: text("tags"), // JSON string for array of strings
  category: text("category"), // e.g. "powder", "drink", "combo"
  purchaseUrl: text("purchase_url"), // 购买链接
  viewCount: integer("view_count").default(0), // 查看人数
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 2. Articles
export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content"),
  coverImage: text("cover_image"),
  published: integer("published", { mode: "boolean" }).default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 3. Recipes
export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  ingredients: text("ingredients"), // JSON for list of {name, amount, unit}
  steps: text("steps"), // JSON for list of step strings
  heroImage: text("hero_image"),
  relatedProductSlugs: text("related_product_slugs"), // JSON array of product slugs
  difficulty: text("difficulty"), // e.g. "easy", "normal"
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 4. Banners
export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(), // e.g. "home-hero", "home-middle", "superfood-strip"
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  image: text("image"),
  linkUrl: text("link_url"),
  position: integer("position").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 5. Brand Story (single row table)
export const brandStory = sqliteTable("brand_story", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  mission: text("mission"),
  vision: text("vision"),
  brandTone: text("brand_tone"),
  storyBlocks: text("story_blocks"), // JSON array of sections with {title, body}
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 6. Videos
export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type"), // e.g. "hero", "howto", "brand"
  platform: text("platform"), // e.g. "mp4", "bilibili", "douyin"
  url: text("url"),
  coverImage: text("cover_image"),
  durationSec: integer("duration_sec"),
  productId: integer("product_id"), // 关联的产品ID，用于显示产品小图
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 7. Gallery Images
export const galleryImages = sqliteTable("gallery_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  alt: text("alt"),
  url: text("url").notNull(),
  category: text("category"), // e.g. "product", "lifestyle", "ingredient"
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 8. Members (admin users)
export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin"), // e.g. "admin", "editor", "viewer"
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 9. Site Settings (single row table for social links and quality report)
export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  douyinUrl: text("douyin_url"), // 抖音链接
  xiaohongshuUrl: text("xiaohongshu_url"), // 小红书链接
  tmallUrl: text("tmall_url"), // 天猫链接
  jdUrl: text("jd_url"), // 京东链接
  qualityReportUrl: text("quality_report_url"), // 质检报告文件 URL
  promotionalBannerText: text("promotional_banner_text"), // 顶部促销横幅文字
  promotionalBannerUrl: text("promotional_banner_url"), // 促销横幅链接
  promotionalBannerActive: integer("promotional_banner_active", { mode: "boolean" }).default(false), // 是否激活促销横幅
  logoTagline: text("logo_tagline"), // Logo上方的标语（如 "NATURE-POWERED"）
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 10. Contact Messages
export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 11. Subscribers (email newsletter)
export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 12. Navigation Menu Items (支持多级菜单)
export const navigationItems = sqliteTable("navigation_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(), // 显示文本
  url: text("url"), // 链接地址（可以是外部链接或内部路径）
  type: text("type").default("link"), // "link" | "page" | "dropdown"
  pageType: text("page_type"), // 内部页面类型: "products" | "videos" | "recipes" | "articles" | "custom"
  pageSlug: text("page_slug"), // 内部页面slug（如果type是page）
  position: text("position").default("left"), // "left" | "right" | "center"
  sortOrder: integer("sort_order").default(0), // 排序顺序
  parentId: integer("parent_id"), // 父菜单ID（用于多级菜单）
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  openInNewTab: integer("open_in_new_tab", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 13. Social Media Platforms (社交媒体平台)
export const socialPlatforms = sqliteTable("social_platforms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // 平台名称，如 "Facebook", "Instagram"
  iconType: text("icon_type").default("svg"), // "svg" | "image" | "emoji"
  iconSvg: text("icon_svg"), // SVG代码
  iconImage: text("icon_image"), // 图片URL
  iconEmoji: text("icon_emoji"), // Emoji字符
  url: text("url"), // 平台链接
  sortOrder: integer("sort_order").default(0), // 排序顺序
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 14. Partner Brands (合作品牌)
export const partnerBrands = sqliteTable("partner_brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // 品牌名称
  logoUrl: text("logo_url").notNull(), // Logo图片URL
  websiteUrl: text("website_url"), // 品牌官网链接（可选）
  sortOrder: integer("sort_order").default(0), // 排序顺序
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 15. About Us (关于我们 - 单行表，存储主要信息)
export const aboutUs = sqliteTable("about_us", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  heroTitle: text("hero_title"), // Hero 标题
  heroSubtitle: text("hero_subtitle"), // Hero 副标题
  heroVideoUrl: text("hero_video_url"), // Hero 视频URL
  missionTitle: text("mission_title"), // 使命标题
  missionContent: text("mission_content"), // 使命内容
  motto: text("motto"), // 口号
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 16. Core Values (核心价值)
export const coreValues = sqliteTable("core_values", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: text("number"), // 编号，如 "01"
  title: text("title").notNull(), // 标题
  hashtag: text("hashtag"), // 标签，如 "#SCRAPPY"
  sortOrder: integer("sort_order").default(0), // 排序顺序
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 17. Milestones (里程碑)
export const milestones = sqliteTable("milestones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  year: text("year"), // 年份
  month: text("month"), // 月份或季度（例如: "MARCH", "Q1'25", "Q4'24"）
  title: text("title").notNull(), // 标题
  description: text("description"), // 描述（可选）
  color: text("color").default("#10B981"), // 年份颜色（十六进制）
  icon: text("icon"), // 图标类型（可选: "rocket", "unicorn", "globe", "star", null）
  sortOrder: integer("sort_order").default(0), // 排序顺序
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 18. About Gallery (关于我们图片画廊)
export const aboutGallery = sqliteTable("about_gallery", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("image_url").notNull(), // 图片URL
  alt: text("alt"), // 图片alt文本
  sortOrder: integer("sort_order").default(0), // 排序顺序
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 19. Map Locations (地图位置标记)
export const mapLocations = sqliteTable("map_locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // 位置名称，如 "SAN DIEGO HQ"
  label: text("label"), // 标签，如 "HQ"（可选）
  latitude: text("latitude").notNull(), // 纬度（字符串格式，如 "32.7157"）
  longitude: text("longitude").notNull(), // 经度（字符串格式，如 "-117.1611"）
  color: text("color").default("#7C3AED"), // 标记颜色（十六进制）
  sortOrder: integer("sort_order").default(0), // 排序顺序
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// TypeScript types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;

export type BrandStory = typeof brandStory.$inferSelect;
export type NewBrandStory = typeof brandStory.$inferInsert;

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;

export type NavigationItem = typeof navigationItems.$inferSelect;
export type NewNavigationItem = typeof navigationItems.$inferInsert;

export type SocialPlatform = typeof socialPlatforms.$inferSelect;
export type NewSocialPlatform = typeof socialPlatforms.$inferInsert;

export type PartnerBrand = typeof partnerBrands.$inferSelect;
export type NewPartnerBrand = typeof partnerBrands.$inferInsert;

export type AboutUs = typeof aboutUs.$inferSelect;
export type NewAboutUs = typeof aboutUs.$inferInsert;

export type CoreValue = typeof coreValues.$inferSelect;
export type NewCoreValue = typeof coreValues.$inferInsert;

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

export type AboutGallery = typeof aboutGallery.$inferSelect;
export type NewAboutGallery = typeof aboutGallery.$inferInsert;

export type MapLocation = typeof mapLocations.$inferSelect;
export type NewMapLocation = typeof mapLocations.$inferInsert;
