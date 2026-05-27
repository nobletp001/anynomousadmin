'use client'

import React, { useRef, useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api-client'
import { Button } from '@/components/ui'
import { ArrowLeft, Plus, Trash2, Upload, X, Info, Link as LinkIcon, Image as ImageIcon, Infinity, Sparkles, Mic, Loader2, GripVertical } from 'lucide-react'

const TASK_TYPES = [
  { value: 'follow', label: 'Follow (Follow an account)' },
  { value: 'like', label: 'Like (Like a post or page)' },
  { value: 'comment', label: 'Comment (Comment on a post)' },
  { value: 'subscribe', label: 'Subscribe (Subscribe to a channel)' },
  { value: 'share', label: 'Share (Share a post)' },
  { value: 'post-content', label: 'Post Content (Post on your profile/status)' },
  { value: 'views', label: 'Views (Get views on a post)' },
  { value: 'download', label: 'Download (Download an app or file)' },
  { value: 'signup', label: 'Sign Up (Register / create account)' },
  { value: 'review', label: 'Review (Leave a rating or review)' },
  { value: 'message', label: 'Message (Chat or DM someone)' },
  { value: 'watch', label: 'Watch (Watch a video to completion)' },
  { value: 'use-app', label: 'Use App (Use a feature or service)' },
  { value: 'jetpot', label: 'Jetpot (Bring buyers / sales referral)' },
]

const PLATFORMS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'other', label: 'Other' },
]

const PRESETS = [
  { value: 'custom', label: 'Custom Task (Manual Configuration)' },
  { value: 'instagram-follow', label: 'Instagram Follow' },
  { value: 'tiktok-follow', label: 'TikTok Follow' },
  { value: 'youtube-sub', label: 'YouTube Subscribe' },
  { value: 'whatsapp-status', label: 'WhatsApp Status Post' },
]

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const TIMELINE_OPTIONS = [
  ...Array.from({ length: 48 }, (_, i) => ({
    label: i === 0 ? '1 hour' : `${i + 1} hours`,
    ms: (i + 1) * HOUR_MS,
  })),
  { label: '3 days', ms: 3 * DAY_MS },
  { label: '5 days', ms: 5 * DAY_MS },
  { label: '6 days', ms: 6 * DAY_MS },
  { label: '7 days', ms: 7 * DAY_MS },
]

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River",
  "Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna",
  "Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun",
  "Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
]

type AudienceFilter = {
  gender: string[]
  employmentStatus: string[]
  educationLevel: string[]
  state: string[]
  minAge: string
  maxAge: string
}

type ImageEntry = { file: File; preview: string }

const MAX_IMAGES = 5

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors'

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

