import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed });
  res.status(201).json({ message: 'User created' });
};

// export const login = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
    
//     if (!user || user.password !== password) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { id: user._id, username: user.username },
//       process.env.JWT_SECRET || 'moveinsync-secret',
//       { expiresIn: '5m' }  // 5 MINUTES EXPIRY
//     );

//     // Store in httpOnly cookie + return in body
//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: false, // true in production
//       sameSite: 'strict',
//       maxAge: 5 * 60 * 1000 // 5 minutes
//     });

//     res.json({ token, message: 'Login successful' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
  res.json({ token });
};


