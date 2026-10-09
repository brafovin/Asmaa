import { AUFTRAG_STATUS_LABEL, type AuftragStatus } from '../../shared/types.ts';

export default function StatusBadge({ status }: { status: AuftragStatus }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-punkt" aria-hidden="true" />
      {AUFTRAG_STATUS_LABEL[status]}
    </span>
  );
}
