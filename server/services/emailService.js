const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Configure email transporter
const createTransporter = async () => {
  if (process.env.NODE_ENV === "production") {
    // Production: Use your actual email service (Gmail, SendGrid, etc.)
    return nodemailer.createTransport({
      service: "gmail", // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password for Gmail
      },
    });
  } else {
    // Development: Create Ethereal test account automatically
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.log("⚠️  Ethereal email failed, using console logging instead");
      // Fallback: return a fake transporter that just logs
      return {
        sendMail: async (mailOptions) => {
          console.log("\n📧 ===== EMAIL WOULD BE SENT =====");
          console.log("To:", mailOptions.to);
          console.log("Subject:", mailOptions.subject);
          console.log("Verification URL in email:", mailOptions.html.match(/href="([^"]*verify-email[^"]*)"/)?.[1] || "URL not found");
          console.log("==============================\n");
          return { messageId: "fake-message-id" };
        }
      };
    }
  }
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send verification email
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  try {
    const transporter = await createTransporter(); // FIXED: await the async function
    
    const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@queenb.org",
      to: email,
      subject: "QueenB - Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f43f5e, #fb7185); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">👑 Welcome to QueenB!</h1>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${firstName}!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Thank you for joining the QueenB community! To complete your registration and start your mentorship journey, please verify your email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #f43f5e, #fb7185); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #f43f5e; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This verification link will expire in 24 hours. If you didn't create an account with QueenB, please ignore this email.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2025 QueenB - Empowering Women in Tech
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== "production") {
      console.log("📧 Verification email sent!");
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("Preview URL: %s", previewUrl);
      }
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

// Send welcome email (after verification)
const sendWelcomeEmail = async (email, firstName, userType) => {
  try {
    const transporter = await createTransporter(); // FIXED: await the async function
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@queenb.org",
      to: email,
      subject: `Welcome to QueenB, ${firstName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f43f5e, #fb7185); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">👑 Welcome to QueenB!</h1>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Congratulations, ${firstName}!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Your email has been verified and your ${userType} account is now active! 🎉
            </p>
            
            ${userType === 'mentor' ? `
              <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                As a mentor, you're now part of our amazing community helping the next generation of women in tech. Don't forget to complete your profile to start connecting with mentees!
              </p>
            ` : `
              <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                As a mentee, you now have access to our incredible network of mentors ready to guide you on your tech journey. Start exploring mentors who match your interests!
              </p>
            `}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || "http://localhost:3000"}" 
                 style="background: linear-gradient(135deg, #f43f5e, #fb7185); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                Get Started
              </a>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2025 QueenB - Empowering Women in Tech
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome email sent to ${email}`);
    
  } catch (error) {
    console.error("Welcome email sending error:", error);
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
};