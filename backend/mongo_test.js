require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  profile_completed: { type: Boolean, default: false }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function runTest() {
  try {
    console.log('Connecting to MongoDB (bypassing strict TLS certificates)...');
    
    // Testing if an Antivirus/Proxy is intercepting the connection by allowing invalid certs
    await mongoose.connect(process.env.MONGODB_URI, {
      tlsAllowInvalidCertificates: true
    });
    console.log('Connected successfully!');

    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`\n--- INSERTING TEST USER ---`);
    const newUser = new User({
      email: testEmail,
      password: 'testpassword123',
      full_name: 'Test Setup User'
    });
    
    await newUser.save();
    console.log(`Successfully saved user with email: ${testEmail}`);

    console.log('\n--- CURRENT USERS IN DATABASE ---');
    const users = await User.find({}).select('-password');
    console.log(JSON.stringify(users, null, 2));

  } catch (err) {
    console.error('\n--- ERROR ---', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

runTest();
