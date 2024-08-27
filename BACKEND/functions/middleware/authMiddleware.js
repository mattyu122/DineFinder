const auth = require('../config/firebaseConfig');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user.id = decodedToken; // Add the decoded token to the request object
      next();
    } catch (error) {
      res.status(401).send({ message: 'Unauthorized from middleware 1' });
    }
  } else {
    res.status(401).send({ message: 'Unauthorized from middleware 2' });
  }
};

module.exports = authenticateToken;
