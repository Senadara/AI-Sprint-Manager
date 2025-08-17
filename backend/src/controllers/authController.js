const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Cek email sudah dipakai atau belum
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already used' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek user ada atau tidak
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Wrong password' });

    // Buat token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    // console.log('User logged in:', user.username);
    res.json({ message: 'Login success', token, userData: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
