// lib/services/couponService.ts
// Synchronous mock coupon data service.
//
// Architecture note:
//   This module is designed to be replaced with a Firestore implementation
//   in a future sprint. The public surface (getCoupons, getCouponById) is
//   intentionally identical to what a Firestore service would expose,
//   so the Wallet UI never needs to change.

import type { Coupon } from "@/types/coupon";

const MOCK_COUPONS: Coupon[] = [
  {
    id: "coupon-01",
    icon: "🏆",
    title: "You Win One Argument",
    description: "Redeem this to automatically win one genuine argument. No appeals allowed.",
    longDescription:
      "Sometimes you just need to be right — no questions asked, no footnotes, no 'but technically.' Present this coupon, name your argument, and watch me concede gracefully and genuinely. No rebuttals, no revisiting it later, no quiet grumbling. Just a clean, fully acknowledged win, delivered without conditions.",
    category: "fun",
    status: "available",
    createdAt: "2026-07-15T00:00:00Z",
  },
  {
    id: "coupon-02",
    icon: "👑",
    title: "24 Hours of Obedience",
    description: "For one whole day, I'll say yes to all reasonable requests.",
    longDescription:
      "For one full day, your wish is my command — every single one. No grumbling in the background, no passive delays, no 'maybe later.' Every request gets a yes before I've had time to think it over, delivered with full enthusiasm and zero resentment. Twenty-four hours of being completely and unreservedly at your service.",
    category: "power",
    status: "special",
    createdAt: "2026-07-15T00:01:00Z",
  },
  {
    id: "coupon-03",
    icon: "🤐",
    title: "I Can't Say No",
    description: "One request. No negotiations. No excuses.",
    longDescription:
      "One request — anything you want — and I'll say yes before you've finished the sentence. There are no conditions, no escape clauses, no small print hidden anywhere. Just pure, unconditional compliance, delivered without complaint, hesitation, or the faintest trace of reluctance.",
    category: "power",
    status: "available",
    createdAt: "2026-07-15T00:02:00Z",
  },
  {
    id: "coupon-04",
    icon: "🎬",
    title: "Movie Night",
    description: "You choose the movie. I won't complain, even if it's my 100th rewatch.",
    longDescription:
      "Your movie, your rules, your couch setup — I'll be right there, genuinely invested, not once glancing at my phone or suggesting we watch something else. Even if it's your hundredth rewatch of the same film, I'll sit through every scene like it's the first time. Because watching things you love is something I never get tired of.",
    category: "date",
    status: "available",
    createdAt: "2026-07-15T00:03:00Z",
  },
  {
    id: "coupon-05",
    icon: "🍕",
    title: "Last Bite Is Yours",
    description: "You get the final bite of my food. No negotiations.",
    longDescription:
      "The last bite is always the best one, and this coupon makes it permanently, officially yours. No hesitation, no 'are you sure?', no performing reluctance before handing it over. Just the best part of whatever I'm eating, passed straight to you every single time — without exception, without negotiation.",
    category: "fun",
    status: "available",
    createdAt: "2026-07-15T00:04:00Z",
  },
  {
    id: "coupon-06",
    icon: "☕",
    title: "Midnight Coffee Date",
    description: "A spontaneous coffee run whenever you feel like it.",
    longDescription:
      "One late-night message and we're out the door — no planning, no convincing, no 'it's too late.' A quiet café, something warm to hold, and the kind of conversation that only happens when the rest of the world has already gone to sleep. No agenda, no time limit. Just however long we feel like staying.",
    category: "date",
    status: "available",
    createdAt: "2026-07-15T00:05:00Z",
  },
  {
    id: "coupon-07",
    icon: "🌌",
    title: "Stargazing Night",
    description: "A peaceful night under the stars with no distractions.",
    longDescription:
      "We find somewhere quiet and far enough from the city lights, spread a blanket on the ground, and spend the evening doing absolutely nothing except looking up. No phones, no noise, no plan. Just the sky doing what it does, and us saying whatever comes to mind while the world goes still around us.",
    category: "romantic",
    status: "available",
    createdAt: "2026-07-15T00:06:00Z",
  },
  {
    id: "coupon-08",
    icon: "🚗",
    title: "Long Drive",
    description: "Windows down. Playlist up. Destination unknown.",
    longDescription:
      "Windows all the way down, your playlist loud enough to feel, and no destination decided in advance. We drive until something looks interesting or until we feel like stopping — then a little further, because the point was never the destination. It was always just being in the car together, going nowhere in particular.",
    category: "adventure",
    status: "available",
    createdAt: "2026-07-15T00:07:00Z",
  },
  {
    id: "coupon-09",
    icon: "💆",
    title: "Relaxing Massage",
    description: "A relaxing massage with absolutely no rushing.",
    longDescription:
      "A proper, unhurried massage — no skipping sections, no checking the clock, no 'is that enough?' You choose the time, I show up ready, and it ends only when you say so. Fully present, no distractions, no rushing through it. Just the kind of rest you actually deserve, taken at the pace you actually need.",
    category: "romantic",
    status: "available",
    createdAt: "2026-07-15T00:08:00Z",
  },
  {
    id: "coupon-10",
    icon: "🍦",
    title: "Ice Cream Date",
    description: "Your favourite flavour, my treat.",
    longDescription:
      "Your favourite flavour first, then whatever else catches your eye on the way to the counter — my treat, no limits, no raised eyebrows at the total. We find somewhere nice to sit and take our time with every scoop. No rushing, no 'should we get going?' Just ice cream and however long the afternoon allows.",
    category: "date",
    status: "available",
    createdAt: "2026-07-15T00:09:00Z",
  },
  {
    id: "coupon-11",
    icon: "📱",
    title: "Phone-Free Date",
    description: "A date with zero scrolling, only us.",
    longDescription:
      "Both phones go face-down the moment we leave and stay that way until we're done. No checking notifications mid-sentence, no quick scrolls while I think you're not looking, no glancing at the screen for any reason. Just us, fully present, noticing all the small things we usually miss when we're half-distracted.",
    category: "romantic",
    status: "available",
    createdAt: "2026-07-15T00:10:00Z",
  },
  {
    id: "coupon-12",
    icon: "👕",
    title: "You Pick My Outfit",
    description: "I'll wear whatever outfit you choose for one outing.",
    longDescription:
      "You have complete creative control over what I wear for one full outing. Lay it out the night before, pick it the morning of — whatever you choose, I'll put it on without a word or a comment. Whatever the vision you have in your head, I'm your canvas. No vetoes, no negotiations, no emergency swaps.",
    category: "fun",
    status: "available",
    createdAt: "2026-07-15T00:11:00Z",
  },
  {
    id: "coupon-13",
    icon: "🧺",
    title: "Picnic Date",
    description: "A blanket, snacks, and a lazy afternoon together.",
    longDescription:
      "A blanket on the grass, snacks we picked out together, and an afternoon with nowhere else to be and no reason to rush. Simple, unhurried, and quietly perfect in a way that more elaborate plans rarely manage to be. Just the two of us and however long the afternoon decides to last.",
    category: "date",
    status: "available",
    createdAt: "2026-07-15T00:12:00Z",
  },
  {
    id: "coupon-14",
    icon: "📸",
    title: "Photo Walk",
    description: "Let's capture beautiful moments together.",
    longDescription:
      "We wander without a fixed route and photograph whatever feels beautiful that day. The kind of afternoon where you stop for twenty minutes because the light hits a wall just right, or a doorway looks exactly the way you want to remember it — and nobody minds, because being there was already the whole point.",
    category: "romantic",
    status: "available",
    createdAt: "2026-07-15T00:13:00Z",
  },
  {
    id: "coupon-15",
    icon: "😂",
    title: "Roast Me Pass",
    description: "Five minutes of roasting me. I promise not to defend myself.",
    longDescription:
      "Five uninterrupted minutes to say absolutely anything you want about me. I'll sit there and take every word with a smile — no defending myself, no counter-roasts, no sulking afterwards, no bringing it up later. Just you, the floor, and an unusually patient audience who agreed to this entirely on purpose.",
    category: "fun",
    status: "available",
    createdAt: "2026-07-15T00:14:00Z",
  },
  {
    id: "coupon-16",
    icon: "🎁",
    title: "Mystery Date",
    description: "I'll plan everything. You just show up.",
    longDescription:
      "I'll handle every single detail — where we go, how we get there, what we eat, what happens after. All you need to do is show up at the time I give you and trust that it's worth it. No hints, no spoilers, no peeking at my phone while I'm planning. Just show up, and let me take care of the rest.",
    category: "surprise",
    status: "special",
    createdAt: "2026-07-15T00:15:00Z",
  },
  {
    id: "coupon-17",
    icon: "💌",
    title: "Handwritten Love Letter",
    description: "A fresh handwritten letter written just for you.",
    longDescription:
      "Not a text, not a voice note — a proper letter, written slowly and carefully on actual paper, with something worth saying in every single line. Pages, in ink, telling you things I mean and want you to be able to come back to and read again whenever you want to.",
    category: "romantic",
    status: "available",
    createdAt: "2026-07-15T00:16:00Z",
  },
  {
    id: "coupon-18",
    icon: "🌅",
    title: "Sunrise Date",
    description: "Wake up early and watch the sunrise together.",
    longDescription:
      "We set an alarm for an unreasonable hour, get up anyway without complaining, and go somewhere worth watching the sun come up. Early mornings feel entirely different when you're sharing them — quieter, softer, like the whole day is beginning fresh just for the two of us before anyone else has woken up.",
    category: "date",
    status: "available",
    createdAt: "2026-07-15T00:17:00Z",
  },
  {
    id: "coupon-19",
    icon: "🛍️",
    title: "Shopping Without Complaints",
    description: "I'll happily accompany you shopping. No rushing allowed.",
    longDescription:
      "A full shopping trip where I'm present, patient, and genuinely happy to be there. No checking the time, no waiting by the door with my hands in my pockets, no quiet sighing when we double back for the third time. Just your willing, enthusiastic shopping companion — from the first store to the last bag.",
    category: "fun",
    status: "available",
    createdAt: "2026-07-15T00:18:00Z",
  },
  {
    id: "coupon-20",
    icon: "❤️",
    title: "Romantic Date Night",
    description: "One entire evening planned from start to finish, just for you.",
    longDescription:
      "One complete evening, planned entirely by me from the very first moment to the very last. You won't know where we're going, what we're eating, or what happens next until we're already there. Just show up at the time I tell you, dressed however you like, and let me take care of absolutely everything else.",
    category: "romantic",
    status: "special",
    createdAt: "2026-07-15T00:19:00Z",
  },
];
/**
 * Returns the full list of coupons.
 * Replace the body with a Firestore getDocs() call in a future sprint.
 */
export function getCoupons(): Coupon[] {
  return MOCK_COUPONS;
}

/**
 * Returns a single coupon by ID, or undefined if not found.
 * Replace the body with a Firestore getDoc() call in a future sprint.
 */
export function getCouponById(id: string): Coupon | undefined {
  return MOCK_COUPONS.find((c) => c.id === id);
}
