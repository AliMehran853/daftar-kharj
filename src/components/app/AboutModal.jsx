import {
  Code2,
  MessageCircle,
  Phone,
  ExternalLink,
  MapPin,
  Send,
  Lightbulb,
  Sparkles,
  Heart,
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { APP_NAME, APP_VERSION, APP_TAGLINE } from '@/data/constants'
import { cn } from '@/lib/utils'

const DEV = {
  name: 'علی مهران',
  role: 'توسعه‌دهنده وب و فرانت‌اند',
  location: 'کابل، افغانستان',
  phone: '+93773054488',
  whatsapp: '+93773054488',
  github: 'https://github.com/AliMehran853',
  initials: 'AM',
}

/* رنگ ثابت برای گیت‌هاب — توی هر دو تم دیده می‌شه */
const GITHUB_COLOR = '#24292F'

const SKILLS = [
  'React',
  'JavaScript',
  'Tailwind CSS',
  'Vite',
  'Git & GitHub',
  'Vercel',
  'PWA',
]

const BIO =
  'توسعه‌دهنده‌ی فرانت‌اند ساکن کابل، با تجربه‌ی ساخت اپلیکیشن‌های وب مدرن و واکنش‌گرا. علاقه‌مند به طراحی رابط‌های کاربری تمیز، انیمیشن‌های نرم و معماری کد قشنگ. در حال گسترش مهارت‌ها به سمت TypeScript، Next.js و توسعه‌ی Full-Stack.'

export default function AboutModal({ open, onClose }) {
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      'سلام علی جان، از «دفتر خرج» استفاده می‌کنم و این پیام رو از خود اپ فرستادم.'
    )
    window.open(
      `https://wa.me/${DEV.whatsapp.replace('+', '')}?text=${text}`,
      '_blank'
    )
  }

  const handleWhatsAppFeedback = () => {
    const text = encodeURIComponent(
      'سلام علی جان،\n\nمی‌خواستم پیشنهاد یا مشکلی رو درباره‌ی اپ «دفتر خرج» بگم:\n\n'
    )
    window.open(
      `https://wa.me/${DEV.whatsapp.replace('+', '')}?text=${text}`,
      '_blank'
    )
  }

  const handlePhone = () => {
    window.location.href = `tel:${DEV.phone}`
  }

  const handleGithub = () => {
    window.open(DEV.github, '_blank')
  }

  return (
    <Modal open={open} onClose={onClose} title="درباره‌ی دفتر خرج">
      <div className="space-y-5 -mt-1">
        {/* کارت توسعه‌دهنده */}
        <div
          className="rounded-card-lg p-4 relative overflow-hidden"
          style={{
            background: 'var(--gradient-brand)',
            boxShadow: 'var(--hero-shadow)',
          }}
        >
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[140%] h-40 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center top, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)',
              zIndex: 0,
            }}
          />

          <div
            className="relative flex items-center gap-3"
            style={{ zIndex: 1 }}
          >
            <div
              className="size-16 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255, 255, 255, 0.28)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.20)',
              }}
            >
              {DEV.initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-[16px] truncate">
                {DEV.name}
              </div>
              <div className="text-[12px] text-white/85 mt-0.5 truncate">
                {DEV.role}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-white/70 mt-1">
                <MapPin size={11} />
                <span>{DEV.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* درباره من */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-primary" />
            <h3 className="text-sm font-semibold text-text">درباره من</h3>
          </div>
          <p className="text-[12.5px] text-text-secondary leading-[1.9] text-justify">
            {BIO}
          </p>
        </div>

        {/* مهارت‌ها */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Code2 size={14} className="text-saving" />
            <h3 className="text-sm font-semibold text-text">مهارت‌ها</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{
                  background:
                    'color-mix(in srgb, var(--saving) 12%, transparent)',
                  color: 'var(--saving)',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* راه‌های ارتباطی */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Send size={14} className="text-income" />
            <h3 className="text-sm font-semibold text-text">در تماس باش</h3>
          </div>

          <div className="space-y-2">
            {/* واتساپ */}
            <button
              onClick={handleWhatsApp}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-btn',
                'transition press-sm text-right'
              )}
              style={{
                background:
                  'color-mix(in srgb, var(--income) 10%, transparent)',
              }}
            >
              <div
                className="size-10 rounded-full flex items-center justify-center shrink-0 text-white"
                style={{
                  background: '#25D366',
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.30)',
                }}
              >
                <MessageCircle size={18} strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-text">
                  واتساپ
                </div>
                <div
                  className="text-[11px] font-medium tabular-nums mt-0.5"
                  style={{ color: 'var(--income)' }}
                  dir="ltr"
                >
                  {DEV.whatsapp}
                </div>
              </div>
              <span
                className="text-[11px] font-medium shrink-0"
                style={{ color: 'var(--income)' }}
              >
                پیام بده
              </span>
            </button>

            {/* تماس */}
            <button
              onClick={handlePhone}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-btn',
                'transition press-sm text-right'
              )}
              style={{
                background:
                  'color-mix(in srgb, var(--primary) 10%, transparent)',
              }}
            >
              <div
                className="size-10 rounded-full flex items-center justify-center shrink-0 text-white"
                style={{
                  background: 'var(--primary)',
                  boxShadow: '0 2px 8px rgba(24, 59, 112, 0.30)',
                }}
              >
                <Phone size={17} strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-text">
                  تماس تلفنی
                </div>
                <div
                  className="text-[11px] font-medium tabular-nums mt-0.5"
                  style={{ color: 'var(--primary)' }}
                  dir="ltr"
                >
                  {DEV.phone}
                </div>
              </div>
              <span
                className="text-[11px] font-medium shrink-0"
                style={{ color: 'var(--primary)' }}
              >
                تماس
              </span>
            </button>

            {/* گیت‌هاب */}
            <button
              onClick={handleGithub}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-btn',
                'transition press-sm text-right'
              )}
              style={{
                background: 'color-mix(in srgb, #24292F 10%, transparent)',
              }}
            >
              <div
                className="size-10 rounded-full flex items-center justify-center shrink-0 text-white"
                style={{
                  background: GITHUB_COLOR,
                  boxShadow: '0 2px 8px rgba(36, 41, 47, 0.40)',
                }}
              >
                <ExternalLink size={17} strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-text">
                  گیت‌هاب
                </div>
                <div
                  className="text-[11px] text-text-muted mt-0.5 truncate"
                  dir="ltr"
                >
                  github.com/AliMehran853
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* پیشنهاد / انتقاد */}
        <button
          onClick={handleWhatsAppFeedback}
          className={cn(
            'w-full flex items-start gap-3 p-3.5 rounded-btn',
            'transition press-sm text-right'
          )}
          style={{
            background:
              'color-mix(in srgb, var(--warning) 12%, transparent)',
            border:
              '1px solid color-mix(in srgb, var(--warning) 25%, transparent)',
          }}
        >
          <div
            className="size-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background:
                'color-mix(in srgb, var(--warning) 20%, transparent)',
              color: 'var(--warning)',
            }}
          >
            <Lightbulb size={18} strokeWidth={2.2} />
          </div>
          <div className="flex-1 text-right">
            <div
              className="text-[13px] font-semibold"
              style={{ color: 'var(--warning)' }}
            >
              پیشنهاد یا انتقاد
            </div>
            <div className="text-[11.5px] text-text-secondary mt-1 leading-relaxed">
              مشکل یا ایده‌ای داری؟ خوشحال می‌شم بشنوم. روی همین دکمه بزن تا
              پیامت رو مستقیم توی واتساپ بنویسی.
            </div>
          </div>
        </button>

        {/* اطلاعات اپ */}
        <div className="rounded-card p-4 text-center neu-raised-sm">
          <div className="text-[13px] font-bold text-text mb-1">
            {APP_NAME}
          </div>
          <div className="text-[11px] text-text-muted mb-2">
            {APP_TAGLINE}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10">
            <Sparkles size={11} className="text-primary" />
            <span className="text-[11px] font-medium text-primary tabular-nums">
              نسخه {APP_VERSION}
            </span>
          </div>
        </div>

        {/* پاصفحه */}
        <div className="pt-2 border-t border-border text-center">
          <p className="text-[11px] text-text-muted flex items-center justify-center gap-1.5 pt-3">
            ساخته شده با
            <Heart size={11} className="text-expense fill-expense" />
            در افغانستان
          </p>
        </div>
      </div>
    </Modal>
  )
}