const AI_PROMPT_EXAMPLES = [
  // WHATSAPP (10 prompts)
  { category: 'whatsapp', label: 'WhatsApp Status Flyer', text: 'Create a WhatsApp Status post task. Reward ₦100, 250 users. Users download attached flyer, post it on status, leave for 2 hours, upload screenshot showing view count.' },
  { category: 'whatsapp', label: 'WhatsApp Status Video', text: 'WhatsApp status video post. Reward ₦150, 100 users. Upload provided short promo video to WhatsApp status, keep for 4 hours, submit screenshot of status views.' },
  { category: 'whatsapp', label: 'WhatsApp Group Join', text: 'Join WhatsApp business community group. Reward ₦50, 500 users. Click link to join, submit screenshot showing group chat member listing.' },
  { category: 'whatsapp', label: 'WhatsApp Contact Save', text: 'Save contact number and message on WhatsApp. Reward ₦40, 1000 users. Save contact as Brand Support, send hello, screenshot chat.' },
  { category: 'whatsapp', label: 'WhatsApp Channel Follow', text: 'Follow official WhatsApp Channel. Reward ₦50, 400 users. Click channel link, click follow, screenshot channel dashboard with Following badge.' },
  { category: 'whatsapp', label: 'WhatsApp Broadcast', text: 'Send promo message to 5 WhatsApp contacts. Reward ₦200, 150 users. Forward text and link to 5 friends, upload screenshot of sent chats.' },
  { category: 'whatsapp', label: 'WhatsApp Group Share', text: 'Share campaign link to a WhatsApp Group with 100+ members. Reward ₦100, 300 users. Screenshot of message inside the group.' },
  { category: 'whatsapp', label: 'WhatsApp Status Link Click', text: 'Post a text link on WhatsApp status. Reward ₦80, 250 users. Post link, leave for 3 hours, screenshot views.' },
  { category: 'whatsapp', label: 'WhatsApp Poll Vote', text: 'Vote in WhatsApp Channel Poll. Reward ₦30, 800 users. Click channel, vote for Option A, screenshot your voted poll.' },
  { category: 'whatsapp', label: 'WhatsApp Community Join', text: 'Join official WhatsApp Announcement Community. Reward ₦50, 300 users. Submit screenshot of announcement channel.' },

  // TIKTOK (10 prompts)
  { category: 'tiktok', label: 'TikTok Follow Account', text: 'Follow @username on TikTok. Reward ₦30, 1000 users. Open TikTok profile, follow, take screenshot showing Following state. Collect TikTok username.' },
  { category: 'tiktok', label: 'TikTok Like & Comment', text: 'Like and comment on recent TikTok video. Reward ₦50, 500 users. Write a positive comment about the brand, screenshot video view showing your comment.' },
  { category: 'tiktok', label: 'TikTok Video Watch 1 Min', text: 'Watch TikTok video for 1 minute. Reward ₦40, 1000 users. Watch video at target link to completion, like video, screenshot liked screen.' },
  { category: 'tiktok', label: 'TikTok Video Share', text: 'Share TikTok video to status/friends. Reward ₦60, 200 users. Click share, copy link, screenshot share completion dialog on TikTok.' },
  { category: 'tiktok', label: 'TikTok Profile Visit & Follow', text: 'Tiktok organic follow. Reward ₦50, 400 users. Search for brand account manually, click follow, screenshot following status.' },
  { category: 'tiktok', label: 'TikTok Video Comment', text: 'Comment on TikTok video. Reward ₦30, 300 users. Comment must be at least 5 words. Screenshot proof.' },
  { category: 'tiktok', label: 'TikTok Duet Video', text: 'Duet our recent video on TikTok. Reward ₦300, 50 users. Post duet on your profile, submit link to your duet post.' },
  { category: 'tiktok', label: 'TikTok Sound Use', text: 'Post a 15s video using our TikTok Sound. Reward ₦500, 50 users. Record video with brand audio, publish it, submit video URL.' },
  { category: 'tiktok', label: 'TikTok Video Bookmark', text: 'Add TikTok video to your Favorites/Bookmarks. Reward ₦30, 600 users. Favorite the video, screenshot video with yellow star.' },
  { category: 'tiktok', label: 'TikTok Live Stream View', text: 'Watch TikTok Live Stream for 5 minutes. Reward ₦150, 200 users. Join live stream, stay 5m, screenshot live chat.' },

  // INSTAGRAM (10 prompts)
  { category: 'instagram', label: 'Instagram Follow account', text: 'Follow @brand_page on Instagram. Reward ₦40, 800 users. Visit profile, follow, submit screenshot showing Following state.' },
  { category: 'instagram', label: 'Instagram Post Like', text: 'Like Instagram post. Reward ₦30, 1500 users. Go to post link, click heart icon, screenshot post with red heart visible.' },
  { category: 'instagram', label: 'Instagram Post Comment', text: 'Comment on Instagram post. Reward ₦60, 400 users. Write positive comment, screenshot your comment listed under the post.' },
  { category: 'instagram', label: 'Instagram Story Share', text: 'Share Instagram post to your Story. Reward ₦120, 200 users. Share post to story, tag @brand_page, leave for 2 hours, screenshot story.' },
  { category: 'instagram', label: 'Instagram Reel Views', text: 'Watch and like Instagram Reel. Reward ₦50, 600 users. Go to reel link, watch to end, click like, screenshot Reel page.' },
  { category: 'instagram', label: 'Instagram DM Message', text: 'Send feedback via Instagram DM. Reward ₦50, 300 users. Send brand feedback on product, screenshot DM conversation.' },
  { category: 'instagram', label: 'Instagram Story View', text: 'View brand Instagram stories. Reward ₦30, 1000 users. Watch all active stories, screenshot final story page showing story ring completed.' },
  { category: 'instagram', label: 'Instagram Highlight View', text: 'Watch highlights and screenshot. Reward ₦40, 500 users. Browse our "FAQ" highlight, screenshot final slide.' },
  { category: 'instagram', label: 'Instagram Save Post', text: 'Save Instagram post to collection. Reward ₦30, 800 users. Click save ribbon icon, screenshot showing post saved.' },
  { category: 'instagram', label: 'Instagram Follow & Turn On Notifs', text: 'Follow and turn on Instagram notifications. Reward ₦80, 250 users. Screenshot showing Following and bell icon selected.' },

  // YOUTUBE (10 prompts)
  { category: 'youtube', label: 'YouTube Subscribe channel', text: 'Subscribe to YouTube Channel. Reward ₦60, 500 users. Click link, click subscribe, screenshot showing subscribed state.' },
  { category: 'youtube', label: 'YouTube Watch & Like', text: 'Watch video for 3 minutes and like. Reward ₦80, 400 users. Watch target video, click like, screenshot showing liked status and watch bar.' },
  { category: 'youtube', label: 'YouTube Bell Notification', text: 'Subscribe and turn on all notifications. Reward ₦80, 300 users. Screenshot channel header with bell icon set to All.' },
  { category: 'youtube', label: 'YouTube Video Comment', text: 'Comment on YouTube Video. Reward ₦50, 250 users. Write feedback about the video content, screenshot comment published.' },
  { category: 'youtube', label: 'YouTube Shorts watch', text: 'Watch YouTube Shorts. Reward ₦40, 1000 users. Watch shorts video to completion, click like, screenshot shorts player.' },
  { category: 'youtube', label: 'YouTube Share to Facebook', text: 'Share YouTube video on Facebook timeline. Reward ₦100, 200 users. Share video link, screenshot post on your Facebook page.' },
  { category: 'youtube', label: 'YouTube Playlist Watch', text: 'Watch 3 videos in YouTube Playlist. Reward ₦200, 100 users. Play playlist, watch 3 videos, screenshot history tab showing watched tags.' },
  { category: 'youtube', label: 'YouTube Channel Search', text: 'Search YouTube channel organically. Reward ₦70, 300 users. Search "Brand Name", find channel, subscribe, screenshot subscription.' },
  { category: 'youtube', label: 'YouTube Community Post Like', text: 'Like YouTube Community post. Reward ₦30, 600 users. Click community tab, like recent post, screenshot post.' },
  { category: 'youtube', label: 'YouTube Video Share WhatsApp', text: 'Share YouTube video to 3 WhatsApp groups. Reward ₦150, 150 users. Send link, screenshot sent message in groups.' },

  // FACEBOOK (10 prompts)
  { category: 'facebook', label: 'Facebook Page Follow', text: 'Follow and like Facebook Page. Reward ₦40, 1000 users. Click link, click Like and Follow, screenshot showing Liked status.' },
  { category: 'facebook', label: 'Facebook Post Share', text: 'Share Facebook post publicly. Reward ₦100, 300 users. Share post to your timeline set to Public, submit screenshot of shared post.' },
  { category: 'facebook', label: 'Facebook Post Comment', text: 'Comment on Facebook post. Reward ₦50, 500 users. Comment on post, screenshot comment page showing your name and text.' },
  { category: 'facebook', label: 'Facebook Group Join', text: 'Join Facebook Group. Reward ₦50, 400 users. Click link to join, submit screenshot showing you are a member of the group.' },
  { category: 'facebook', label: 'Facebook Page Review', text: 'Leave a 5-star review on Facebook Page. Reward ₦150, 150 users. Write positive feedback, submit screenshot of published review.' },
  { category: 'facebook', label: 'Facebook Event Interested', text: 'Mark "Interested" on Facebook Event. Reward ₦40, 500 users. Go to event page, click Interested, screenshot event details.' },
  { category: 'facebook', label: 'Facebook Video View', text: 'Watch Facebook Video for 2 minutes. Reward ₦60, 800 users. Play video, watch 2m, screenshot video showing watch duration.' },
  { category: 'facebook', label: 'Facebook Reel Like', text: 'Like Facebook Reel. Reward ₦30, 1000 users. Click reel link, click like, screenshot reel.' },
  { category: 'facebook', label: 'Facebook Profile Follow', text: 'Follow Facebook Profile. Reward ₦40, 500 users. Open profile link, click follow, screenshot profile with following checkmark.' },
  { category: 'facebook', label: 'Facebook Status Post Tag', text: 'Post brand tag on Facebook status. Reward ₦150, 100 users. Post text with @brand tag, screenshot post on timeline.' },

  // TWITTER (10 prompts)
  { category: 'twitter', label: 'Twitter/X Follow account', text: 'Follow @brand_account on X (Twitter). Reward ₦40, 800 users. Follow account, screenshot showing Following button. Collect X handle.' },
  { category: 'twitter', label: 'Twitter/X Like & Repost', text: 'Like and Retweet pinned X post. Reward ₦70, 500 users. Retweet/repost target post, click heart, screenshot post showing active icons.' },
  { category: 'twitter', label: 'Twitter/X Reply Post', text: 'Reply to X post. Reward ₦50, 400 users. Write positive reply about the topic, screenshot reply inside thread.' },
  { category: 'twitter', label: 'Twitter/X Repost Link', text: 'Repost campaign link on your X profile. Reward ₦100, 200 users. Tweet the link and caption, submit screenshot of your tweet.' },
  { category: 'twitter', label: 'Twitter/X Bookmark Post', text: 'Bookmark X post. Reward ₦30, 600 users. Save post to bookmarks, screenshot post showing bookmarked icon.' },
  { category: 'twitter', label: 'Twitter/X Space Join', text: 'Join X Space. Reward ₦150, 150 users. Join brand Space session, stay 5 minutes, screenshot space participant listing.' },
  { category: 'twitter', label: 'Twitter/X List Follow', text: 'Follow X List. Reward ₦40, 300 users. Open List link, click follow, screenshot showing List following.' },
  { category: 'twitter', label: 'Twitter/X Manually Search & Follow', text: 'Organically search and follow X account. Reward ₦60, 250 users. Search account, follow, screenshot profile.' },
  { category: 'twitter', label: 'Twitter/X Post with Tag', text: 'Post a tweet tagging @brand_account. Reward ₦120, 150 users. Write tweet about the brand, tag them, screenshot tweet.' },
  { category: 'twitter', label: 'Twitter/X Profile Notification Turn On', text: 'Turn on notifications for X account. Reward ₦60, 300 users. Follow, click bell icon to turn on all posts notifications, screenshot page.' },

  // APP DOWNLOAD & SIGN UP (10 prompts)
  { category: 'app_download', label: 'Android App Download', text: 'Download app from Android Playstore. Reward ₦200, 150 users. Search app name, download and install, upload screenshot of home screen dashboard.' },
  { category: 'app_download', label: 'App Store Download iOS', text: 'Download iOS app from App Store. Reward ₦250, 100 users. Download and install app, open app, screenshot home page.' },
  { category: 'app_download', label: 'App Register Account', text: 'Download and register account. Reward ₦300, 150 users. Register profile, verify email/phone, screenshot verified profile page.' },
  { category: 'app_download', label: 'Referral Signup', text: 'Register account using referral link. Reward ₦250, 200 users. Sign up, verify email, screenshot referral sign up confirmation page.' },
  { category: 'app_download', label: 'App KYC Verification', text: 'Complete Tier 1 KYC registration. Reward ₦500, 100 users. Complete BVN/ID registration on app, screenshot account page showing Tier 1 status.' },
  { category: 'app_download', label: 'App Promo Code Use', text: 'Register on app using promo code. Reward ₦300, 150 users. Download app, register with code BONUS100, screenshot registration page.' },
  { category: 'app_download', label: 'App Transaction test', text: 'Perform deposit on app. Reward ₦1000, 50 users. Deposit ₦500 into wallet, screenshot successful transaction history logs.' },
  { category: 'app_download', label: 'App Feature Try', text: 'Create wallet address on app. Reward ₦300, 100 users. Download crypto wallet app, create address, screenshot generated address page.' },
  { category: 'app_download', label: 'App Review Playstore', text: 'Rate 5 stars and review app on Google Play. Reward ₦150, 200 users. Write positive review, screenshot review page with your name.' },
  { category: 'app_download', label: 'App Share Link Referral', text: 'Invite 1 friend using app referral code. Reward ₦500, 50 users. Share code, register 1 user, screenshot referral dashboard showing active user count.' },

  // REVIEWS & TELEGRAM (10 prompts)
  { category: 'reviews', label: 'Google Maps Review', text: 'Leave 5-star review on Google Maps location. Reward ₦150, 200 users. Write positive feedback about our office branch, screenshot review published.' },
  { category: 'reviews', label: 'Trustpilot Review', text: 'Write a Trustpilot product review. Reward ₦200, 100 users. Write detailed positive review about service, screenshot published review.' },
  { category: 'reviews', label: 'Product Hunt Upvote', text: 'Upvote product on Product Hunt. Reward ₦100, 300 users. Sign in, find brand campaign page, click Upvote, screenshot active upvote count.' },
  { category: 'telegram', label: 'Telegram Channel Join', text: 'Join Telegram Announcement Channel. Reward ₦40, 1000 users. Click link, join channel, submit screenshot showing channel chats.' },
  { category: 'telegram', label: 'Telegram Group Join', text: 'Join Telegram Discussion Group. Reward ₦45, 800 users. Join group, send greeting message, screenshot group chat showing your message.' },
  { category: 'telegram', label: 'Telegram Bot Start', text: 'Start Telegram Bot task. Reward ₦50, 600 users. Click link to open bot, click /start, screenshot bot start conversation.' },
  { category: 'telegram', label: 'Telegram Post Views', text: 'View pinned post on Telegram channel. Reward ₦20, 1500 users. Open channel, read pinned post, screenshot post with view eye icon.' },
  { category: 'reviews', label: 'App Store Review iOS', text: 'Leave 5-star review on iOS App Store. Reward ₦250, 100 users. Write review, submit screenshot of published review.' },
  { category: 'reviews', label: 'Sitejabber Review', text: 'Write positive Sitejabber review. Reward ₦150, 100 users. Review service, screenshot page.' },
  { category: 'telegram', label: 'Telegram Channel Share', text: 'Forward Telegram post to 5 friends. Reward ₦100, 200 users. Forward pinned post, screenshot forward dialog/chat logs.' }
]

