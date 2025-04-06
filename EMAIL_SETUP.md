# Email Setup Instructions

This application uses Mailgun to send real emails for verification and other purposes. Follow these instructions to set up Mailgun for your application.

## Setting Up Mailgun

1. **Create a Mailgun Account**:
   - Go to [Mailgun.com](https://www.mailgun.com/) and sign up for an account
   - Verify your account and add a payment method (required even for the free tier)

2. **Add and Verify a Domain**:
   - In your Mailgun dashboard, go to "Domains" and click "Add New Domain"
   - Follow the instructions to add and verify your domain
   - If you don't have a domain, you can use the sandbox domain provided by Mailgun (limited to authorized recipients only)

3. **Get Your API Key**:
   - In your Mailgun dashboard, go to "API Keys"
   - Copy your "Private API Key"

4. **Update Your Environment Variables**:
   - Open the `.env.local` file in the root of your project
   - Update the following variables:
     ```
     MAILGUN_API_KEY=your_mailgun_api_key
     MAILGUN_DOMAIN=sandbox17bdad0471cf4e8a90689b5205641894.mailgun.org
     MAILGUN_FROM="Mailgun Sandbox <postmaster@sandbox17bdad0471cf4e8a90689b5205641894.mailgun.org>"
     MAILGUN_RECIPIENT=adarsh.kr29@gmail.com
     ```
   - Replace `your_mailgun_api_key` with your actual API key from Mailgun

5. **Restart Your Development Server**:
   - Stop your current Next.js server (Ctrl+C in the terminal)
   - Start it again with `npm run dev`

## Using the Sandbox Domain

If you're using the Mailgun sandbox domain:

1. You can only send emails to authorized recipients
2. To authorize a recipient:
   - Go to your Mailgun dashboard
   - Select your sandbox domain
   - Go to "Authorized Recipients"
   - Add the email address you want to send to

## Testing Email Functionality

1. **Sign Up with a Real Email**:
   - Fill out the signup form with a real email address
   - Submit the form

2. **Check Your Email**:
   - Check your inbox for the verification email
   - If you don't see it, check your spam folder
   - If you're using the sandbox domain, make sure the email is authorized

3. **Verify Your Account**:
   - Click the verification link in the email or use the verification code

## Troubleshooting

If you're not receiving emails:

1. **Check Mailgun Logs**:
   - Go to your Mailgun dashboard
   - Go to "Logs" to see if the emails are being sent

2. **Check Your Environment Variables**:
   - Make sure your API key and domain are correct

3. **Check the Console**:
   - Look for any error messages in your server console

4. **Use the Development Email Viewer**:
   - If real email sending fails, the system will fall back to the development email service
   - Access the development email viewer at `/dev/emails`
   - Or use the link on the check email page

## Production Considerations

For production:

1. **Use a Dedicated Domain**:
   - Set up a dedicated domain or subdomain for sending emails
   - Verify the domain with Mailgun

2. **Set Up Domain Authentication**:
   - Configure SPF, DKIM, and DMARC records for better deliverability

3. **Monitor Your Email Sending**:
   - Use Mailgun's analytics to monitor delivery rates, opens, and clicks

4. **Implement Email Templates**:
   - Create reusable email templates for consistent branding
