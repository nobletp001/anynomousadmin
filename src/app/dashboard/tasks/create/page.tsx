'use client'

import React, { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api-client'
import { Button } from '@/components/ui'
import { ArrowLeft, Plus, Trash2, Upload, X, Info, Link as LinkIcon, Image as ImageIcon, Infinity } from 'lucide-react'

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

export default function CreateTaskPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [caption, setCaption] = useState('')
  const [link, setLink] = useState('')
  const [instructions, setInstructions] = useState<string[]>([''])
  const [taskType, setTaskType] = useState('follow')
  const [targetPlatform, setTargetPlatform] = useState('instagram')
  const [timelineMs, setTimelineMs] = useState(24 * 60 * 60 * 1000)
  const [amount, setAmount] = useState('')
  const [numberOfUsersNeeded, setNumberOfUsersNeeded] = useState('')
  const [adminContact, setAdminContact] = useState('')
  const [targetCount, setTargetCount] = useState('')

  const [images, setImages] = useState<ImageEntry[]>([])
  const [uploadError, setUploadError] = useState('')
  const [proofType, setProofType] = useState<'banner' | 'url'>('banner')
  const [acceptText, setAcceptText] = useState(false)
  const [textLabel, setTextLabel] = useState('')
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
      textLabel: acceptText ? textLabel.trim() || undefined : undefined,
      lifeline: noExpiry,
      amount,
      numberOfUsersNeeded,
      timeline,
      targetCount: isViews ? targetCount : undefined,
      adminContact: adminContact.trim() || undefined,
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
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300">Step-by-step Instructions</h2>
            <button
              type="button"
              onClick={addInstruction}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add step
            </button>
          </div>

          <div className="space-y-2">
            {instructions.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
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
                <p className="text-[11px] text-zinc-600 mt-0.5">Ask users to also submit a WhatsApp number, username, etc.</p>
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

          {isViews && (
            <div>
              <FieldLabel required>Number of views needed</FieldLabel>
              <input
                type="number"
                min="1"
                value={targetCount}
                onChange={e => setTargetCount(e.target.value)}
                placeholder="e.g. 1000"
                className={inputCls}
              />
              <p className="text-[11px] text-zinc-600 mt-1">Each user must reach this view count before submitting proof.</p>
            </div>
          )}

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
