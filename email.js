const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || require('./apiKey');
const User = require('./models/user');
const {formatTime} = require('./helpers');

sgMail.setApiKey(SENDGRID_API_KEY);

const createMsg = (recipient, data, variance) => {
    let subject;
    let text;
    let html;
    if (variance) {
        const time = formatTime(data.countData.time);
        subject = `Variance in ${data.containerName}`;
        text = `Hi ${recipient.firstName}, ${data.userName} reported a
                variance of $${variance} in ${data.containerName} 
                at ${data.countData.time}.  Notes left: ${data.countData.note}`
        html = `<p>
                    Hi ${recipient.firstName},<br/> 
                    ${data.userName} reported a
                        variance of $${variance} in ${data.containerName} 
                        at ${time}.<br/>
                    Target: $${data.target}<br/>
                    Count: $${data.countData.cash.toFixed(2)}<br/>
                    Notes: ${data.countData.note || 'none'}
                </p>`
    } else {
        subject = 'CashCount Password Reset';
        text = `Hi ${recipient.firstName}, it looks like you requested a
                password reset.  Your new password is ${data.password}. 
                Please reset this to something you will remember when you log in.`
        html = `<p>
                    Hi ${recipient.firstName}.<br/>
                    It looks like you requested a password reset.  
                        Your new password is ${data.password}.<br/>
                    Please reset this to something you will remember when you log in.
                </p>`
    }
    const msg = {
        to: recipient.email,
        from: 'cashcountnotification@gmail.com',
        subject,
        text,
        html
    };
    return msg;
};

const sendEmail = async (recipient, data, variance=null) => {
    const msg = createMsg(recipient, data, variance);
    try {
        await sgMail.send(msg);
    } catch (err) {
        console.error(err);
    };
};

const sendVarianceEmail = async (variance, companyCode, data) => {
    const users = await User.getAll(companyCode);
    const recipients = users.filter(u => u.adminCompanyCode && u.emailReceiver);
    for (let recipient of recipients) {
        await sendEmail(recipient, data, variance);
    };
};

const sendPasswordReset = async (recipient, data) => {
    await sendEmail(recipient, data);
};

module.exports = {sendVarianceEmail, sendPasswordReset};