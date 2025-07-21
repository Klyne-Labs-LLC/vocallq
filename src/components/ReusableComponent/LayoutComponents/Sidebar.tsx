'use client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Image from 'next/image'
import { sidebarData } from '@/lib/data'
import { UserButton } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <div className="w-18 sm:w-24 h-screen fixed top-0 left-0 bottom-0 py-10 px-2 sm:px-6 border-r bg-background border-border flex flex-col items-center justify-start gap-10 z-50">
      <div className="">
        <Image src="/logo.svg" alt="VocallQ Logo" width={56} height={56} />
      </div>
      {/* Sidebar Menu */}
      <div className="w-full h-full justify-between items-center flex flex-col">
        <div className="w-full h-fit flex flex-col gap-4 items-center justify-center ">
          {sidebarData.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger>
                  <Link
                    href={item.link}
                    className={`flex items-center gap-2 cursor-pointer rounded-lg p-2 
                    ${pathname.includes(item.link) ? 'iconBackground' : ''}`}
                  >
                    <item.icon
                      className={`w-4 h-4 ${pathname.includes(item.link) ? '' : 'opacity-80'}`}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="text-sm">{item.title}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <UserButton 
          appearance={{
            baseTheme: dark,
            elements: {
              avatarBox: "w-10 h-10",
              userButtonPopoverCard: "bg-card border border-border shadow-lg dark:bg-card dark:border-border",
              userButtonPopoverActionButton: "text-card-foreground hover:bg-accent dark:text-card-foreground dark:hover:bg-accent",
              userButtonPopoverActionButtonText: "text-card-foreground dark:text-card-foreground",
              userButtonPopoverActionButtonIcon: "text-card-foreground dark:text-card-foreground",
              userButtonPopoverFooter: "bg-card border-t border-border dark:bg-card dark:border-border"
            }
          }}
        />
      </div>
    </div>
  )
}

export default Sidebar
