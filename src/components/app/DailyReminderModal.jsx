import { Bell } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useUIStore } from '@/store/useUIStore'

export default function DailyReminderModal() {
  const modal = useUIStore((s) => s.modal)
  const closeModal = useUIStore((s) => s.closeModal)
  const openSheet = useUIStore((s) => s.openSheet)

  const open = modal === 'daily-reminder'

  const handleNotYet = () => {
    closeModal()
    setTimeout(() => {
      openSheet('quick-add', { tab: 'expense' })
    }, 220)
  }

  return (
    <Modal
      open={open}
      onClose={closeModal}
      showClose={false}
      className="max-w-sm"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative size-16 rounded-full bg-brand-soft text-brand flex items-center justify-center mb-4">
          <Bell size={28} className="relative z-10" />
          <span className="absolute inset-0 rounded-full border-2 border-brand/30 animate-ping" />
        </div>

        <h3 className="text-lg font-semibold text-fg mb-1.5">
          ثبت روزانه فراموش نشود
        </h3>
        <p className="text-sm text-fg-secondary leading-relaxed">
          از آخرین ثبت شما بیش از ۲۴ ساعت گذشته. آیا در این مدت درآمد یا
          مصرف جدیدی داشته‌اید؟
        </p>

        <div className="grid grid-cols-2 gap-2 w-full mt-5">
          <Button variant="secondary" onClick={closeModal}>
            بله، ثبت کرده‌ام
          </Button>
          <Button variant="primary" onClick={handleNotYet}>
            خیر، الان ثبت کنم
          </Button>
        </div>
      </div>
    </Modal>
  )
}