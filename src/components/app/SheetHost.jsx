import { useUIStore } from '@/store/useUIStore'
import QuickAddSheet from './QuickAddSheet'
import TransferSheet from './TransferSheet'
import PinSetupSheet from './PinSetupSheet'
import BackupSheet from './BackupSheet'

export default function SheetHost() {
  const sheet = useUIStore((s) => s.sheet)
  const payload = useUIStore((s) => s.sheetPayload)
  const closeSheet = useUIStore((s) => s.closeSheet)

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
      <BackupSheet
        open={sheet === 'backup'}
        onClose={closeSheet}
      />
    </>
  )
}