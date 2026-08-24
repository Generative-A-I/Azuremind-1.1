import { SlidersHorizontal } from 'lucide-react'
import type { EffortLevel } from '../types'

type Props = {
  value: EffortLevel
  onChange: (value: EffortLevel) => void
}

export function EffortSelector({ value, onChange }: Props) {
  return (
    <label className="effort-control">
      <span className="sr-only">Effort Level</span>
      <SlidersHorizontal size={15} aria-hidden="true" />
      <select value={value} onChange={(event) => onChange(event.target.value as EffortLevel)} aria-label="Effort Level">
        {(['Extra', 'High', 'Normal', 'Low'] as EffortLevel[]).map((level) => <option key={level} value={level}>{level} effort</option>)}
      </select>
    </label>
  )
}
