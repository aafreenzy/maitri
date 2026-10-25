import { toPng } from 'html-to-image';

export type ShareOutcome = 'shared' | 'downloaded';

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
