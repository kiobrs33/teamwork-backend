// import { Injectable } from '@nestjs/common';
// import * as puppeteer from 'puppeteer';
// import * as Handlebars from 'handlebars';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class PdfRendererService {
//   async render(templateName: string, data: any): Promise<Buffer> {
//     const templatePath = path.join(
//       process.cwd(),
//       'src/reporte/templates',
//       `${templateName}.hbs`,
//     );

//     const cssPath = path.join(process.cwd(), 'src/reporte/styles/pdf.css');

//     const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
//     const css = fs.readFileSync(cssPath, 'utf8');

//     const compile = Handlebars.compile(htmlTemplate);

//     const html = compile({
//       ...data,
//       css, // 👈 inyectamos CSS puro
//     });

//     const browser = await puppeteer.launch({
//       headless: 'shell',
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     });

//     const page = await browser.newPage();

//     await page.setContent(html, {
//       waitUntil: 'networkidle0',
//     });

//     const pdf = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//     });

//     await browser.close();

//     return Buffer.from(pdf);
//   }
// }

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfRendererService implements OnModuleInit {
  onModuleInit() {
    // 👇 Helper para inyectar JSON real en el template
    Handlebars.registerHelper('json', (context) => {
      return JSON.stringify(context);
    });
  }

  async render(templateName: string, data: any): Promise<Buffer> {
    const templatePath = path.join(
      process.cwd(),
      'src/reporte/templates',
      `${templateName}.hbs`,
    );

    const cssPath = path.join(process.cwd(), 'src/reporte/styles/pdf.css');

    const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');

    const compile = Handlebars.compile(htmlTemplate);

    const html = compile({
      ...data,
      css,
    });

    const browser = await puppeteer.launch({
      // headless: 'shell', dev mode
      headless: true,
      // executablePath: '/usr/bin/chromium',
      executablePath:
        process.env.NODE_ENV === 'production' ? '/usr/bin/chromium' : undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // `finally` y no una llamada suelta al final: si algo falla entre medias,
    // el navegador se quedaba abierto. Dos informes fallidos dejaron 49
    // procesos de Chromium vivos en la máquina.
    try {
      const page = await browser.newPage();

      // `domcontentloaded` y no `networkidle0`: el `networkidle0` espera
      // también a las imágenes, y el logo de la empresa es una URL externa.
      // Con una que no responde —pasó con el `loremflickr` de los datos de
      // prueba— Puppeteer agotaba sus 30 s por defecto y el informe entero
      // respondía un 500. Los `<script>` del CDN sí bloquean
      // `domcontentloaded`, así que Chart.js ya está cargado en este punto.
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      // Lo que de verdad hay que esperar: que Chart.js haya pintado. Con
      // `animation: false` es inmediato, pero el margen cubre una máquina
      // lenta. Un informe "sin evaluar" no monta ningún canvas.
      await page
        .waitForFunction(
          () => {
            const canvas = Array.from(document.querySelectorAll('canvas'));
            return (
              canvas.length === 0 ||
              canvas.every((c) => c.toDataURL().length > 5000)
            );
          },
          { timeout: 15000 },
        )
        .catch(() => undefined);

      // Las imágenes van aparte y con poco margen: si el logo no carga, el
      // informe sale sin logo, que es mucho mejor que no salir.
      await page
        .waitForFunction(
          () => Array.from(document.images).every((img) => img.complete),
          { timeout: 5000 },
        )
        .catch(() => undefined);

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
