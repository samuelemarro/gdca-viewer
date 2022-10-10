export default function handler(req, res) {
    if (req.query?.password == process.env.LOGIN_PASSWORD) {
        res.status(200).json(true)
    } else {
        res.status(401).json(false)
    }
    // res.status(200).json({ name: 'John Doe' })
  }
  