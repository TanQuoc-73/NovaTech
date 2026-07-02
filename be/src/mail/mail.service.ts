import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

type OrderConfirmationEmail = {
  to: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOrderConfirmation(payload: OrderConfirmationEmail) {
    const transporter = this.createTransporter();

    if (!transporter) {
      this.logger.warn(
        'SMTP is not configured. Skip order confirmation email.',
      );
      return;
    }

    const from =
      this.configService.get<string>('MAIL_FROM') ??
      this.configService.get<string>('SMTP_USER');

    await transporter.sendMail({
      from,
      to: payload.to,
      subject: `NovaTech xac nhan don hang ${payload.orderNumber}`,
      text: this.buildText(payload),
      html: this.buildHtml(payload),
    });
  }

  private createTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 465);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  private buildText(payload: OrderConfirmationEmail) {
    return [
      `Xin chao ${payload.customerName},`,
      '',
      `NovaTech da nhan don hang ${payload.orderNumber}.`,
      `Tong thanh toan: ${this.formatCurrency(payload.totalAmount)}.`,
      '',
      'Chung toi se lien he va xu ly don hang trong thoi gian som nhat.',
      'Cam on ban da mua sam tai NovaTech.',
    ].join('\n');
  }

  private buildHtml(payload: OrderConfirmationEmail) {
    return `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1c1917">
        <h2>NovaTech da nhan don hang cua ban</h2>
        <p>Xin chao <strong>${this.escapeHtml(payload.customerName)}</strong>,</p>
        <p>Don hang <strong>${payload.orderNumber}</strong> da duoc tao thanh cong.</p>
        <p>Tong thanh toan: <strong>${this.formatCurrency(payload.totalAmount)}</strong></p>
        <p>Chung toi se lien he va xu ly don hang trong thoi gian som nhat.</p>
        <p>Cam on ban da mua sam tai NovaTech.</p>
      </div>
    `;
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
