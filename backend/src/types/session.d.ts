import "express-session"
import { SessionUser } from "./user.types"

// Tells TypeScript that req.session.user exists
declare module "express-session" {
  interface SessionData {
    user: SessionUser
  }
}
