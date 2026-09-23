import { Heart, Shield, WifiOff, Database } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { APP_NAME, APP_VERSION, APP_TAGLINE } from '@/data/constants'

export default function AboutModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="درباره‌ی دفتر خرج">
      <div className="space-y-4">
        <div className="text-center">
          <img
            src="/icons/logo.png"
            alt={APP_NAME}
            className="size-20 mx-auto rounded-3xl bg-brand-soft object-cover"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <h3 className="mt-3 text-xl font-bold text-fg">{APP_NAME}</h3>
          <p className="text-xs text-fg-muted mt-1">{APP_TAGLINE}</p>
          <p className="text-xs text-brand font-medium mt-1">
            نسخه {APP_VERSION}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Feature icon={Shield} text="کاملاً آفلاین و امن روی گوشی خودت" />
          <Feature icon={Database} text="داده‌ها در IndexedDB ذخیره می‌شوند" />
          <Feature icon={WifiOff} text="بدون نیاز به اینترنت کار می‌کند" />
        </div>

        <div className="pt-4 border-t border-border text-center">
          <p className="text-xs text-fg-muted flex items-center justify-center gap-1.5">
            ساخته شده با
            <Heart size={12} className="text-danger fill-danger" />
            در افغانستان
          </p>
        </div>
      </div>
    </Modal>
  )
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-btn bg-bg">
      <div className="size-9 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <span className="text-[13px] text-fg-secondary">{text}</span>
    </div>
  )
}