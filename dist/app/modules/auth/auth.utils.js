"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerifyEmailHtml = exports.generateResetPassHtml = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = ({ payload, secret, expiresIn }) => {
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.createToken = createToken;
const generateResetPassHtml = (link, name) => {
    return `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Password</title>
                </head>
                <body style="font-family: Roboto, sans-serif; background-color: transparent; padding: 20px;">
                        <div
                        style="
                            text-align: center;
                            font-family: Roboto;
                            max-width: 500px;
                            margin: 0 auto;
                            background-color: rgb(243, 241, 255);
                            padding: 20px 40px;
                            border-radius: 8px;
                            box-shadow: 0px 0px 41px -9px rgba(0,0,0,0.73);
                            -webkit-box-shadow: 0px 0px 41px -9px rgba(0,0,0,0.73);
                            -moz-box-shadow: 0px 0px 41px -9px rgba(0,0,0,0.73);
                        "
                        >
                        <h2 style="text-align: center; color: #4a2cf2">Reset Your Password</h2>
                        <img
                            style="height: 100px; width: 100%; object-fit: contain"
                            src="https://res.cloudinary.com/dsgqdey2a/image/upload/v1728095680/online-security_5354534_ly328d.png"
                            alt=""
                        />
                        <p style="font-size: 16px; line-height: 24px">
                            Hello ${(name === null || name === void 0 ? void 0 : name.firstName) + " " + (name === null || name === void 0 ? void 0 : name.middleName) + " " + (name === null || name === void 0 ? void 0 : name.lastName)},
                            <br />
                            We received a request to reset your password. Click the button below to reset it:
                        </p>
                        <div style="text-align: center; margin: 30px 0">
                            <a
                            href="${link}"
                            style="background-color: #4a2cf2; color: white; text-decoration: none; padding: 10px 20px; border-radius: 2px; font-size: 16px"
                            >
                            Reset Password
                            </a>
                        </div>
                        <p style="font-size: 16px; line-height: 24px">If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
                        <p style="font-size: 16px; line-height: 24px">
                            Thanks,
                            <br />
                            The GadgetGrid Team
                        </p>
                        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0" />

                        <p style="font-size: 12px; text-align: center">
                            If you're having trouble clicking the "Reset Password" button, copy and paste the following link into your web browser:
                            <br />
                            <a href="${link}">${link}</a>
                        </p>
                        </div>  
                    </body>
            </html>`;
};
exports.generateResetPassHtml = generateResetPassHtml;
const generateVerifyEmailHtml = (link, name) => {
    return `
        <div
        style="
            text-align: center;
            font-family: Roboto;
            max-width: 500px;
            margin: 0 auto;
            background-color: rgb(243, 241, 255);
            padding: 20px 40px;
            border-radius: 8px;
            box-shadow: 0px 0px 41px -9px rgba(0, 0, 0, 0.73);
            -webkit-box-shadow: 0px 0px 41px -9px rgba(0, 0, 0, 0.73);
            -moz-box-shadow: 0px 0px 41px -9px rgba(0, 0, 0, 0.73);
        "
        >
        <h2 style="text-align: center; color: #4a2cf2">Varify you email</h2>
        <img
            style="height: 100px; width: 100%; object-fit: contain"
            src="https://res.cloudinary.com/dsgqdey2a/image/upload/v1728097863/email_verify_guog7a.png"
            alt=""
        />
        <p style="font-size: 16px; line-height: 24px">
            Hello ${(name === null || name === void 0 ? void 0 : name.firstName) + " " + (name === null || name === void 0 ? void 0 : name.middleName) + " " + (name === null || name === void 0 ? void 0 : name.lastName)},
            <br />
            To varify your email please click on the link below.
        </p>
        <div style="text-align: center; margin: 30px 0">
            <a
            href="${link}"
            style="background-color: #4a2cf2; color: white; text-decoration: none; padding: 10px 20px; border-radius: 2px; font-size: 16px"
            >
            Varify Email
            </a>
        </div>
        <p style="font-size: 16px; line-height: 24px">
            If you did not request to verify your email, please ignore this email or contact support if you have any concerns.
        </p>
        <p style="font-size: 16px; line-height: 24px">
            Thanks,
            <br />
            The GadgetGrid Team
        </p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0" />

        <p style="font-size: 12px; text-align: center">
            If you're having trouble clicking the "Varify Email" button, copy and paste the following link into your web browser:
            <br />
            <a href="${link}">${link}</a>
        </p>
        </div>
    `;
};
exports.generateVerifyEmailHtml = generateVerifyEmailHtml;
