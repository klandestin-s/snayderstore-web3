// api/verify-recaptcha.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { token } = req.body;
  const secretKey = "6LfZknsrAAAAAH3vnc-F2bNoEhqqDCKlnUOPSLLI"; // Secret key langsung

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: 'POST' }
    );
    
    const data = await response.json();
    res.status(200).json({
      success: data.success,
      score: data.score,
      action: data.action
    });
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
