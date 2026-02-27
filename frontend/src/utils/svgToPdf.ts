// SVG to PDF conversion utility using canvas rendering

export interface DrawingPage {
  title: string;
  svgString: string;
}

function svgToCanvas(svgString: string, width: number, height: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    img.src = url;
  });
}

export async function generateGAPdf(pages: DrawingPage[], projectName: string): Promise<void> {
  const PAGE_W = 800;
  const PAGE_H = 600;

  // Build a multi-page HTML document and print it
  // We'll use a data URL approach with a hidden iframe
  const canvases: HTMLCanvasElement[] = [];
  for (const page of pages) {
    const canvas = await svgToCanvas(page.svgString, PAGE_W, PAGE_H);
    canvases.push(canvas);
  }

  // Create a printable HTML page
  const imgDataUrls = canvases.map(c => c.toDataURL('image/png'));

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>General Arrangement Drawings - ${projectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0f172a; }
    .page { 
      width: 800px; 
      height: 600px; 
      page-break-after: always; 
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .page:last-child { page-break-after: avoid; }
    img { width: 800px; height: 600px; display: block; }
    @page { size: landscape; margin: 0; }
  </style>
</head>
<body>
  ${imgDataUrls.map((url, i) => `<div class="page"><img src="${url}" alt="${pages[i].title}"/></div>`).join('\n')}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `General_Arrangement_Drawings_${projectName.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
