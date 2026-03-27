import { forwardRef, useRef, useCallback, type ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { AiCorrectionButton } from "@/components/modules/shared/ai-correction-button"

interface TextareaProps extends ComponentProps<"textarea"> {
  /** Afficher le bouton de correction IA (default: true). Mettre a false pour les champs techniques (JSON, code). */
  aiCorrection?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, aiCorrection = true, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null)

    // Combiner le ref externe et interne
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
        }
      },
      [ref]
    )

    // Appliquer la correction en declenchant un event natif pour que RHF detecte le changement
    const handleApply = useCallback((correctedText: string, selectionStart?: number, selectionEnd?: number) => {
      const textarea = internalRef.current
      if (!textarea) return

      let newValue: string
      if (selectionStart !== undefined && selectionEnd !== undefined) {
        const before = textarea.value.substring(0, selectionStart)
        const after = textarea.value.substring(selectionEnd)
        newValue = before + correctedText + after
      } else {
        newValue = correctedText
      }

      // Declencher un event natif pour React Hook Form / controlled components
      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set
      if (nativeSetter) {
        nativeSetter.call(textarea, newValue)
        textarea.dispatchEvent(new Event("input", { bubbles: true }))
      }
    }, [])

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex w-full rounded-lg border border-border bg-card/80 px-4 py-2 text-sm transition-all duration-200",
            "placeholder:text-muted-foreground/80",
            "hover:border-muted-foreground/40",
            "focus:outline-none focus:ring-1 focus:ring-[var(--module-accent,var(--color-ring))] focus:border-[var(--module-accent,var(--color-primary))]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-y",
            aiCorrection && "pr-10",
            className
          )}
          lang="fr"
          spellCheck={true}
          ref={setRefs}
          {...props}
        />
        {aiCorrection && (
          <AiCorrectionButton
            textareaRef={internalRef}
            onApply={handleApply}
            disabled={props.disabled}
            className="absolute bottom-1.5 right-1.5"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
