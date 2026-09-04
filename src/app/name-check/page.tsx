import { redirect } from 'next/navigation';

export default function NameCheckRedirectPage() {
  redirect('/is-it-taken');
}
