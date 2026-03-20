'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { login, signup } from './actions'

export function LoginForm({ message }: { message?: string }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-[#161616] border border-[#393939] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#3d5afe]/10 to-transparent pointer-events-none" />
      
      <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">
        ACESSO <span className="text-[#3d5afe] not-italic">RESTRITO</span>
      </h1>
      <p className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.3em] mb-10 border-b border-[#393939] pb-6">
        Sistema de Planejamento Estratégico
      </p>
      
      {message && (
        <div className="mb-8 p-4 bg-red-950/20 border-l-4 border-red-600 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
          {message}
        </div>
      )}
      
      <form className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 group/input text-left">
          <label className="text-[10px] font-black text-[#a8a8a8] uppercase tracking-[0.2em] group-focus-within/input:text-[#3d5afe] transition-colors" htmlFor="username">
            ID DE USUÁRIO
          </label>
          <input 
            className="bg-black border border-[#393939] text-white p-4 text-sm focus:border-[#3d5afe] outline-none transition-all placeholder:text-[#262626] font-medium"
            id="username" 
            name="username" 
            type="text" 
            required 
            placeholder="NOME_DO_JOGADOR"
          />
        </div>
        
        <div className="flex flex-col gap-3 group/input text-left">
          <label className="text-[10px] font-black text-[#a8a8a8] uppercase tracking-[0.2em] group-focus-within/input:text-[#3d5afe] transition-colors" htmlFor="password">
            CHAVE DE ACESSO
          </label>
          <div className="relative">
            <input 
              className="bg-black border border-[#393939] text-white p-4 pr-12 text-sm focus:border-[#3d5afe] outline-none transition-all placeholder:text-[#262626] w-full"
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white transition-colors p-1"
              title={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mt-4">
          <SubmitButton 
            text="AUTENTICAR" 
            formAction={login} 
            variant="primary" 
          />
          
          <SubmitButton 
            text="CADASTRAR NOVO OPERADOR" 
            formAction={signup} 
            variant="secondary" 
          />
        </div>
      </form>
      
      <div className="mt-12 pt-8 border-t border-[#393939] flex justify-between items-center opacity-30 group-hover:opacity-100 transition-opacity">
         <div className="text-[9px] font-black uppercase tracking-widest text-[#525252]">
            SH_PLANNER_V4.0
         </div>
         <div className="w-2 h-2 bg-[#3d5afe] rounded-full animate-ping" />
      </div>
    </div>
  )
}

function SubmitButton({ text, formAction, variant }: { text: string, formAction: (formData: FormData) => void, variant: 'primary' | 'secondary' }) {
  const { pending } = useFormStatus()
  
  const styles = {
    primary: "bg-[#3d5afe] text-white font-black text-[12px] tracking-[0.2em] uppercase py-5 transition-all hover:bg-white hover:text-black border-2 border-[#3d5afe] hover:border-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3",
    secondary: "bg-transparent text-[#a8a8a8] font-black text-[10px] tracking-widest uppercase py-4 border border-[#393939] hover:text-white hover:border-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
  }

  return (
    <button 
      formAction={formAction}
      disabled={pending}
      className={styles[variant]}
    >
      {pending ? (
        <>
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          PROCESSANDO...
        </>
      ) : text}
    </button>
  )
}
