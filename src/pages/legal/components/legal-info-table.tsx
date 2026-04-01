import { useTranslation } from 'react-i18next';

interface LegalInfoTableProps {
  rows: Array<{ labelKey: string; valueKey: string }>;
  delay?: number;
}

export function LegalInfoTable({ rows }: LegalInfoTableProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-border/30 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="sr-only">
          <tr>
            <th scope="col">{t('common.label')}</th>
            <th scope="col">{t('common.value')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.labelKey} className="border-b border-border/20 last:border-0">
              <th scope="row" className="px-3 py-2 font-medium text-muted-foreground/80 w-1/3 text-left">
                {t(row.labelKey)}
              </th>
              <td className="px-3 py-2">{t(row.valueKey)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
