import { useUIStore } from '@/store/useUIStore'
import QuickAddSheet from './QuickAddSheet'
import TransferSheet from './TransferSheet'
import PinSetupSheet from './PinSetupSheet'
import BackupSheet from './BackupSheet'
import DatePickerModal from './DatePickerModal'

export default function SheetHost() {
  const sheet = useUIStore((s) => s.sheet)
  const payload = useUIStore((s) => s.sheetPayload)
  const closeSheet = useUIStore((s) => s.closeSheet)

  const datePicker = useUIStore((s) => s.datePicker)
  const closeDatePicker = useUIStore((s) => s.closeDatePicker)

  return (
    <>
      <QuickAddSheet
        open={sheet === 'quick-add'}
        payload={payload}
        onClose={closeSheet}
      />
      <TransferSheet
        open={sheet === 'transfer'}
        payload={payload}
        onClose={closeSheet}
      />
      <PinSetupSheet
        open={sheet === 'pin-setup'}
        payload={payload}
        onClose={closeSheet}
      />
      <BackupSheet open={sheet === 'backup'} onClose={closeSheet} />

      {/* DatePicker جدا از Drawer — بالاترین لایه */}
      <DatePickerModal
        open={!!datePicker}
        value={datePicker?.value}
        onSelect={datePicker?.onSelect}
        onClose={closeDatePicker}
      />
    </>
  )
}