import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Requirement {
  label: string
  met: boolean
}

interface PasswordStrengthMeterProps {
  password?: string
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const [requirements, setRequirements] = useState<Requirement[]>([
    { label: "Minimal 12 karakter", met: false },
    { label: "Minimal 1 huruf besar", met: false },
    { label: "Minimal 1 huruf kecil", met: false },
    { label: "Minimal 1 angka", met: false },
    { label: "Minimal 1 karakter spesial", met: false },
  ])

  useEffect(() => {
    setRequirements([
      { label: "Minimal 12 karakter", met: password.length >= 12 },
      { label: "Minimal 1 huruf besar", met: /[A-Z]/.test(password) },
      { label: "Minimal 1 huruf kecil", met: /[a-z]/.test(password) },
      { label: "Minimal 1 angka", met: /[0-9]/.test(password) },
      { label: "Minimal 1 karakter spesial", met: /[^A-Za-z0-9]/.test(password) },
    ])
  }, [password])

  const strength = requirements.filter((r) => r.met).length
  const strengthColor = 
    strength <= 2 ? "bg-red-500" : 
    strength <= 4 ? "bg-yellow-500" : 
    "bg-green-500"
  
  const strengthLabel = 
    strength === 0 ? "" :
    strength <= 2 ? "Lemah" : 
    strength <= 4 ? "Sedang" : 
    "Kuat"

  return (
    <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Kekuatan Password: <span className={cn("ml-1 font-bold", strength <= 2 ? "text-red-500" : strength <= 4 ? "text-yellow-500" : "text-green-500")}>{strengthLabel}</span>
        </span>
        <span className="text-xs text-muted-foreground">{strength}/5</span>
      </div>
      
      <div className="flex gap-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={cn(
              "flex-1 transition-all duration-500",
              strength >= lvl ? strengthColor : "bg-transparent"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 pt-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={cn(
              "shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300",
              req.met ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground/50"
            )}>
              {req.met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
            </div>
            <span className={cn(
              "text-[11px] transition-colors duration-300",
              req.met ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
