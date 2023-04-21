// Generated by https://quicktype.io

export interface Course {
  success: boolean;
  data: Data;
}

export interface Data {
  id: number;
  owner: Owner;
  paid_date: string;
  publish_state: string;
  payment_state: string;
  duration: number;
  subscribed_from: string;
  subscribed_till: string;
  lifetime: boolean;
  over_by_time: boolean;
  notify_about_drip_in: boolean;
  canceled_at: null;
  pause_days: number;
  payment_past_due: boolean;
  payment_paused: boolean;
  progress: number;
  blocked: boolean;
  order: Order;
  seller: Seller;
  product: Product;
  created_at: string;
  updated_at: string;
  sellable_id: number;
  course_theme: CourseTheme;
}

export interface CourseTheme {
  id: number;
  name: string;
  form: string;
  prefs: CourseThemePrefs;
  seller_id: number;
  created_at: string;
  updated_at: string;
}

export interface CourseThemePrefs {
  css: string;
  lesson: { [key: string]: string };
  full_width: boolean;
  link_color: string;
  button_font: string;
  button_size: string;
  title_color: string;
  button_color: string;
  button_style: string;
  show_overview: boolean;
  course_overview: { [key: string]: string };
  active_link_color: string;
  button_font_color: string;
  show_lesson_banner: boolean;
  button_border_color: string;
  show_overview_banner: boolean;
  top_navigation_enabled: boolean;
  show_lesson_banner_text: boolean;
  bottom_navigation_enabled: boolean;
}

export interface Order {
  id: number;
  recurring: boolean;
  any_payments: boolean;
  token: string;
  period_type: string;
  cancel_at: null;
  payment_form: string;
  payment_state: string;
  test_period_passed: boolean;
  can_continue: boolean;
}

export interface Owner {
  full_name: string;
  email: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  seller_id: number;
  description: string;
  course_menu_unfold: boolean;
  course_theme_id: number;
  covers: Cover[];
  published: boolean;
  position: null;
  active: boolean;
  private: boolean;
  free: boolean;
  form: string;
  pricing_plans: PricingPlan[];
  tickets: [];
  cancellation_terms: CancellationTerms;
  allow_course_reset: boolean;
  display_price: string;
  display_old_price: null;
  display_currency_id: number;
  access_session_limit: number;
  course_theme: CourseTheme;
}

export interface CancellationTerms {
  checkbox_visible: boolean;
  label: string;
}

export interface Cover {
  id: number;
  cover: string;
  file: File;
  file_content_type: null;
  file_crop_h: null;
  file_crop_w: null;
  file_crop_x: null;
  file_crop_y: null;
  file_file_name: null;
  file_file_size: null;
  file_name: null;
  file_remote_url: null;
  file_updated_at: null;
  link: null;
  ownerable_id: number;
  ownerable_type: string;
  thumb: string;
  type: string;
  uploaded_via_te: null;
  url: string;
  uuid: string;
  video_link: null;
  voucher_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface File {
  s_100: string;
  s_640: string;
  s_1200: string;
  original: string;
  name: string;
  cdn_url: string;
  download_url: string;
  size: number;
  content_type: string;
}

export interface PricingPlan {
  id: number;
  name: string;
  description: string;
  currency_id: number;
  form: string;
  prefs: PricingPlanPrefs;
  use_net_price: boolean;
  test_period_description: null;
  enabled_pay_methods: string[];
  activate_countdown: boolean;
  visual_separation_enabled: boolean;
  valid_from: null;
  valid_till: null;
  preferred_pay_methods: [];
  other_pay_methods: string[];
  payments_count: number;
  custom_intervals: boolean;
  first_interval_date: string;
  next_interval_date: null | string;
}

export interface PricingPlanPrefs {
  price: null | string;
  past_due: string;
  test_period: string;
  minimum_terms: boolean;
  custom_intervals: boolean;
  absolute_dates: string;
  first_interval: string;
  sepa_immediate?: boolean;
  first_payment_on_order_date: string;
  custom_start_day: string;
  paypal_rest_immediate: boolean;
  custom_charge_day_immediate_access: string;
  next_interval: string;
  first_amount?: string;
  payments_count?: string;
  test_period_hide_amounts?: boolean;
  next_amount?: string;
}

export interface Seller {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string;
  user_profile_id: number;
  user_id: number;
  membership_theme_id: null;
  option_keys: string[];
  chat_body: null;
  domain_name: null;
  domain_logo: null;
  sofort_provider: string;
  host: string;
  protocol: string;
  stripe_sofort_sepa: boolean;
  elopage_connect_sofort_sepa: boolean;
  stripe_ideal_sepa: null;
  elopage_connect_ideal_sepa: null;
}