export default function CreateTaskPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [caption, setCaption] = useState('')
  const [link, setLink] = useState('')
  const [assignedOfficer, setAssignedOfficer] = useState('')

  const { data: officersData } = useQuery<any>({
    queryKey: ['task-officers'],
    queryFn: () => apiClient.get('/tasks/task-officers'),
  })
  const officers = officersData?.success ? officersData.data : []
  const [instructions, setInstructions] = useState<string[]>([''])
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIdx(index)
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === index) return

    setInstructions(prev => {
      const list = [...prev]
      const draggedItem = list[draggedIdx]
      list.splice(draggedIdx, 1)
      list.splice(index, 0, draggedItem)
      return list
    })
    setDraggedIdx(index)
  }

  function handleDragEnd() {
    setDraggedIdx(null)
  }
  const [taskType, setTaskType] = useState('follow')
  const [targetPlatform, setTargetPlatform] = useState('instagram')
  const [timelineMs, setTimelineMs] = useState(24 * 60 * 60 * 1000)
  const [amount, setAmount] = useState('')
  const [numberOfUsersNeeded, setNumberOfUsersNeeded] = useState('')
  const [adminContact, setAdminContact] = useState('')
  const [targetCount, setTargetCount] = useState('')
  const [maxPerHour, setMaxPerHour] = useState('')

  const [aiPrompt, setAiPrompt] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [aiError, setAiError] = useState('')
  const recognitionRef = useRef<any>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showPromptRepo, setShowPromptRepo] = useState(false)

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setAiError('Speech recognition is not supported in this browser. Please use Chrome or Safari.')
      return
    }

    try {
      setAiError('')
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'

      rec.onstart = () => {
        setIsListening(true)
      }

      rec.onend = () => {
        setIsListening(false)
      }

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e)
        setAiError(`Voice input error: ${e.error}`)
        setIsListening(false)
      }

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript
        setAiPrompt(prev => (prev ? `${prev} ${text}` : text))
      }

      recognitionRef.current = rec
      rec.start()
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setAiError('Failed to start voice input.')
      setIsListening(false)
    }
  }

  const handleAiParse = async () => {
    if (!aiPrompt.trim()) return
    setIsParsing(true)
    setAiError('')
    try {
      const res = await apiClient.post('/admin/tasks/parse-ai', { text: aiPrompt.trim() }) as any
      if (res.success && res.data) {
        const d = res.data
        if (d.title) setTitle(d.title)
        if (d.description) setDescription(d.description)
        if (d.caption) setCaption(d.caption)
        if (d.link) setLink(d.link)
        if (d.instructions && d.instructions.length) {
          setInstructions(d.instructions)
        }
        if (d.taskType) setTaskType(d.taskType)
        if (d.targetPlatform) setTargetPlatform(d.targetPlatform)
        if (d.proofType) setProofType(d.proofType)
        if (d.acceptText !== undefined) {
          setAcceptText(d.acceptText)
          if (d.acceptText && d.textLabel) {
            setTextLabel(d.textLabel)
          } else {
            setTextLabel('')
          }
        }
        if (d.acceptNumber !== undefined) {
          setAcceptNumber(d.acceptNumber)
          if (d.acceptNumber && d.numberLabel) {
            setNumberLabel(d.numberLabel)
          } else {
            setNumberLabel('')
          }
        }
        if (d.acceptMultipleImages !== undefined) {
          setAcceptMultipleImages(d.acceptMultipleImages)
        }
        if (d.amount !== undefined) setAmount(String(d.amount))
        if (d.numberOfUsersNeeded !== undefined) setNumberOfUsersNeeded(String(d.numberOfUsersNeeded))
        if (d.maxPerHour !== undefined) setMaxPerHour(d.maxPerHour ? String(d.maxPerHour) : '')
        if (d.noExpiry !== undefined) setNoExpiry(d.noExpiry)
        
        setAiPrompt('')
      } else {
        setAiError(res.error ?? 'Failed to parse task input.')
      }
    } catch (err: any) {
      console.error('AI Parse failed:', err)
      setAiError(err?.response?.data?.error ?? 'Error communicating with AI service. Please try again.')
    } finally {
      setIsParsing(false)
    }
  }

  const applyPreset = (presetValue: string) => {
    if (presetValue === 'instagram-follow') {
      setTaskType('follow')
      setTargetPlatform('instagram')
      setTitle('Follow our Instagram page')
      setDescription('Follow the account at the target link and submit a screenshot showing the "Following" state.')
      setInstructions(['Click on the link to visit the Instagram page.', 'Click the "Follow" button.', 'Take a screenshot showing you followed the account.', 'Upload the screenshot as proof.'])
      setProofType('banner')
      setAcceptText(false)
      setTextLabel('')
      setAcceptNumber(false)
      setNumberLabel('')
      setAcceptMultipleImages(false)
    } else if (presetValue === 'tiktok-follow') {
      setTaskType('follow')
      setTargetPlatform('tiktok')
      setTitle('Follow our TikTok page')
      setDescription('Follow the user at the target link and submit a screenshot showing the "Following" state.')
      setInstructions(['Click on the link to visit the TikTok profile.', 'Click the "Follow" button.', 'Take a screenshot showing you followed.', 'Upload the screenshot.'])
      setProofType('banner')
      setAcceptText(false)
      setTextLabel('')
      setAcceptNumber(false)
      setNumberLabel('')
      setAcceptMultipleImages(false)
    } else if (presetValue === 'youtube-sub') {
      setTaskType('subscribe')
      setTargetPlatform('youtube')
      setTitle('Subscribe to our YouTube Channel')
      setDescription('Subscribe to the channel and turn on notifications, then upload a screenshot proof.')
      setInstructions(['Click on the link to go to the YouTube channel.', 'Click the "Subscribe" button.', 'Take a screenshot showing you are subscribed.', 'Upload the screenshot.'])
      setProofType('banner')
      setAcceptText(false)
      setTextLabel('')
      setAcceptNumber(false)
      setNumberLabel('')
      setAcceptMultipleImages(false)
    } else if (presetValue === 'whatsapp-status') {
      setTaskType('post-content')
      setTargetPlatform('whatsapp')
      setTitle('Post Promo on your WhatsApp Status')
      setDescription('Download the attached promo image, copy the caption, post it on your status, and submit a screenshot showing your views after at least 1 hour.')
      setInstructions(['Download the promotional image attached to the task.', 'Copy the caption provided.', 'Upload the image to your WhatsApp Status with the caption.', 'Leave it for at least 1 hour.', 'Take a screenshot showing the status post and views count, and submit it.'])
      setProofType('banner')
      setAcceptText(false)
      setTextLabel('')
      setAcceptNumber(false)
      setNumberLabel('')
      setAcceptMultipleImages(false)
    }
  }

  const [images, setImages] = useState<ImageEntry[]>([])
  const [uploadError, setUploadError] = useState('')
  const [proofType, setProofType] = useState<'banner' | 'url'>('banner')
  const [acceptText, setAcceptText] = useState(false)
  const [textLabel, setTextLabel] = useState('')
  const [acceptNumber, setAcceptNumber] = useState(false)
  const [numberLabel, setNumberLabel] = useState('')
  const [acceptMultipleImages, setAcceptMultipleImages] = useState(false)
  const [noExpiry, setNoExpiry] = useState(false)
  const [enableTargeting, setEnableTargeting] = useState(false)
  const [audience, setAudience] = useState<AudienceFilter>({ gender: [], employmentStatus: [], educationLevel: [], state: [], minAge: '', maxAge: '' })

  const isJetpot = taskType === 'jetpot'
  const isViews = taskType === 'views'

  const uploadImage = useMutation({
    mutationFn: ({ base64, mimeType }: { base64: string; mimeType: string }) =>
      apiClient.post('/admin/upload', { base64, mimeType }) as any,
  })

  const createTask = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post('/admin/tasks', body) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      router.push('/dashboard/tasks')
    },
  })

  function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) return
    setUploadError('')

    const toAdd = arr.slice(0, remaining)
    const oversized = toAdd.find(f => f.size > 10 * 1024 * 1024)
    if (oversized) {
      setUploadError('Each image must be under 10 MB.')
      return
    }

    toAdd.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        setImages(prev => [...prev, { file, preview: e.target?.result as string }])
      }
      reader.readAsDataURL(file)
    })
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setUploadError('')
  }

  function addInstruction() { setInstructions(prev => [...prev, '']) }
  function updateInstruction(idx: number, val: string) { setInstructions(prev => prev.map((s, i) => (i === idx ? val : s))) }
  function removeInstruction(idx: number) { setInstructions(prev => prev.filter((_, i) => i !== idx)) }

  const canSubmit =
    title.trim() &&
    description.trim() &&
    targetPlatform.trim() &&
    Number(amount) > 0 &&
    Number(numberOfUsersNeeded) > 0 &&
    (!isViews || Number(targetCount) > 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    let uploadedUrls: string[] = []

    if (images.length > 0) {
      try {
        const results = await Promise.all(
          images.map(({ preview }) => {
            const [header, base64] = preview.split(',')
            const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
            return uploadImage.mutateAsync({ base64, mimeType })
          })
        )
        uploadedUrls = results.map((r: any) => r.url)
      } catch {
        setUploadError('One or more image uploads failed. Please try again.')
        return
      }
    }

    const timeline = noExpiry ? undefined : new Date(Date.now() + timelineMs).toISOString()
    const filteredInstructions = instructions.map(s => s.trim()).filter(Boolean)

    createTask.mutate({
      title: title.trim(),
      description: description.trim(),
      caption: caption.trim() || undefined,
      link: link.trim() || undefined,
      instructions: filteredInstructions.length ? filteredInstructions : undefined,
      images: uploadedUrls.length ? uploadedUrls : undefined,
      taskType,
      targetPlatform,
      proofType,
      acceptText,
      textLabel: acceptText ? textLabel.trim() : undefined,
      acceptNumber,
      numberLabel: acceptNumber ? numberLabel.trim() : undefined,
      acceptMultipleImages,
      maxPerHour: maxPerHour.trim() ? parseInt(maxPerHour) : undefined,
      lifeline: noExpiry,
      amount,
      numberOfUsersNeeded,
      timeline,
      targetCount: targetCount.trim() ? targetCount : undefined,
      adminContact: adminContact.trim() || undefined,
      assignedOfficer: assignedOfficer || undefined,
      targetAudience: enableTargeting
        ? {
            ...(audience.gender.length ? { gender: audience.gender } : {}),
            ...(audience.employmentStatus.length ? { employmentStatus: audience.employmentStatus } : {}),
            ...(audience.educationLevel.length ? { educationLevel: audience.educationLevel } : {}),
            ...(audience.state.length ? { state: audience.state } : {}),
            ...(audience.minAge ? { minAge: Number(audience.minAge) } : {}),
            ...(audience.maxAge ? { maxAge: Number(audience.maxAge) } : {}),
          }
        : undefined,
    })
  }

  const isPending = uploadImage.isPending || createTask.isPending

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Create Task</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Set up a new social engagement or referral task</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* AI Task Assistant chatbot panel */}
        <div className="backdrop-blur-md bg-purple-950/10 border border-purple-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <h2 className="text-sm font-bold text-purple-300">AI Task Assistant</h2>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2.5 py-0.5 rounded-full">DeepSeek Powered</span>
          </div>
          
          <p className="text-xs text-zinc-400">
            Type or speak a task description to automatically pre-fill the form fields below.
          </p>

          {/* Collapsible Searchable Prompt Repository */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowPromptRepo(!showPromptRepo)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-500/20 bg-purple-950/10 hover:bg-purple-950/20 text-xs font-bold text-purple-300 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Prompt Templates Repository ({AI_PROMPT_EXAMPLES.length} Ready Prompts)
              </span>
              <span>{showPromptRepo ? 'Collapse ▲' : 'Expand ▼'}</span>
            </button>

            {showPromptRepo && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 max-h-[480px] overflow-y-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates (e.g. follow, views)..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50"
                  />
                  
                  {/* Category Dropdown */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="all">All Categories</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="app_download">App Downloads</option>
                    <option value="reviews">Reviews &amp; Ratings</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>

                {/* Prompt List */}
                <div className="space-y-2">
                  {(() => {
                    const filtered = AI_PROMPT_EXAMPLES.filter(p => {
                      const matchesSearch = p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.text.toLowerCase().includes(searchQuery.toLowerCase())
                      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
                      return matchesSearch && matchesCategory
                    })

                    if (filtered.length === 0) {
                      return <p className="text-center text-xs text-zinc-600 py-6">No matching prompts found.</p>
                    }

                    return (
                      <div className="grid grid-cols-1 gap-2">
                        {filtered.map((ex, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setAiPrompt(ex.text);
                              setAiError("");
                              setShowPromptRepo(false);
                            }}
                            className="p-3 rounded-lg border border-zinc-900 bg-zinc-900/40 hover:bg-purple-950/10 hover:border-purple-500/20 text-left text-zinc-350 hover:text-purple-200 transition-all flex flex-col gap-1.5 cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-bold text-xs text-purple-400">{ex.label}</span>
                              <span className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{ex.category.replace('_', ' ')}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-450 leading-relaxed italic">&ldquo;{ex.text}&rdquo;</span>
                          </button>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={aiPrompt}
                onChange={e => { setAiPrompt(e.target.value); setAiError(''); }}
                placeholder="Type your task details here or click the microphone to describe it by voice..."
                rows={3}
                className={`${inputCls} pr-12`}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening 
                      ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                      : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750'
                  }`}
                  title={isListening ? 'Stop voice input' : 'Start voice input'}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {aiError && <p className="text-xs text-red-450">{aiError}</p>}

            <button
              type="button"
              onClick={handleAiParse}
              disabled={isParsing || !aiPrompt.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-550 py-2.5 text-xs font-bold text-white transition disabled:opacity-40 shadow-lg shadow-purple-500/10 cursor-pointer"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating task details...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Fill Form with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Presets dropdown */}
        <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Quick Presets</h2>
          <div>
            <FieldLabel>Select Preset Template</FieldLabel>
            <select
              onChange={e => applyPreset(e.target.value)}
              defaultValue="custom"
              className={inputCls}
            >
              {PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500 mt-1.5">Selecting a template pre-populates details and instructions, which you can customize below.</p>
          </div>
        </div>

        {/* Task Assignment */}
        <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Task Assignment</h2>
          <div>
            <FieldLabel>Assign to Task Officer <span className="text-zinc-600 font-normal">(optional)</span></FieldLabel>
            <select
              value={assignedOfficer}
              onChange={e => setAssignedOfficer(e.target.value)}
              className={inputCls}
            >
              <option value="">Auto-distribute to available officers</option>
              {officers && officers.map((off: any) => (
                <option key={off.username} value={off.username}>
                  {off.name} (@{off.username})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-550 mt-1.5">
              Select an officer to manage this task and verify submissions. If none is selected, the system will distribute the task to available task officers automatically.
            </p>
          </div>
        </div>

        {/* Basic info */}
        <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Task Details</h2>

          <div>
            <FieldLabel required>Title</FieldLabel>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Post Kena promo on your WhatsApp Status" className={inputCls} />
          </div>

          <div>
            <FieldLabel required>Description</FieldLabel>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief overview of what the task is about..."
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <FieldLabel>Caption <span className="text-zinc-600 font-normal">(optional — text users copy and post)</span></FieldLabel>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Paste the exact caption users should copy to their post or status..."
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <FieldLabel>Link <span className="text-zinc-600 font-normal">(optional — profile, post, or page to act on)</span></FieldLabel>
            <input
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://..."
              type="url"
              className={inputCls}
            />
          </div>

          {/* Multi-image upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel>Images <span className="text-zinc-600 font-normal">(optional — up to {MAX_IMAGES})</span></FieldLabel>
              {images.length > 0 && (
                <span className="text-[11px] text-zinc-500">{images.length} / {MAX_IMAGES}</span>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-zinc-700/60 group aspect-video">
                    <img src={img.preview} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-zinc-300 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-dashed border-zinc-700/60 bg-zinc-800/30 cursor-pointer hover:border-purple-500/40 hover:bg-zinc-800/50 transition-colors"
              >
                <Upload className="w-5 h-5 text-zinc-500" />
                <p className="text-xs text-zinc-500 font-medium">Click or drag to add images</p>
                <p className="text-[11px] text-zinc-600">PNG · JPG · SVG · up to 10 MB each</p>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = '' }}
            />
            {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
          </div>
        </div>

        {/* Instructions */}
        <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-zinc-300">Step-by-step Instructions</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setInstructions([
                    "Click the target link to visit the platform page or profile.",
                    "Perform the designated action (follow, like, subscribe, post status, or download).",
                    "Take a clear screenshot showing the completed action (following state, liked post, status views, or downloaded app).",
                    "Submit the correct proof because our system automatically audits submissions, and fake/duplicate proofs lead to immediate account suspension.",
                    "Enter any requested text info (like your username or WhatsApp phone number) in the text box below.",
                    "Do not undo the action (e.g., unfollowing, unliking, or deleting status post) because automated account audits run daily.",
                    "Wait for review. Funds will be credited directly to your available balance upon validation."
                  ]);
                }}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load 7-Step Rules
              </button>
              <button
                type="button"
                onClick={addInstruction}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add step
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {instructions.map((step, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  draggedIdx === idx
                    ? 'opacity-30 scale-[0.98] border-purple-500/50 bg-purple-950/5'
                    : ''
                }`}
              >
                <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-zinc-650 hover:text-zinc-400 transition-colors shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-bold">
                  {idx + 1}
                </span>
                <input
                  value={step}
                  onChange={e => updateInstruction(idx, e.target.value)}
                  placeholder={`Step ${idx + 1}...`}
                  className={`${inputCls} flex-1`}
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(idx)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-600">Tell users exactly what to do, step by step.</p>
        </div>

        {/* Task config */}
        <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Task Configuration</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Task Type</FieldLabel>
              <select
                value={taskType}
                onChange={e => {
                  const t = e.target.value
                  setTaskType(t)
                  setTargetPlatform(t === 'use-app' ? '' : 'instagram')
                }}
                className={inputCls}
              >
                {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              {taskType === 'use-app' ? (
                <>
                  <FieldLabel required>App Name</FieldLabel>
                  <input
                    value={targetPlatform}
                    onChange={e => setTargetPlatform(e.target.value)}
                    placeholder="e.g. Kena, Moniass, OPay..."
                    className={inputCls}
                  />
                </>
              ) : (
                <>
                  <FieldLabel required>Target Platform</FieldLabel>
                  <select value={targetPlatform} onChange={e => setTargetPlatform(e.target.value)} className={inputCls}>
                    {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Proof method */}
          <div>
            <FieldLabel>Proof method</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProofType('banner')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  proofType === 'banner'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold">Image / Screenshot</p>
                  <p className="text-[10px] font-normal opacity-70 mt-0.5">User uploads a photo</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setProofType('url')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  proofType === 'url'
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                    : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                <LinkIcon className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold">URL / Link</p>
                  <p className="text-[10px] font-normal opacity-70 mt-0.5">User pastes a link</p>
                </div>
              </button>
            </div>
          </div>

          {/* Collect additional text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Collect Text</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Ask users to also submit a WhatsApp number, username, etc.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                <span className={`text-xs font-semibold transition-colors ${acceptText ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {acceptText ? 'On' : 'Off'}
                </span>
                <div
                  onClick={() => { setAcceptText(v => !v); if (acceptText) setTextLabel('') }}
                  className={`relative w-9 h-5 rounded-full transition-all ${acceptText ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${acceptText ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </label>
            </div>
            {acceptText && (
              <input
                value={textLabel}
                onChange={e => setTextLabel(e.target.value)}
                placeholder="e.g. WhatsApp Number, TikTok Username, Full Name..."
                className={inputCls}
              />
            )}
          </div>

          {/* Collect additional number */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Collect Number (Views / Watch Hours)</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Ask users to submit a numeric value like views count, watch hours, etc.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                <span className={`text-xs font-semibold transition-colors ${acceptNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {acceptNumber ? 'On' : 'Off'}
                </span>
                <div
                  onClick={() => { setAcceptNumber(v => !v); if (acceptNumber) setNumberLabel('') }}
                  className={`relative w-9 h-5 rounded-full transition-all ${acceptNumber ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${acceptNumber ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </label>
            </div>
            {acceptNumber && (
              <input
                value={numberLabel}
                onChange={e => setNumberLabel(e.target.value)}
                placeholder="e.g. Number of Views, Watch Hours, Retweet Count..."
                className={inputCls}
              />
            )}
          </div>

          {/* Accept multiple images */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Accept Multiple Screenshot Proofs</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Allow users to upload up to 5 screenshots instead of just one.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                <span className={`text-xs font-semibold transition-colors ${acceptMultipleImages ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {acceptMultipleImages ? 'On' : 'Off'}
                </span>
                <div
                  onClick={() => setAcceptMultipleImages(v => !v)}
                  className={`relative w-9 h-5 rounded-full transition-all ${acceptMultipleImages ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${acceptMultipleImages ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </label>
            </div>
          </div>
          <div>
            <FieldLabel required={isViews}>
              Minimum View Count {!isViews && <span className="text-zinc-650 font-normal">(optional)</span>}
            </FieldLabel>
            <input
              type="number"
              min="1"
              value={targetCount}
              onChange={e => setTargetCount(e.target.value)}
              placeholder={isViews ? "e.g. 1000 (required)" : "e.g. 50 (optional, e.g. for WhatsApp Status views)"}
              className={inputCls}
            />
            <p className="text-[11px] text-zinc-650 mt-1">
              {isViews 
                ? "Each user must reach this view count before submitting proof."
                : "The minimum views required on the user's status or post screenshot (useful for WhatsApp Status tasks)."}
            </p>
          </div>

          {isJetpot && (
            <div>
              <FieldLabel>Admin WhatsApp <span className="text-zinc-600 font-normal">(buyers message this number)</span></FieldLabel>
              <input value={adminContact} onChange={e => setAdminContact(e.target.value)} placeholder="+2348..." className={inputCls} />
            </div>
          )}
        </div>

        {/* Target Audience */}
        <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-300">Target Audience</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Restrict this task to specific users based on their profile</p>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <span className={`text-xs font-semibold transition-colors ${enableTargeting ? 'text-purple-400' : 'text-zinc-500'}`}>
                {enableTargeting ? 'Enabled' : 'Disabled'}
              </span>
              <div
                onClick={() => setEnableTargeting(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-all ${enableTargeting ? 'bg-purple-500' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enableTargeting ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </label>
          </div>

          {enableTargeting && (
            <div className="border border-zinc-700/60 rounded-xl bg-zinc-800/30 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">Select the criteria below. Leaving a section empty means no filter on that dimension.</p>
                {(audience.gender.length + audience.employmentStatus.length + audience.educationLevel.length + audience.state.length > 0 || audience.minAge || audience.maxAge) && (
                  <button
                    type="button"
                    onClick={() => setAudience({ gender: [], employmentStatus: [], educationLevel: [], state: [], minAge: '', maxAge: '' })}
                    className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors shrink-0 ml-4"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div>
                <FieldLabel>Age Range</FieldLabel>
                <div className="flex items-center gap-3">
                  <input type="number" min="1" max="100" value={audience.minAge} onChange={e => setAudience(a => ({ ...a, minAge: e.target.value }))} placeholder="Min age" className={`${inputCls} flex-1`} />
                  <span className="text-zinc-600 font-bold shrink-0">→</span>
                  <input type="number" min="1" max="100" value={audience.maxAge} onChange={e => setAudience(a => ({ ...a, maxAge: e.target.value }))} placeholder="Max age" className={`${inputCls} flex-1`} />
                </div>
              </div>

              <div>
                <FieldLabel>Gender</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {[['male','👨 Male'],['female','👩 Female'],['prefer_not_to_say','🤔 Prefer not to say']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setAudience(a => ({ ...a, gender: toggle(a.gender, val) }))}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${audience.gender.includes(val) ? 'bg-purple-500/15 border-purple-500/50 text-purple-300' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>Employment Status</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {[['student','🎓 Student'],['working','💼 Working'],['self_employed','🧑‍💻 Self-employed'],['unemployed','🔍 Unemployed']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setAudience(a => ({ ...a, employmentStatus: toggle(a.employmentStatus, val) }))}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${audience.employmentStatus.includes(val) ? 'bg-blue-500/15 border-blue-500/50 text-blue-300' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>Education Level</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {[['ssce','📝 SSCE/WAEC'],['university','🏛️ University'],['polytechnic','🔧 Polytechnic'],['college','📚 College of Edu.']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setAudience(a => ({ ...a, educationLevel: toggle(a.educationLevel, val) }))}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${audience.educationLevel.includes(val) ? 'bg-amber-500/15 border-amber-500/50 text-amber-300' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>State of Residence</FieldLabel>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {NIGERIAN_STATES.map(state => (
                    <button key={state} type="button" onClick={() => setAudience(a => ({ ...a, state: toggle(a.state, state) }))}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${audience.state.includes(state) ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-zinc-800/50 border-zinc-700/40 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}>
                      {state}
                    </button>
                  ))}
                </div>
                {audience.state.length > 0 && (
                  <p className="text-[11px] text-zinc-500 mt-1.5">{audience.state.length} state{audience.state.length > 1 ? 's' : ''} selected</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reward & timeline */}
        <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Reward &amp; Timeline</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Amount per User (₦)</FieldLabel>
              <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500" className={inputCls} />
            </div>
            <div>
              <FieldLabel required>Users Needed</FieldLabel>
              <input type="number" min="1" value={numberOfUsersNeeded} onChange={e => setNumberOfUsersNeeded(e.target.value)} placeholder="50" className={inputCls} />
            </div>
          </div>

          <div>
            <FieldLabel>Hourly Completion Limit <span className="text-zinc-600 font-normal">(optional — drip feed)</span></FieldLabel>
            <input type="number" min="1" value={maxPerHour} onChange={e => setMaxPerHour(e.target.value)} placeholder="e.g. 20 (leave blank for unlimited)" className={inputCls} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel>Task Duration</FieldLabel>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className={`text-xs font-semibold transition-colors ${noExpiry ? 'text-violet-400' : 'text-zinc-500'}`}>No expiry</span>
                <div onClick={() => setNoExpiry(v => !v)} className={`relative w-9 h-5 rounded-full transition-all ${noExpiry ? 'bg-violet-500' : 'bg-zinc-700'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${noExpiry ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <Infinity className={`w-4 h-4 transition-colors ${noExpiry ? 'text-violet-400' : 'text-zinc-600'}`} />
              </label>
            </div>
            <select
              value={timelineMs}
              onChange={e => setTimelineMs(Number(e.target.value))}
              disabled={noExpiry}
              className={`${inputCls} ${noExpiry ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {TIMELINE_OPTIONS.map(opt => (
                <option key={opt.ms} value={opt.ms}>{opt.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-600 mt-1.5">
              {noExpiry
                ? 'Task stays active until you manually close it.'
                : `Task closes ${TIMELINE_OPTIONS.find(o => o.ms === timelineMs)?.label} from the moment it is created`}
            </p>
          </div>

          {Number(amount) > 0 && Number(numberOfUsersNeeded) > 0 && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400">
                Total payout exposure:{' '}
                <span className="font-semibold text-purple-300">
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(
                    Number(amount) * Number(numberOfUsersNeeded)
                  )}
                </span>
              </p>
            </div>
          )}
        </div>

        {createTask.error && (
          <p className="text-sm text-red-400 px-1">{(createTask.error as any)?.response?.data?.error ?? 'Failed to create task'}</p>
        )}

        <div className="flex items-center justify-end gap-3 pb-4">
          <Button variant="outline" size="md" type="button" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={isPending} disabled={!canSubmit}>
            {uploadImage.isPending ? 'Uploading images…' : createTask.isPending ? 'Creating task…' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  )
}
