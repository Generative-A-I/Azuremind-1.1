import { Cpu } from 'lucide-react'
import type { AzuremindVersion } from '../types'

type Props = { value: AzuremindVersion; onChange: (value: AzuremindVersion) => void }

export function ModelSelector({ value, onChange }: Props) {
  return <label className="model-control">
    <span className="sr-only">Azuremind model</span>
    <Cpu size={15} aria-hidden="true" />
    <select value={value} onChange={(event) => onChange(event.target.value as AzuremindVersion)} aria-label="Azuremind model">
      {(['1.0', '1.1', '1.2', '2.0'] as AzuremindVersion[]).map((version) => <option key={version} value={version}>Azuremind {version}</option>)}
    </select>
  </label>
}
