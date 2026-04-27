/**
 * Pre-built email templates for Fursa.Link
 */

export function getOtpEmailHtml(name: string, otpCode: string, isNew: boolean = true) {
  const title = isNew ? "Verify Your Email Address" : "New Verification Code";
  const intro = isNew 
    ? `Thank you for registering at Fursa.Link. To activate your account, please enter the following 6-digit verification code.`
    : `You recently requested a new OTP code. Please enter the following 6-digit verification code.`;

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f4f8; padding: 40px 20px;">
      <div style="background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.12); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #0daaf9 0%, #14d590 100%); padding: 60px 40px; text-align: center; position: relative;">
          <div style="margin-bottom: 25px;">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/icon.png" alt="Logo" style="width: 80px; height: 80px; border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); border: 4px solid rgba(255,255,255,0.3);" />
          </div>
          <h1 style="color: white; margin: 0; font-size: 38px; font-weight: 950; letter-spacing: -1.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Fursa.Link</h1>
          <div style="margin-top: 15px;">
            <span style="background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 50px; color: white; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">IDENTITY VERIFICATION</span>
          </div>
        </div>
        
        <div style="padding: 50px 40px; background-color: #ffffff;">
          <h2 style="color: #1e293b; font-size: 26px; font-weight: 800; margin-top: 0; margin-bottom: 16px; text-align: center;">${title}</h2>
          <p style="color: #475569; font-size: 17px; line-height: 1.7; margin-bottom: 24px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #475569; font-size: 17px; line-height: 1.7; margin-bottom: 32px;">${intro} This secure code will expire in exactly <span style="color: #ef4444; font-weight: bold;">15 minutes</span>.</p>
          
          <div style="margin: 40px 0; text-align: center; background: #f8fafc; padding: 50px 20px; border-radius: 24px; border: 2px solid #e2e8f0; position: relative;">
            <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: white; padding: 0 15px; color: #94a3b8; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">YOUR SECURE CODE</div>
            <span style="display: block; font-family: 'Monaco', 'Consolas', monospace; font-size: 64px; font-weight: 950; letter-spacing: 15px; color: #0daaf9; line-height: 1; margin: 0 auto; word-break: break-all;">${otpCode}</span>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-otp" style="background: #1e293b; color: white; padding: 20px 45px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 16px; box-shadow: 0 15px 30px rgba(0,0,0,0.1); display: inline-block; transition: all 0.3s ease;">Verify Account Now →</a>
          </div>
          
          <div style="border-top: 1px solid #f1f5f9; padding-top: 30px; margin-top: 60px;">
            <div style="text-align: center; margin-bottom: 25px;">
              <a href="https://chat.whatsapp.com/DDyMtIB3P1sImRGeliAjl4?mode=gi_t" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" width="24" height="24" alt="WhatsApp" />
              </a>
              <a href="https://www.youtube.com/@samu.connect" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/3670/3670147.png" width="24" height="24" alt="YouTube" />
              </a>
              <a href="https://www.instagram.com/stories/cyber.hub22/3882911736865151776?utm_source=ig_story_item_share&igsh=aHJjNHJ6aWVqeTY5" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/3670/3670125.png" width="24" height="24" alt="Instagram" />
              </a>
              <a href="https://x.com" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/5969/5969020.png" width="24" height="24" alt="X" />
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; text-align: center; line-height: 1.6;">If you didn't request this, you can safely ignore this email. Someone may have entered your email address by mistake.</p>
            <p style="color: #cbd5e1; font-size: 11px; text-align: center; margin-top: 25px; letter-spacing: 1px; font-weight: bold;">FURSA.LINK • EMPOWERING YOUR FUTURE</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
