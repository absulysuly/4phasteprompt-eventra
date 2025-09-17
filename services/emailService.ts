interface VerificationEmail {
  to: string;
  subject: string;
  verificationCode: string;
  verificationLink: string;
  timestamp: Date;
  isUsed: boolean;
}

class EmailService {
  private sentEmails: VerificationEmail[] = [];
  private readonly baseUrl = 'https://eventra.app'; // This would be your actual domain

  /**
   * Simulates sending a verification email
   * In a real implementation, this would integrate with services like:
   * - SendGrid
   * - AWS SES
   * - Mailgun
   * - Nodemailer with SMTP
   */
  async sendVerificationEmail(email: string, language: 'en' | 'ar' = 'en'): Promise<{
    success: boolean;
    verificationCode: string;
    message?: string;
  }> {
    try {
      const verificationCode = this.generateVerificationCode();
      const verificationLink = `${this.baseUrl}/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`;
      
      const emailData: VerificationEmail = {
        to: email,
        subject: language === 'en' ? 'Verify Your Eventara Account' : 'تأكيد حساب إيفنتارا الخاص بك',
        verificationCode,
        verificationLink,
        timestamp: new Date(),
        isUsed: false
      };

      // Store the email (in a real app, this would be stored in a database)
      this.sentEmails.push(emailData);

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you would call your email service here
      console.log('📧 Verification Email Sent (SIMULATION)');
      console.log('-------------------------------------------');
      console.log(`To: ${email}`);
      console.log(`Subject: ${emailData.subject}`);
      console.log(`Verification Code: ${verificationCode}`);
      console.log(`Verification Link: ${verificationLink}`);
      console.log('-------------------------------------------');
      console.log('Email content would contain:');
      console.log(this.getEmailTemplate(email, verificationCode, verificationLink, language));

      return {
        success: true,
        verificationCode,
        message: language === 'en' 
          ? `Verification email sent to ${email}. Check console for simulation details.`
          : `تم إرسال رسالة التحقق إلى ${email}. راجع وحدة التحكم للحصول على تفاصيل المحاكاة.`
      };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return {
        success: false,
        verificationCode: '',
        message: language === 'en' 
          ? 'Failed to send verification email. Please try again.'
          : 'فشل في إرسال رسالة التحقق. حاول مرة أخرى.'
      };
    }
  }

  async verifyEmail(email: string, code: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const emailRecord = this.sentEmails.find(
      record => record.to === email && record.verificationCode === code && !record.isUsed
    );

    if (!emailRecord) {
      return {
        success: false,
        message: 'Invalid or expired verification code'
      };
    }

    // Check if the code is expired (24 hours)
    const isExpired = Date.now() - emailRecord.timestamp.getTime() > 24 * 60 * 60 * 1000;
    if (isExpired) {
      return {
        success: false,
        message: 'Verification code has expired'
      };
    }

    // Mark as used
    emailRecord.isUsed = true;

    return {
      success: true,
      message: 'Email verified successfully'
    };
  }

  async resendVerificationEmail(email: string, language: 'en' | 'ar' = 'en'): Promise<{
    success: boolean;
    verificationCode: string;
    message?: string;
  }> {
    // Invalidate any existing unused codes for this email
    this.sentEmails.forEach(record => {
      if (record.to === email && !record.isUsed) {
        record.isUsed = true;
      }
    });

    // Send new verification email
    return this.sendVerificationEmail(email, language);
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private getEmailTemplate(email: string, code: string, link: string, language: 'en' | 'ar'): string {
    if (language === 'ar') {
      return `
مرحباً!

شكراً لك على التسجيل في إيفنتارا. لإكمال تسجيلك، يرجى تأكيد عنوان بريدك الإلكتروني.

رمز التحقق الخاص بك: ${code}

أو انقر على الرابط التالي:
${link}

هذا الرمز صالح لمدة 24 ساعة فقط.

إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذه الرسالة.

مع أطيب التحيات،
فريق إيفنتارا
      `;
    }

    return `
Hello!

Thank you for signing up for Eventara. To complete your registration, please verify your email address.

Your verification code is: ${code}

Or click the following link:
${link}

This code is valid for 24 hours only.

If you didn't create this account, please ignore this email.

Best regards,
The Eventara Team
    `;
  }

  // Method to get sent emails for testing/debugging
  getSentEmails(): VerificationEmail[] {
    return this.sentEmails;
  }

  // Method to clear sent emails (for testing)
  clearSentEmails(): void {
    this.sentEmails = [];
  }
}

export const emailService = new EmailService();