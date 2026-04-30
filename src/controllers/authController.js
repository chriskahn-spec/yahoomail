import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { supabase } from '../config/supabase.js';
import { sendOTP } from '../services/twilio.js';

// Login with email & password
export const login = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    // Validate input
    if (!email || !password || !phone) {
      return res.status(400).json({ error: 'Email, password, and phone are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Fetch user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update user phone number
    await supabase
      .from('users')
      .update({ phone })
      .eq('id', user.id);

    // Generate OTP and send via SMS
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    await supabase
      .from('otp_codes')
      .insert([
        {
          user_id: user.id,
          code: otp,
          expires_at: expiresAt,
          attempts: 0
        }
      ]);

    // Send OTP via Twilio
    await sendOTP(phone, otp);

    // Return user data and session
    res.status(200).json({
      message: 'OTP sent to your phone',
      userId: user.id,
      email: user.email,
      password: password,
      requiresOTP: true
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Verify OTP & complete login
export const verifyOTP = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and OTP code are required' });
    }

    // Fetch OTP record
    const { data: otpRecord, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .single();

    if (error || !otpRecord) {
      return res.status(401).json({ error: 'Invalid OTP code' });
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(401).json({ error: 'OTP code expired' });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return res.status(401).json({ error: 'Too many attempts. Try again later.' });
    }

    // Mark OTP as verified
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Fetch user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, phone')
      .eq('id', userId)
      .single();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set secure cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Create login session
    await supabase
      .from('login_sessions')
      .insert([
        {
          user_id: user.id,
          email: user.email,
          phone: user.phone,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          token,
          login_time: new Date(),
          is_active: true
        }
      ]);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const token = req.cookies.authToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Mark session as inactive
      await supabase
        .from('login_sessions')
        .update({ is_active: false })
        .eq('user_id', decoded.userId)
        .eq('token', token);
    }

    res.clearCookie('authToken');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, phone, created_at')
      .eq('id', req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};