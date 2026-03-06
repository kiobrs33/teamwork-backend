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
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // await new Promise((resolve) => setTimeout(resolve, 2000)); prod

    await page.waitForSelector('canvas');

    // 🔥 CLAVE: esperar a que Chart.js pinte el canvas
    // await page.waitForFunction(() => {
    //   const canvas = document.querySelector('canvas');
    //   return canvas && canvas.toDataURL().length > 1000;
    // });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    return Buffer.from(pdf);
  }
}
