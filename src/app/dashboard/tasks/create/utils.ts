import { CreateTaskState } from "./hooks/useCreateTaskState";

export function applyPresetToState(presetValue: string, state: CreateTaskState) {
  if (presetValue === "instagram-follow") {
    state.setTaskType("follow");
    state.setTargetPlatform("instagram");
    state.setTitle("Follow our Instagram page");
    state.setDescription('Follow the account at the target link and submit a screenshot showing the "Following" state.');
    state.setInstructions([
      "Click on the link to visit the Instagram page.",
      'Click the "Follow" button.',
      "Take a screenshot showing you followed the account.",
      "Upload the screenshot as proof.",
    ]);
    state.setProofType("banner");
    state.setAcceptText(false);
    state.setTextLabel("");
    state.setAcceptNumber(false);
    state.setNumberLabel("");
    state.setAcceptMultipleImages(false);
  } else if (presetValue === "tiktok-follow") {
    state.setTaskType("follow");
    state.setTargetPlatform("tiktok");
    state.setTitle("Follow our TikTok page");
    state.setDescription('Follow the user at the target link and submit a screenshot showing the "Following" state.');
    state.setInstructions([
      "Click on the link to visit the TikTok profile.",
      'Click the "Follow" button.',
      "Take a screenshot showing you followed.",
      "Upload the screenshot.",
    ]);
    state.setProofType("banner");
    state.setAcceptText(false);
    state.setTextLabel("");
    state.setAcceptNumber(false);
    state.setNumberLabel("");
    state.setAcceptMultipleImages(false);
  } else if (presetValue === "youtube-sub") {
    state.setTaskType("subscribe");
    state.setTargetPlatform("youtube");
    state.setTitle("Subscribe to our YouTube Channel");
    state.setDescription("Subscribe to the channel and turn on notifications, then upload a screenshot proof.");
    state.setInstructions([
      "Click on the link to go to the YouTube channel.",
      'Click the "Subscribe" button.',
      "Take a screenshot showing you are subscribed.",
      "Upload the screenshot.",
    ]);
    state.setProofType("banner");
    state.setAcceptText(false);
    state.setTextLabel("");
    state.setAcceptNumber(false);
    state.setNumberLabel("");
    state.setAcceptMultipleImages(false);
  } else if (presetValue === "whatsapp-status") {
    state.setTaskType("post-content");
    state.setTargetPlatform("whatsapp");
    state.setTitle("Post Promo on your WhatsApp Status");
    state.setDescription(
      "Download the attached promo image, copy the caption, post it on your status, and submit a screenshot showing your views after at least 1 hour."
    );
    state.setInstructions([
      "Download the promotional image attached to the task.",
      "Copy the caption provided.",
      "Upload the image to your WhatsApp Status with the caption.",
      "Leave it for at least 1 hour.",
      "Take a screenshot showing the status post and views count, and submit it.",
    ]);
    state.setProofType("banner");
    state.setAcceptText(false);
    state.setTextLabel("");
    state.setAcceptNumber(false);
    state.setNumberLabel("");
    state.setAcceptMultipleImages(false);
  } else if (presetValue === "payfluence-promo") {
    state.setTaskType("post-content");
    state.setTargetPlatform("whatsapp");
    state.setTitle("PayFluence Status / Review Campaign");
    state.setDescription("Select one of the suggested PayFluence prompts from the modal, copy it, post it on your status / profile, and upload a screenshot proof.");
    state.setInstructions([
      "Click the bold button to open the suggested prompts modal.",
      "Select and copy one of the available prompts (used ones will be marked).",
      "Post the copied text on your status or profile.",
      "Take a screenshot showing your post.",
      "Upload the screenshot as proof here."
    ]);
    state.setProofType("banner");
    state.setAcceptText(false);
    state.setTextLabel("");
    state.setAcceptNumber(false);
    state.setNumberLabel("");
    state.setAcceptMultipleImages(false);
    state.setRequirePromptSelection(true);
    state.setPrompts([
      "Still struggling to get customers online? Your competitors are getting reviews, followers, and visibility while you're waiting. Let PayFluence help your business get seen by real people. Message us today: +2348132081560\nwww.payfluence.com.ng",
      "You don't need millions for marketing. With shikini money, PayFluence can help your business gain organic followers, reviews, engagement, and visibility from real users.\n+2348132081560\nwww.payfluence.com.ng",
      "Fake followers can't buy your products. Real people can.\nBuy organic followers from PayFluence and grow your brand the right way.\n+2348132081560\nwww.payfluence.com.ng",
      "Need 1,000 followers?\nNeed 5,000 followers?\nNeed 10,000 followers?\nPayFluence helps businesses grow with real users, not bots.\n+2348132081560\nwww.payfluence.com.ng",
      "Your business is good.\nYour product is good.\nBut if nobody sees it, nobody buys it.\nPayFluence helps put your business in front of real people.\n+2348132081560\nwww.payfluence.com.ng",
      "Developers, before launching your app, test it with real humans.\nHire 100 to 10,000 real users through PayFluence and get genuine feedback.\n+2348132081560\nwww.payfluence.com.ng",
      "Why launch your app blindly?\nGet hundreds or thousands of real users to test your application before release.\nPayFluence makes it easy.\n+2348132081560\nwww.payfluence.com.ng",
      "Need Play Store reviews?\nNeed App Store reviews?\nNeed real user feedback?\nPayFluence connects your app with real users ready to test and review.\n+2348132081560\nwww.payfluence.com.ng",
      "Many businesses fail online because nobody knows they exist.\nVisibility creates trust.\nTrust creates customers.\nTrust creates customers.\nCustomers create sales.\nStart with PayFluence.\n+2348132081560\nwww.payfluence.com.ng",
      "Search your business online.\nIf nobody is talking about you, it's time to change that.\nPayFluence helps businesses get reviews, engagement, and visibility.\n+2348132081560\nwww.payfluence.com.ng",
      "Your app deserves real users, not fake traffic.\nHire hundreds of testers from PayFluence and watch your product improve before launch.\n+2348132081560\nwww.payfluence.com.ng",
      "A single positive review can influence hundreds of buying decisions.\nImagine what 100 reviews can do for your business.\n+2348132081560\nwww.payfluence.com.ng",
      "Building a startup?\nLaunching a new product?\nOpening a new business?\nPayFluence can bring the attention you need.\n+2348132081560\nwww.payfluence.com.ng",
      "Don't spend money on bots that disappear tomorrow.\nInvest in real people who can become real customers.\nChoose PayFluence.\n+2348132081560\nwww.payfluence.com.ng",
      "Business owners:\nNeed Google Reviews?\nNeed Play Store Reviews?\nNeed Organic Followers?\nNeed Product Testers?\nPayFluence is built for you.\n+2348132081560\nwww.payfluence.com.ng",
      "From local businesses to tech startups, PayFluence helps brands gain visibility through real human engagement.\n+2348132081560\nwww.payfluence.com.ng",
      "Your next customer is scrolling right now.\nThe question is:\nWill they find your business or your competitor's?\n+2348132081560\nwww.payfluence.com.ng",
      "Need people to test your website, app, or platform?\nGet feedback from real users across Nigeria through PayFluence.\n+2348132081560\nwww.payfluence.com.ng",
      "Thousands of Nigerians are ready to engage with your business.\nPayFluence connects you directly to them.\n+2348132081560\nwww.payfluence.com.ng",
      "Whether you need followers, reviews, testers, signups, comments, likes, or engagement, PayFluence helps you get results from real people.\n+2348132081560\nwww.payfluence.com.ng"
    ].join("\n\n"));
  }
}
