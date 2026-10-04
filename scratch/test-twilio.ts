import 'dotenv/config';
import twilio from 'twilio';

interface TwilioFailure {
  code?: number | string;
  status?: number;
  message?: string;
}

async function testTwilio() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  console.log('--- Twilio Configuration Check ---');
  console.log('Account SID:', accountSid ? (accountSid.startsWith('AC') && accountSid.length > 30 ? 'VALID format' : 'INVALID format (must start with AC)') : 'MISSING');
  console.log('Auth Token:', authToken ? (authToken === 'your_twilio_auth_token' ? 'PLACEHOLDER' : 'PRESENT') : 'MISSING');
  console.log('From Number:', fromNumber ? (fromNumber === '+1234567890' ? 'PLACEHOLDER' : fromNumber) : 'MISSING');

  if (!accountSid || !authToken || !fromNumber || accountSid.includes('xxx') || authToken.includes('your_twilio')) {
    console.error('\nERROR: Twilio environment variables are still set to placeholder values.');
    process.exit(1);
  }

  const client = twilio(accountSid, authToken);

  try {
    console.log('\nValidating account with Twilio...');
    const account = await client.api.v2010.accounts(accountSid).fetch();
    console.log('SUCCESS: Connected to Twilio account:', account.friendlyName);
    console.log('Account Status:', account.status);
    
    console.log('\nChecking "From" number availability...');
    const incomingNumbers = await client.incomingPhoneNumbers.list({ phoneNumber: fromNumber });
    if (incomingNumbers.length > 0) {
      console.log('SUCCESS: From number', fromNumber, 'is verified and available in your account.');
    } else {
      console.log('WARNING: From number', fromNumber, 'was not found in your list of incoming numbers. If this is a trial or verified personal number, it might still work, but ideally use a Twilio-purchased number.');
    }

    console.log('\nTwilio is GOOD TO GO!');
  } catch (error: unknown) {
    const failure = error as TwilioFailure;

    console.error('\nFAILED: Twilio authentication or configuration error.');
    console.error('Error Code:', failure.code ?? 'unknown');
    console.error('Message:', failure.message ?? 'Unknown Twilio error');
    if (failure.status === 401) {
      console.error('ACTION: Please double check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in the .env file.');
    }
    process.exit(1);
  }
}

testTwilio();
