import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('zibonbaba_token');
  cookieStore.delete('zibonbaba_role');
  cookieStore.delete('zibonbaba_user');
  redirect('/login');
}
