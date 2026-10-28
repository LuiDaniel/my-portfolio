import { parseRichText } from '@/lib/rich-text';

/** Texto de content/ con **negrita** (sin HTML). `strongClassName` da estilo a lo resaltado. */
export function RichText({ text, strongClassName }: { text: string; strongClassName?: string }) {
  return parseRichText(text).map((segment, i) =>
    segment.strong ? (
      <strong key={i} className={strongClassName}>
        {segment.text}
      </strong>
    ) : (
      segment.text
    ),
  );
}
