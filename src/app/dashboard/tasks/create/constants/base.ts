export const TASK_TYPES = [
  { value: "follow", label: "Follow (Follow an account)" },
  { value: "like", label: "Like (Like a post or page)" },
  { value: "comment", label: "Comment (Comment on a post)" },
  { value: "subscribe", label: "Subscribe (Subscribe to a channel)" },
  { value: "share", label: "Share (Share a post)" },
  { value: "post-content", label: "Post Content (Post on your profile/status)" },
  { value: "views", label: "Views (Get views on a post)" },
  { value: "download", label: "Download (Download an app or file)" },
  { value: "signup", label: "Sign Up (Register / create account)" },
  { value: "review", label: "Review (Leave a rating or review)" },
  { value: "message", label: "Message (Chat or DM someone)" },
  { value: "watch", label: "Watch (Watch a video to completion)" },
  { value: "use-app", label: "Use App (Use a feature or service)" },
  { value: "jetpot", label: "Jetpot (Bring buyers / sales referral)" },
];

export const PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

export const PRESETS = [
  { value: "custom", label: "Custom Task (Manual Configuration)" },
  { value: "instagram-follow", label: "Instagram Follow" },
  { value: "tiktok-follow", label: "TikTok Follow" },
  { value: "youtube-sub", label: "YouTube Subscribe" },
  { value: "whatsapp-status", label: "WhatsApp Status Post" },
  { value: "payfluence-promo", label: "PayFluence Promo (WhatsApp Status / Reviews)" },
];

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export const TIMELINE_OPTIONS = [
  ...Array.from({ length: 48 }, (_, i) => ({
    label: i === 0 ? "1 hour" : `${i + 1} hours`,
    ms: (i + 1) * HOUR_MS,
  })),
  { label: "3 days", ms: 3 * DAY_MS },
  { label: "5 days", ms: 5 * DAY_MS },
  { label: "6 days", ms: 6 * DAY_MS },
  { label: "7 days", ms: 7 * DAY_MS },
];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];
