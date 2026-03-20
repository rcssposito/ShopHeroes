'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const username = formData.get('username') as string
  const email = `${username}@sh.com`

  const data = {
    email,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      redirect('/login?message=' + encodeURIComponent('Sua conta foi criada, mas o Supabase exige confirmação de email. Vá em "Authentication -> Providers -> Email" e DESATIVE a opção "Confirm Email" para usar usuários simplificados.'))
    }
    redirect('/login?message=' + encodeURIComponent('Não foi possível entrar. ' + error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const username = formData.get('username') as string
  const email = `${username}@shopheroes.local`

  const data = {
    email,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?message=' + encodeURIComponent('Não foi possível criar a conta. ' + error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
