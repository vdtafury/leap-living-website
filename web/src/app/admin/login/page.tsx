import { redirect } from 'next/navigation'
import { SIGN_IN_PATH } from '@/server/auth/current'

/** Old admin sign-in address: everyone signs in on the shared page now (D-41). */
export default function AdminLoginRedirect() {
  redirect(SIGN_IN_PATH)
}
