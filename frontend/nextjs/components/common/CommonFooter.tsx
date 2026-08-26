// Mirrors vue_js/src/fo/components/common/CommonFooter.vue
export default function CommonFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <img
            src="/img/brand/logo-horizontal.png"
            alt="Ctrl + F"
            width={119}
            height={20}
            className="h-5 w-auto opacity-60"
          />
          <p className="text-sm text-muted-foreground">
            © Copyright 2026. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
