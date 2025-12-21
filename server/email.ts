// Resend Email Integration
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableResendClient() {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: credentials.fromEmail
  };
}

// Send password reset email
export async function sendPasswordResetEmail(toEmail: string, resetToken: string, userName: string) {
  const { client, fromEmail } = await getUncachableResendClient();
  
  const resetUrl = `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const { data, error } = await client.emails.send({
    from: fromEmail || 'تطابق <noreply@resend.dev>',
    to: toEmail,
    subject: 'استعادة كلمة المرور - تطابق',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Tajawal', Arial, sans-serif; background: #f5f5f5; padding: 20px; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .logo { text-align: center; font-size: 32px; font-weight: bold; color: #16a34a; margin-bottom: 30px; }
          .content { text-align: center; }
          h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
          p { color: #666; font-size: 16px; line-height: 1.8; margin-bottom: 20px; }
          .button { display: inline-block; background: #16a34a; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; }
          .button:hover { background: #15803d; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-top: 20px; color: #92400e; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">تطابق</div>
          <div class="content">
            <h1>استعادة كلمة المرور</h1>
            <p>مرحباً ${userName}،</p>
            <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
            <p>اضغط على الزر أدناه لإعادة تعيين كلمة المرور:</p>
            <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
            <div class="warning">
              هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.
            </div>
          </div>
          <div class="footer">
            <p>تطابق - منصة التطابق العقاري الذكي</p>
            <p>هذه رسالة آلية، يرجى عدم الرد عليها.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('فشل إرسال البريد الإلكتروني');
  }

  return data;
}

// Send welcome email after registration
export async function sendWelcomeEmail(toEmail: string, userName: string) {
  const { client, fromEmail } = await getUncachableResendClient();
  
  const { data, error } = await client.emails.send({
    from: fromEmail || 'تطابق <noreply@resend.dev>',
    to: toEmail,
    subject: 'مرحباً بك في تطابق',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Tajawal', Arial, sans-serif; background: #f5f5f5; padding: 20px; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .logo { text-align: center; font-size: 32px; font-weight: bold; color: #16a34a; margin-bottom: 30px; }
          .content { text-align: center; }
          h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
          p { color: #666; font-size: 16px; line-height: 1.8; margin-bottom: 20px; }
          .features { background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: right; }
          .features li { color: #166534; margin-bottom: 10px; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">تطابق</div>
          <div class="content">
            <h1>أهلاً بك في تطابق!</h1>
            <p>مرحباً ${userName}،</p>
            <p>شكراً لانضمامك إلى منصة تطابق - منصة التطابق العقاري الذكي في السعودية.</p>
            <div class="features">
              <ul>
                <li>البحث الذكي عن العقارات المناسبة</li>
                <li>مطابقة تلقائية بين البائعين والمشترين</li>
                <li>إشعارات فورية بالعروض الجديدة</li>
                <li>تواصل مباشر مع الملاك</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>تطابق - منصة التطابق العقاري الذكي</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - welcome email is not critical
  }

  return data;
}
