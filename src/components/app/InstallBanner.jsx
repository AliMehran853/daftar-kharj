import { Download, Share, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import Button from '@/components/ui/Button'

export default function InstallBanner() {
  const {
    canInstall,
    showIOSHint,
    showInAppHint,
    dismissed,
    promptInstall,
    dismiss,
  } = usePWAInstall()

  const show = !dismissed && (canInstall || showIOSHint || showInAppHint)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-24 lg:bottom-6 inset-x-3 z-30 pointer-events-none"
        >
          <div className="pointer-events-auto max-w-md mx-auto bg-card border border-border rounded-2xl p-3.5 shadow-float">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-2xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
                {showInAppHint ? <Share size={18} /> : <Download size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                {showInAppHint ? (
                  <>
                    <div className="font-semibold text-[13.5px] text-fg">
                      برای نصب، در Chrome باز کن
                    </div>
                    <div className="text-[11.5px] text-fg-muted mt-1 leading-relaxed">
                      روی منوی مرورگر بزن و «Open in Chrome» یا «Open in
                      Safari» را انتخاب کن.
                    </div>
                  </>
                ) : showIOSHint ? (
                  <>
                    <div className="font-semibold text-[13.5px] text-fg">
                      نصب دفتر خرج روی iPhone
                    </div>
                    <div className="text-[11.5px] text-fg-muted mt-1 leading-relaxed">
                      روی دکمه‌ی اشتراک‌گذاری
                      <Share size={11} className="inline mx-1 align-middle" />
                      بزن و «Add to Home Screen» را انتخاب کن.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-[13.5px] text-fg">
                      دفتر خرج را نصب کن
                    </div>
                    <div className="text-[11.5px] text-fg-muted mt-1">
                      دسترسی سریع از صفحه‌ی خانه، بدون نیاز به اینترنت.
                    </div>
                  </>
                )}

                {canInstall && !showInAppHint && !showIOSHint && (
                  <Button
                    size="sm"
                    onClick={promptInstall}
                    className="mt-2.5"
                  >
                    نصب کن
                  </Button>
                )}
              </div>
              <button
                onClick={dismiss}
                className="size-7 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg-muted transition active:scale-90 shrink-0"
                aria-label="بستن"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}