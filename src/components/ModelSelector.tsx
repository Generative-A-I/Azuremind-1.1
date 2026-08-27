import { Cpu } from 'lucide-react'
import type { AzuremindVersion } from '../types'

type Props = { value: AzuremindVersion; isDeveloper: boolean; onChange: (value: AzuremindVersion) => void }

export function ModelSelector({ value, isDeveloper, onChange }: Props) {
  return <label className="model-control">
    <span className="sr-only">Cobalt model</span>
    <Cpu size={15} aria-hidden="true" />
    <select value={value} onChange={(event) => onChange(event.target.value as AzuremindVersion)} aria-label="Cobalt model">
      {(['1.0', '1.1', '1.2', '2.0'] as AzuremindVersion[]).concat(isDeveloper ? ['dev'] : []).map((version) => <option key={version} value={version}>Cobalt {version === 'dev' ? 'Dev' : version}</option>)}
    </select>
  </label>
}
