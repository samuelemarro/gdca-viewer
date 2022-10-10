export default function handler(req, res) {
    if (req.query?.password.toLowerCase() == process.env.LOGIN_PASSWORD.toLowerCase()) {
        res.status(200).json(true)
    } else {
        res.status(401).json(false)
    }
    // res.status(200).json({ name: 'John Doe' })
  }
  