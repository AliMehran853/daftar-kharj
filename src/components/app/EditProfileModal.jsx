import { useEffect, useState } from 'react'
import { User, IdCard } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'

export default function EditProfileModal({ open, onClose }) {
  const firstName = useSettingsStore((s) => s.firstName)
  const lastName = useSettingsStore((s) => s.lastName)
  const updateMany = useSettingsStore((s) => s.updateMany)
  const showToast = useUIStore((s) => s.showToast)

  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setFirst(firstName || '')
      setLast(lastName || '')
    }
  }, [open, firstName, lastName])

  const handleSave = async () => {
    if (!first.trim()) {
      showToast('اسم را وارد کن', 'error')
      return
    }
    setSaving(true)
    try {
      await updateMany({
        firstName: first.trim(),
        lastName: last.trim(),
        userName: `${first.trim()} ${last.trim()}`.trim(),
      })
      showToast('پروفایل به‌روزرسانی شد', 'success')
      onClose?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="ویرایش پروفایل">
      <div className="space-y-3">
        <Input
          label="اسم"
          icon={User}
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          placeholder="مثلاً شریف"
          maxLength={30}
        />
        <Input
          label="تخلص (اختیاری)"
          icon={IdCard}
          value={last}
          onChange={(e) => setLast(e.target.value)}
          placeholder="مثلاً محمدی"
          maxLength={30}
        />
        <Button full loading={saving} onClick={handleSave} className="mt-2">
          ذخیره
        </Button>
      </div>
    </Modal>
  )
}