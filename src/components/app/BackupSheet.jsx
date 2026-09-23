import { useRef, useState } from 'react'
import { Drawer } from 'vaul'
import { Download, Upload, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { exportBackup, restoreBackup } from '@/lib/backup'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useAuthStore } from '@/store/useAuthStore'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function BackupSheet({ open, onClose }) {
  const fileRef = useRef(null)
  const showToast = useUIStore((s) => s.showToast)
  const triggerRefresh = useUIStore((s) => s.triggerRefresh)
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const refreshAuth = useAuthStore((s) => s.refresh)

  const [exporting, setExporting] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [restoring, setRestoring] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const { filename } = await exportBackup()
      showToast('فایل پشتیبان دانلود شد', 'success')
    } catch (e) {
      console.error(e)
      showToast('خطا در ساخت پشتیبان', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handlePickFile = () => fileRef.current?.click()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setPendingFile(file)
    e.target.value = ''
  }

  const confirmRestore = async () => {
    if (!pendingFile) return
    setRestoring(true)
    try {
      const result = await restoreBackup(pendingFile)
      await Promise.all([loadSettings(), refreshAuth()])
      triggerRefresh()
      showToast(
        `${result.transactions} تراکنش بازیابی شد`,
        'success'
      )
      setPendingFile(null)
      onClose?.()
    } catch (err) {
      console.error(err)
      showToast(err.message || 'خطا در بازیابی', 'error')
      setPendingFile(null)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <>
      <Drawer.Root
        open={open}
        onOpenChange={(o) => !o && onClose?.()}
        shouldScaleBackground={false}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Drawer.Content
            className={cn(
              'fixed bottom-0 inset-x-0 z-50',
              'bg-card border-t border-border',
              'rounded-t-[28px]',
              'flex flex-col',
              'focus:outline-none'
            )}
          >
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-border" />
            </div>

            <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
              <Drawer.Title className="text-lg font-semibold text-fg">
                پشتیبان‌گیری
              </Drawer.Title>
              <button
                onClick={onClose}
                className="size-9 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg-muted transition active:scale-95"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-3">
              <p className="text-xs text-fg-muted leading-relaxed">
                فایل پشتیبان شامل تمام تراکنش‌ها، دسته‌ها و تنظیمات است. آن را
                در یک جای امن (Google Drive، تلگرام، ایمیل) نگه‌دار.
              </p>

              <button
                onClick={handleExport}
                disabled={exporting}
                className={cn(
                  'w-full p-4 rounded-btn border border-border bg-card',
                  'flex items-center gap-3 text-right transition',
                  'hover:bg-brand-soft/30 active:scale-[0.98]',
                  'disabled:opacity-50'
                )}
              >
                <div className="size-11 rounded-2xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <Download size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-fg">
                    {exporting ? 'در حال ساخت…' : 'خروجی گرفتن'}
                  </div>
                  <div className="text-[11px] text-fg-muted mt-0.5">
                    ذخیره‌ی همه‌ی داده‌ها در یک فایل JSON
                  </div>
                </div>
              </button>

              <button
                onClick={handlePickFile}
                className={cn(
                  'w-full p-4 rounded-btn border border-border bg-card',
                  'flex items-center gap-3 text-right transition',
                  'hover:bg-brand-soft/30 active:scale-[0.98]'
                )}
              >
                <div className="size-11 rounded-2xl bg-info-soft text-info flex items-center justify-center shrink-0">
                  <Upload size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-fg">بازیابی از فایل</div>
                  <div className="text-[11px] text-fg-muted mt-0.5">
                    جایگزینی داده‌های فعلی با فایل پشتیبان
                  </div>
                </div>
              </button>

              <div className="flex items-start gap-2 p-3 rounded-btn bg-danger-soft/60 border border-danger/20">
                <AlertTriangle size={16} className="text-danger shrink-0 mt-0.5" />
                <p className="text-[11px] text-danger leading-relaxed">
                  هنگام بازیابی، همه‌ی داده‌های فعلی پاک می‌شوند و داده‌های فایل
                  جایگزین می‌شوند.
                </p>
              </div>
            </div>

            <div className="pb-safe" />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      <ConfirmModal
        open={!!pendingFile}
        onClose={() => setPendingFile(null)}
        onConfirm={confirmRestore}
        title="بازیابی از فایل؟"
        description="همه‌ی داده‌های فعلی پاک و با محتوای فایل جایگزین می‌شوند. مطمئنی؟"
        confirmLabel="بله، بازیابی کن"
        variant="danger"
        loading={restoring}
      />
    </>
  )
}