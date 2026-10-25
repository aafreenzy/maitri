import { toPng } from 'html-to-image';

export type ShareOutcome = 'shared' | 'downloaded';
export type TextShareOutcome = 'shared' | 'copied';

export async function slipToBlob(node: HTMLElement, render: typeof toPng = toPng): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const url = await render(node, { pixelRatio: 1.5, backgroundColor: '#ffffff', cacheBust: false });
  return (await fetch(url)).blob();
}

export async function shareSlip(node: HTMLElement, render: typeof toPng = toPng): Promise<ShareOutcome> {
  const blob = await slipToBlob(node, render);
  const file = new File([blob], 'maitri-slip.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
    return 'shared';
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'maitri-slip.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return 'downloaded';
}

export interface SlipTextParts {
  title: string;
  lines: { label: string; value: string }[];
  footer: string;
}

/** Plain text version of the slip for messages. No name, no phone number, only what the slip already shows. */
export function buildSlipText(p: SlipTextParts): string {
  return [p.title, '', ...p.lines.map((l) => `${l.label}: ${l.value}`), '', p.footer].join('\n');
}

/** Opens the phone's share sheet with the text. Where that is missing, copies the text instead. */
export async function shareText(text: string): Promise<TextShareOutcome> {
  if (typeof navigator.share === 'function') {
    await navigator.share({ text });
    return 'shared';
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
}
