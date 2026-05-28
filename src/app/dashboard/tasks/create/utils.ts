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
  }
}
