import jwt from "jsonwebtoken";

type TCreateToken = {
  payload: {userRole: string; email: string};
  secret: string;
  expiresIn: string;
};

export const createToken = ({payload, secret, expiresIn}: TCreateToken) => {
  return jwt.sign(payload, secret, {expiresIn});
};

export const generateResetPassHtml = (link: string) => {
  return `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Password</title>
                </head>
                <body style="font-family: Roboto, sans-serif; background-color: transparent; padding: 20px;">
                    <div style="color:white; max-width: 600px; margin: 0 auto; background-color: purple; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="text-align: center; color: white;">Reset Your Password</h2>
                        <p style="font-size: 16px;">
                            Hello, <br><br>
                            We received a request to reset your password. Click the button below to reset it:
                        </p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${link}" style="background-color: #007bff; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Reset Password</a>
                        </div>
                        <p style="font-size: 14px;">
                            If you did not request a password reset, please ignore this email or contact support if you have any concerns.
                        </p>
                        <p style="font-size: 14px;">
                            Thanks,<br>
                            The [Your Company Name] Team
                        </p>
                        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">

                          <p style="font-size: 12px;; text-align: center;">
                            If you're having trouble clicking the "Reset Password" button, copy and paste the following link into your web browser: <br>
                            <a href="${link}">${link}</a>
                        </p>
                        
                    </div>
                    </body>
            </html>`;
};
